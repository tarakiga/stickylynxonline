import * as React from "react"
import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { TeamProjectHubEditor } from "@/components/editor/TeamProjectHubEditor"
import { getTeamProjectHubSections, normalizeTeamProjectMembers, TEAM_PROJECT_HUB_CATEGORY } from "@/lib/team-project-hub"
import { getPageWithBlocksById } from "@/lib/page-loaders"

export default async function StageManagerEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect(`/login?redirect_url=${encodeURIComponent(`/stage-manager/editor/${id}`)}`)

  const page = await getPageWithBlocksById(id)
  if (!page || (page.category as string) !== TEAM_PROJECT_HUB_CATEGORY) {
    redirect("/dashboard")
  }

  const teamMembers = normalizeTeamProjectMembers(
    await prisma.teamProjectMember.findMany({
      where: { pageId: page.id },
      orderBy: [{ createdAt: "asc" }],
    })
  )
  const authProfile = await currentUser()
  const primaryEmail = authProfile?.emailAddresses[0]?.emailAddress?.toLowerCase() || null
  const member =
    teamMembers.find((entry) => entry.userId && entry.userId === userId) ||
    teamMembers.find((entry) => primaryEmail && entry.email === primaryEmail) ||
    null

  if (!member || member.status !== "ACTIVE") {
    redirect("/dashboard")
  }

  const pageOwner = await prisma.user.findUnique({ where: { id: page.userId } })
  const ownerName = pageOwner?.name || pageOwner?.email || "Project Owner"
  const sections = getTeamProjectHubSections(page.blocks || [])
  const managedStageIds = sections.timeline.stages
    .filter((stage) => stage.stageOwnerType === "member" && stage.stageOwnerMemberId === member.id)
    .map((stage) => stage.id)

  if (!managedStageIds.length) {
    redirect("/dashboard")
  }

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-12 w-full h-full min-h-screen relative">
      <div className="flex-1 w-full">
        <TeamProjectHubEditor
          page={page}
          initialMembers={teamMembers}
          ownerName={ownerName}
          mode="stage_manager"
          managedStageIds={managedStageIds}
        />
      </div>
    </div>
  )
}
