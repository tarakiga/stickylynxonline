import * as React from "react"
import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { DarkModeToggle } from "@/components/dashboard/DarkModeToggle"
import { HeaderAvatar } from "@/components/dashboard/HeaderAvatar"
import { getTeamProjectHubSections, normalizeTeamProjectMembers, TEAM_PROJECT_HUB_CATEGORY } from "@/lib/team-project-hub"
import { getPageWithBlocksById } from "@/lib/page-loaders"

export default async function StageManagerEditorLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) {
    redirect(`/login?redirect_url=${encodeURIComponent(`/stage-manager/editor/${id}`)}`)
  }

  const page = await getPageWithBlocksById(id)
  if (!page || (page.category as string) !== TEAM_PROJECT_HUB_CATEGORY) {
    redirect("/dashboard")
  }

  const authProfile = await currentUser()
  const primaryEmail = authProfile?.emailAddresses[0]?.emailAddress?.toLowerCase() || null
  const teamMembers = normalizeTeamProjectMembers(
    await prisma.teamProjectMember.findMany({
      where: { pageId: page.id },
      orderBy: [{ createdAt: "asc" }],
    })
  )

  const member =
    teamMembers.find((entry) => entry.userId && entry.userId === userId) ||
    teamMembers.find((entry) => primaryEmail && entry.email === primaryEmail) ||
    null

  if (!member || member.status !== "ACTIVE") {
    redirect("/dashboard")
  }

  const sections = getTeamProjectHubSections(page.blocks || [])
  const managedStages = sections.timeline.stages.filter(
    (stage) => stage.stageOwnerType === "member" && stage.stageOwnerMemberId === member.id
  )

  if (!managedStages.length) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 border-b border-divider bg-surface/95 px-6 py-4 backdrop-blur sm:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold tracking-wide text-primary">
                Stage Manager Workspace
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-divider bg-background px-3 py-1 text-xs font-bold tracking-wide text-text-secondary">
                {managedStages.length} Stage{managedStages.length === 1 ? "" : "s"}
              </span>
            </div>
            <h1 className="mt-3 truncate text-2xl font-black tracking-tight text-text-primary">
              {page.title || page.handle}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {managedStages.length === 1
                ? `Managing ${managedStages[0]?.label || "Assigned Stage"}`
                : `Managing ${managedStages.map((stage) => stage.label || "Untitled Stage").join(", ")}`}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <DarkModeToggle />
            <HeaderAvatar />
          </div>
        </div>
      </header>
      <main className="flex-1 py-6">
        {children}
      </main>
    </div>
  )
}
