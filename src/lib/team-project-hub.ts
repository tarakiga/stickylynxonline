import { findEditorBlock } from "@/types/editor-page"

export const TEAM_PROJECT_HUB_CATEGORY = "TEAM_PROJECT_HUB" as const

export type TeamProjectMemberStatus = "ACTIVE" | "SUSPENDED" | "REMOVED"
export type TeamProjectMemberRole = "ADMIN" | "CONTRIBUTOR"
export type TeamProjectStageOwnerType = "creator" | "member"
export type TeamProjectTaskStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "changes_requested"
  | "approved_done"

export type TeamProjectSubmissionType = "text" | "upload" | "link"

export type TeamProjectMember = {
  id: string
  pageId?: string
  userId?: string | null
  name: string
  email: string
  internalLabel?: string | null
  status: TeamProjectMemberStatus
  role: TeamProjectMemberRole
  inviteSentAt?: string | null
  inviteAcceptedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export type TeamProjectTaskSubmission = {
  id: string
  type: TeamProjectSubmissionType
  value: string
  note: string
  submittedAt: string
}

export type TeamProjectTaskComment = {
  id: string
  taskId: string
  authorUserId?: string | null
  authorName: string
  authorRole: "creator" | "stage_manager" | "assignee" | "member"
  body: string
  createdAt: string
  isCorrectionRequest: boolean
}

export type TeamProjectTask = {
  id: string
  stageId: string
  title: string
  description: string
  assigneeMemberId: string
  assigneeName: string
  assigneeEmail: string
  deliveryDueAt: string | null
  status: TeamProjectTaskStatus
  submission: TeamProjectTaskSubmission | null
  submittedAt: string | null
  approvedDoneAt: string | null
  changesRequestedAt: string | null
  comments: TeamProjectTaskComment[]
}

export type TeamProjectStage = {
  id: string
  label: string
  department: string
  dueDate: string | null
  status: string
  stageOwnerType: TeamProjectStageOwnerType
  stageOwnerMemberId: string | null
  stageOwnerName: string
  tasks: TeamProjectTask[]
}

export type TeamProjectHeaderContent = {
  section: "team_project_header"
  title: string
  department: string
  ownerName: string
  overallStatus: string
  summary: string
}

export type TeamProjectStatusContent = {
  section: "team_project_status"
  text: string
  manualText: string | null
}

export type TeamProjectTimelineContent = {
  section: "team_project_timeline"
  currentStep: number
  stages: TeamProjectStage[]
}

export type TeamProjectDeliverable = {
  id: string
  title: string
  description: string
  url: string
  fileName?: string
  resourceType?: string
  publicId?: string
  bytes?: number
}

export type TeamProjectDeliverablesContent = {
  section: "team_project_deliverables"
  items: TeamProjectDeliverable[]
}

export type TeamProjectHubSections = {
  header: TeamProjectHeaderContent
  status: TeamProjectStatusContent
  timeline: TeamProjectTimelineContent
  deliverables: TeamProjectDeliverablesContent
}

type EditorBlock = {
  type: string
  order: number
  content: Record<string, unknown>
}

function asRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value : ""
}

function ensureStatus(value: unknown): TeamProjectMemberStatus {
  return value === "SUSPENDED" || value === "REMOVED" ? value : "ACTIVE"
}

function ensureRole(value: unknown): TeamProjectMemberRole {
  return value === "ADMIN" ? "ADMIN" : "CONTRIBUTOR"
}

function ensureTaskStatus(value: unknown): TeamProjectTaskStatus {
  return value === "in_progress" ||
    value === "submitted" ||
    value === "changes_requested" ||
    value === "approved_done"
    ? value
    : "not_started"
}

function ensureSubmissionType(value: unknown): TeamProjectSubmissionType {
  return value === "upload" || value === "link" ? value : "text"
}

function ensureOwnerType(value: unknown): TeamProjectStageOwnerType {
  return value === "member" ? "member" : "creator"
}

function asComments(value: unknown): TeamProjectTaskComment[] {
  if (!Array.isArray(value)) return []

  return value.map((entry, index) => {
    const record = asRecord(entry)
    return {
      id: toStringValue(record.id) || `comment-${index + 1}`,
      taskId: toStringValue(record.taskId),
      authorUserId: toStringValue(record.authorUserId) || null,
      authorName: toStringValue(record.authorName),
      authorRole:
        record.authorRole === "creator" ||
        record.authorRole === "stage_manager" ||
        record.authorRole === "assignee"
          ? record.authorRole
          : "member",
      body: toStringValue(record.body),
      createdAt: toStringValue(record.createdAt),
      isCorrectionRequest: Boolean(record.isCorrectionRequest),
    }
  })
}

function asSubmission(value: unknown): TeamProjectTaskSubmission | null {
  const record = asRecord(value)
  if (!Object.keys(record).length) return null

  return {
    id: toStringValue(record.id) || "submission",
    type: ensureSubmissionType(record.type),
    value: toStringValue(record.value),
    note: toStringValue(record.note),
    submittedAt: toStringValue(record.submittedAt),
  }
}

function asTasks(value: unknown): TeamProjectTask[] {
  if (!Array.isArray(value)) return []

  return value.map((entry, index) => {
    const record = asRecord(entry)
    return {
      id: toStringValue(record.id) || `task-${index + 1}`,
      stageId: toStringValue(record.stageId),
      title: toStringValue(record.title),
      description: toStringValue(record.description),
      assigneeMemberId: toStringValue(record.assigneeMemberId),
      assigneeName: toStringValue(record.assigneeName),
      assigneeEmail: toStringValue(record.assigneeEmail),
      deliveryDueAt: toStringValue(record.deliveryDueAt) || null,
      status: ensureTaskStatus(record.status),
      submission: asSubmission(record.submission),
      submittedAt: toStringValue(record.submittedAt) || null,
      approvedDoneAt: toStringValue(record.approvedDoneAt) || null,
      changesRequestedAt: toStringValue(record.changesRequestedAt) || null,
      comments: asComments(record.comments),
    }
  })
}

function asStages(value: unknown): TeamProjectStage[] {
  if (!Array.isArray(value)) return []

  return value.map((entry, index) => {
    const record = asRecord(entry)
    return {
      id: toStringValue(record.id) || `stage-${index + 1}`,
      label: toStringValue(record.label),
      department: toStringValue(record.department),
      dueDate: toStringValue(record.dueDate) || null,
      status: toStringValue(record.status),
      stageOwnerType: ensureOwnerType(record.stageOwnerType),
      stageOwnerMemberId: toStringValue(record.stageOwnerMemberId) || null,
      stageOwnerName: toStringValue(record.stageOwnerName),
      tasks: asTasks(record.tasks),
    }
  })
}

export function normalizeTeamProjectMembers(value: unknown): TeamProjectMember[] {
  if (!Array.isArray(value)) return []

  return value.map((entry, index) => {
    const record = asRecord(entry)
    return {
      id: toStringValue(record.id) || `member-${index + 1}`,
      pageId: toStringValue(record.pageId) || undefined,
      userId: toStringValue(record.userId) || null,
      name: toStringValue(record.name),
      email: toStringValue(record.email).toLowerCase(),
      internalLabel: toStringValue(record.internalLabel) || null,
      status: ensureStatus(record.status),
      role: ensureRole(record.role),
      inviteSentAt: toStringValue(record.inviteSentAt) || null,
      inviteAcceptedAt: toStringValue(record.inviteAcceptedAt) || null,
      createdAt: toStringValue(record.createdAt) || undefined,
      updatedAt: toStringValue(record.updatedAt) || undefined,
    }
  })
}

export function getTeamProjectStageCompletionPercentage(stage: TeamProjectStage) {
  if (!stage.tasks.length) return 0

  const weightedProgress = stage.tasks.reduce((sum, task) => {
    switch (task.status) {
      case "approved_done":
        return sum + 1
      case "submitted":
        return sum + 0.8
      case "changes_requested":
        return sum + 0.55
      case "in_progress":
        return sum + 0.35
      default:
        return sum
    }
  }, 0)

  return Math.round((weightedProgress / stage.tasks.length) * 100)
}

export function getTeamProjectStageStatus(stage: TeamProjectStage) {
  const completion = getTeamProjectStageCompletionPercentage(stage)
  if (completion >= 100) return "Completed"
  if (completion > 0) return "In progress"
  return "Not started"
}

export function createDefaultTeamProjectHubBlocks(config: {
  title?: string
  ownerName?: string
} = {}) {
  const title = config.title?.trim() || "Team Project Hub"
  const ownerName = config.ownerName?.trim() || "Project Owner"

  return [
    {
      type: "PROJECT_HEADER",
      order: 0,
      content: {
        section: "team_project_header",
        title,
        department: "Operations",
        ownerName,
        overallStatus: "Planning",
        summary: "Internal workspace for stage ownership, task delivery, and approvals.",
      } satisfies TeamProjectHeaderContent,
    },
    {
      type: "STATUS_SUMMARY",
      order: 1,
      content: {
        section: "team_project_status",
        text: "Project is ready for stage setup, team access, and task assignment.",
        manualText: null,
      } satisfies TeamProjectStatusContent,
    },
    {
      type: "TIMELINE",
      order: 2,
      content: {
        section: "team_project_timeline",
        currentStep: 1,
        stages: [
          {
            id: "stage-1",
            label: "Planning",
            department: "Operations",
            dueDate: null,
            status: "Not started",
            stageOwnerType: "creator",
            stageOwnerMemberId: null,
            stageOwnerName: ownerName,
            tasks: [],
          },
          {
            id: "stage-2",
            label: "Production",
            department: "Execution",
            dueDate: null,
            status: "Not started",
            stageOwnerType: "creator",
            stageOwnerMemberId: null,
            stageOwnerName: ownerName,
            tasks: [],
          },
          {
            id: "stage-3",
            label: "Review",
            department: "Quality",
            dueDate: null,
            status: "Not started",
            stageOwnerType: "creator",
            stageOwnerMemberId: null,
            stageOwnerName: ownerName,
            tasks: [],
          },
        ],
      } satisfies TeamProjectTimelineContent,
    },
    {
      type: "DELIVERABLES",
      order: 3,
      content: {
        section: "team_project_deliverables",
        items: [],
      } satisfies TeamProjectDeliverablesContent,
    },
  ] satisfies EditorBlock[]
}

export function getTeamProjectHubSections(blocks: Array<{ type: string; content?: unknown }>): TeamProjectHubSections {
  const defaults = createDefaultTeamProjectHubBlocks()

  const headerSource = asRecord(findEditorBlock(blocks, "PROJECT_HEADER")?.content || defaults[0].content)
  const statusSource = asRecord(findEditorBlock(blocks, "STATUS_SUMMARY")?.content || defaults[1].content)
  const timelineSource = asRecord(findEditorBlock(blocks, "TIMELINE")?.content || defaults[2].content)
  const deliverablesSource = asRecord(findEditorBlock(blocks, "DELIVERABLES")?.content || defaults[3].content)

  return {
    header: {
      section: "team_project_header",
      title: toStringValue(headerSource.title),
      department: toStringValue(headerSource.department),
      ownerName: toStringValue(headerSource.ownerName),
      overallStatus: toStringValue(headerSource.overallStatus),
      summary: toStringValue(headerSource.summary),
    },
    status: {
      section: "team_project_status",
      text: toStringValue(statusSource.text),
      manualText: toStringValue(statusSource.manualText) || null,
    },
    timeline: {
      section: "team_project_timeline",
      currentStep:
        typeof timelineSource.currentStep === "number" && timelineSource.currentStep > 0
          ? timelineSource.currentStep
          : 1,
      stages: asStages(timelineSource.stages),
    },
    deliverables: {
      section: "team_project_deliverables",
      items: Array.isArray(deliverablesSource.items)
        ? deliverablesSource.items.map((entry, index) => {
            const record = asRecord(entry)
            return {
              id: toStringValue(record.id) || `deliverable-${index + 1}`,
              title: toStringValue(record.title),
              description: toStringValue(record.description),
              url: toStringValue(record.url),
              fileName: toStringValue(record.fileName) || undefined,
              resourceType: toStringValue(record.resourceType) || undefined,
              publicId: toStringValue(record.publicId) || undefined,
              bytes: typeof record.bytes === "number" ? record.bytes : undefined,
            }
          })
        : [],
    },
  }
}

export function isActiveTeamProjectMember(member: TeamProjectMember | null | undefined) {
  return !!member && member.status === "ACTIVE"
}

function wholeDayDifference(dateA: Date, dateB: Date) {
  const utcA = Date.UTC(dateA.getFullYear(), dateA.getMonth(), dateA.getDate())
  const utcB = Date.UTC(dateB.getFullYear(), dateB.getMonth(), dateB.getDate())
  return Math.round((utcA - utcB) / 86400000)
}

export function getTeamProjectTaskTimingLabel(task: TeamProjectTask) {
  if (!task.deliveryDueAt || !task.submittedAt) return null

  const due = new Date(task.deliveryDueAt)
  const submitted = new Date(task.submittedAt)
  if (Number.isNaN(due.getTime()) || Number.isNaN(submitted.getTime())) return null

  const diff = wholeDayDifference(due, submitted)

  if (diff > 0) {
    return {
      label: `${diff} day${diff === 1 ? "" : "s"} early`,
      tone: "success" as const,
    }
  }

  if (diff === 0) {
    return {
      label: "On time",
      tone: "neutral" as const,
    }
  }

  const late = Math.abs(diff)
  return {
    label: `${late} day${late === 1 ? "" : "s"} late`,
    tone: "error" as const,
  }
}

export function getTeamProjectTaskStatusLabel(status: TeamProjectTaskStatus) {
  switch (status) {
    case "in_progress":
      return "In Progress"
    case "submitted":
      return "Submitted"
    case "changes_requested":
      return "Changes Requested"
    case "approved_done":
      return "Approved"
    default:
      return "Not Started"
  }
}
