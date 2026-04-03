import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { NotificationEventType, PageCategory } from "@prisma/client"
import prisma from "@/lib/prisma"
import { EMAIL_COLORS } from "@/config/theme"
import { getNotificationQuota, sendPlanNotification } from "@/lib/notifications"
import { getTeamProjectHubSections } from "@/lib/team-project-hub"

type InviteRequestBody = {
  memberId?: string
  email?: string
}

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { userId } = await auth()
    const { handle } = await params

    const page = await prisma.page.findUnique({
      where: { handle },
      include: {
        user: true,
        teamProjectMembers: true,
        blocks: { orderBy: { order: "asc" } },
      },
    })

    if (!page) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (page.category !== PageCategory.TEAM_PROJECT_HUB) {
      return NextResponse.json({ error: "Not applicable" }, { status: 400 })
    }

    if (!userId || userId !== page.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as InviteRequestBody
    const normalizedEmail = String(body.email || "").trim().toLowerCase()
    const member =
      page.teamProjectMembers.find((entry) => entry.id === body.memberId) ||
      page.teamProjectMembers.find((entry) => normalizedEmail && entry.email.toLowerCase() === normalizedEmail)

    if (!member) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 })
    }

    if (!member.email) {
      return NextResponse.json({ error: "Team member email is required" }, { status: 400 })
    }

    if (member.status !== "ACTIVE") {
      return NextResponse.json({ error: "Only active team members can be invited" }, { status: 400 })
    }

    const quota = await getNotificationQuota(page.userId)
    if (!quota.allowed) {
      return NextResponse.json({ error: `Daily email notification limit reached (${quota.limit}).` }, { status: 429 })
    }

    const sections = getTeamProjectHubSections(page.blocks || [])
    const managedStages = sections.timeline.stages.filter((stage) => stage.stageOwnerType === "member" && stage.stageOwnerMemberId === member.id)
    const isStageManager = managedStages.length > 0
    const baseUrl = new URL(request.url).origin
    const destinationUrl = isStageManager
      ? `${baseUrl}/team-project/access?pageId=${encodeURIComponent(page.id)}&email=${encodeURIComponent(member.email)}`
      : `${baseUrl}/${page.handle}`

    const result = await sendPlanNotification({
      userId: page.userId,
      pageId: page.id,
      type: isStageManager ? NotificationEventType.TEAM_PROJECT_HUB_STAGE_MANAGER : NotificationEventType.TEAM_PROJECT_HUB_ALLOWLIST,
      to: member.email,
      subject: `${isStageManager ? "Stage Manager" : "Team Access"} Invitation: ${page.title || page.handle}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: ${EMAIL_COLORS.primary}; margin: 0 0 8px;">${isStageManager ? "Stage Manager Assignment" : "Team Project Hub Invitation"}</h2>
          <p style="margin: 0 0 12px;">Hello${member.name ? ` ${member.name}` : ""},</p>
          <p style="margin: 0 0 12px;">${page.user?.name || page.user?.email || "The workspace owner"} invited you to collaborate on <strong>${page.title || page.handle}</strong>.</p>
          ${isStageManager ? `<p style="margin: 0 0 12px;">You manage: <strong>${managedStages.map((stage) => stage.label).join(", ")}</strong>.</p>` : ""}
          <p style="margin: 16px 0;">
            <a href="${destinationUrl}" style="background: ${EMAIL_COLORS.primary}; color: ${EMAIL_COLORS.onPrimary}; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              ${isStageManager ? "Open Team Project Editor" : "Open Team Project Hub"}
            </a>
          </p>
          <p style="margin: 0; color:#64748b; font-size:12px;">Sign in with this email address to accept access automatically${isStageManager ? " and continue to the editor workspace" : ""}.</p>
        </div>
      `,
    })

    if (!result.ok) {
      if (result.quotaExceeded) {
        return NextResponse.json({ error: `Daily email notification limit reached (${result.limit}).` }, { status: 429 })
      }

      return NextResponse.json(
        { error: "Email failed", detail: typeof result.error === "string" ? result.error : result.response || "Unable to send invite email" },
        { status: 500 }
      )
    }

    await prisma.teamProjectMember.update({
      where: { id: member.id },
      data: { inviteSentAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      used: result.used,
      limit: result.limit,
      isStageManager,
    })
  } catch (error) {
    console.error("Team project invite failed", error)
    return NextResponse.json(
      { error: "Invite failed", detail: error instanceof Error ? error.message : "Unknown server error" },
      { status: 500 }
    )
  }
}
