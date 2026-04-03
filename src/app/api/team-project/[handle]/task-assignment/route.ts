import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { NotificationEventType, PageCategory } from "@prisma/client"
import prisma from "@/lib/prisma"
import { EMAIL_COLORS } from "@/config/theme"
import { sendPlanNotification } from "@/lib/notifications"
import { getTeamProjectHubSections } from "@/lib/team-project-hub"

type AssignmentRequestBody = {
  stageId?: string
  taskId?: string
}

export const dynamic = "force-dynamic"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const page = await prisma.page.findUnique({
    where: { handle },
    include: {
      user: true,
      blocks: { orderBy: { order: "asc" } },
      teamProjectMembers: true,
    },
  })

  if (!page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (page.category !== PageCategory.TEAM_PROJECT_HUB) {
    return NextResponse.json({ error: "Not applicable" }, { status: 400 })
  }

  const body = (await request.json()) as AssignmentRequestBody
  const sections = getTeamProjectHubSections(page.blocks || [])
  const stage = sections.timeline.stages.find((entry) => entry.id === body.stageId)
  const task = stage?.tasks.find((entry) => entry.id === body.taskId)

  if (!stage || !task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  const isOwner = page.userId === userId
  if (!isOwner) {
    const authProfile = await currentUser()
    const email = authProfile?.emailAddresses[0]?.emailAddress?.toLowerCase() || null
    const member =
      page.teamProjectMembers.find((entry) => entry.userId && entry.userId === userId) ||
      page.teamProjectMembers.find((entry) => email && entry.email.toLowerCase() === email) ||
      null

    if (!member || member.status !== "ACTIVE") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const canManageStage = stage.stageOwnerType === "member" && stage.stageOwnerMemberId === member.id
    if (!canManageStage) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
  }

  if (!task.assigneeEmail) {
    return NextResponse.json({ error: "Assign a team member before sending a task notification" }, { status: 400 })
  }

  const assigneeMember = page.teamProjectMembers.find(
    (entry) => entry.id === task.assigneeMemberId || entry.email.toLowerCase() === task.assigneeEmail.toLowerCase()
  )

  const baseUrl = new URL(request.url).origin
  const result = await sendPlanNotification({
    userId: page.userId,
    pageId: page.id,
    type: NotificationEventType.TEAM_PROJECT_HUB_ASSIGNMENT,
    to: task.assigneeEmail,
    subject: `Task Assigned: ${task.title || "New Task"}`
    ,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: ${EMAIL_COLORS.primary}; margin: 0 0 8px;">New Task Assignment</h2>
        <p style="margin: 0 0 12px;">Hello${task.assigneeName ? ` ${task.assigneeName}` : ""},</p>
        <p style="margin: 0 0 12px;">${page.user?.name || page.user?.email || "The workspace owner"} assigned you a task in <strong>${page.title || page.handle}</strong>.</p>
        <div style="background: ${EMAIL_COLORS.surfaceMuted}; padding: 16px; border-radius: 12px; margin: 16px 0;">
          <p style="margin: 0 0 8px;"><strong>Stage:</strong> ${stage.label || "Untitled Stage"}</p>
          <p style="margin: 0 0 8px;"><strong>Task:</strong> ${task.title || "Untitled Task"}</p>
          <p style="margin: 0;"><strong>Due:</strong> ${task.deliveryDueAt ? new Date(task.deliveryDueAt).toLocaleDateString() : "No due date"}</p>
        </div>
        <p style="margin: 16px 0;">
          <a href="${baseUrl}/${page.handle}" style="background: ${EMAIL_COLORS.primary}; color: ${EMAIL_COLORS.onPrimary}; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Open Team Project Hub
          </a>
        </p>
        <p style="margin: 0; color:#64748b; font-size:12px;">Sign in with ${assigneeMember?.email || task.assigneeEmail} to view and submit your work.</p>
      </div>
    `,
  })

  if (!result.ok) {
    if (result.quotaExceeded) {
      return NextResponse.json({ error: `Daily email notification limit reached (${result.limit}).` }, { status: 429 })
    }

    return NextResponse.json({ error: "Email failed", detail: result.error || result.response }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    used: result.used,
    limit: result.limit,
    taskTitle: task.title,
    assigneeEmail: task.assigneeEmail,
  })
}
