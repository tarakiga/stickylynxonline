import prisma from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import type {
  TeamProjectMember,
  TeamProjectStage,
  TeamProjectTask,
} from "@/lib/team-project-hub"
import { getTeamProjectHubSections, normalizeTeamProjectMembers } from "@/lib/team-project-hub"

type TeamHubPageRecord = Prisma.PageGetPayload<{
  include: {
    user: true
    blocks: true
    teamProjectMembers: true
  }
}>

export type TeamHubViewer = {
  isOwner: boolean
  isAdmin: boolean
  member: TeamProjectMember | null
  canAccess: boolean
}

export async function getTeamProjectHubPage(handle: string) {
  return prisma.page.findUnique({
    where: { handle },
    include: {
      user: true,
      blocks: { orderBy: { order: "asc" } },
      teamProjectMembers: { orderBy: [{ createdAt: "asc" }] },
    },
  })
}

export async function resolveTeamHubViewer(params: {
  page: NonNullable<TeamHubPageRecord>
  userId: string | null
  email: string | null
}) {
  const { page, userId, email } = params
  const normalizedEmail = email?.toLowerCase().trim() || ""
  const members = normalizeTeamProjectMembers(page.teamProjectMembers)

  if (userId && userId === page.userId) {
    return {
      isOwner: true,
      isAdmin: false,
      member: null,
      canAccess: true,
    } satisfies TeamHubViewer
  }

  let member =
    members.find((entry) => entry.userId && userId && entry.userId === userId) ||
    members.find((entry) => normalizedEmail && entry.email === normalizedEmail) ||
    null

  if (member && !member.userId && userId && normalizedEmail && member.email === normalizedEmail) {
    await prisma.teamProjectMember.update({
      where: { id: member.id },
      data: { userId, inviteAcceptedAt: new Date() },
    })

    member = { ...member, userId, inviteAcceptedAt: new Date().toISOString() }
  }

  if (member && userId && member.userId === userId && !member.inviteAcceptedAt) {
    await prisma.teamProjectMember.update({
      where: { id: member.id },
      data: { inviteAcceptedAt: new Date() },
    })

    member = { ...member, inviteAcceptedAt: new Date().toISOString() }
  }

  return {
    isOwner: false,
    isAdmin: !!member && member.status === "ACTIVE" && member.role === "ADMIN",
    member,
    canAccess: !!member && member.status === "ACTIVE",
  } satisfies TeamHubViewer
}

export function getTeamHubStageById(page: NonNullable<TeamHubPageRecord>, stageId: string) {
  const sections = getTeamProjectHubSections(page.blocks || [])
  return sections.timeline.stages.find((stage) => stage.id === stageId) || null
}

export function getTeamHubTaskById(stage: TeamProjectStage | null, taskId: string) {
  if (!stage) return null
  return stage.tasks.find((task) => task.id === taskId) || null
}

export function canManageTeamHubStage(params: {
  viewer: TeamHubViewer
  stage: TeamProjectStage | null
}) {
  const { viewer, stage } = params
  if (viewer.isOwner) return true
  if (!viewer.member || viewer.member.status !== "ACTIVE" || !stage) return false
  return stage.stageOwnerType === "member" && stage.stageOwnerMemberId === viewer.member.id
}

export function canSubmitTeamHubTask(params: {
  viewer: TeamHubViewer
  task: TeamProjectTask | null
}) {
  const { viewer, task } = params
  if (!viewer.member || viewer.member.status !== "ACTIVE" || !task) return false
  return task.assigneeMemberId === viewer.member.id
}

export function canCommentOnTeamHubTask(params: {
  viewer: TeamHubViewer
  stage: TeamProjectStage | null
  task: TeamProjectTask | null
}) {
  if (!params.task) return false
  return canManageTeamHubStage({ viewer: params.viewer, stage: params.stage }) || canSubmitTeamHubTask({ viewer: params.viewer, task: params.task })
}
