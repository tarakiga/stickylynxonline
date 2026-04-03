"use client";

import * as React from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, Eye, FileText, GripVertical, Mail, Plus, Save, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dropzone } from "@/components/ui/Dropzone";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Toaster, showToast } from "@/components/ui/Toast";
import {
  getTeamProjectStageCompletionPercentage,
  getTeamProjectStageStatus,
  getTeamProjectHubSections,
  getTeamProjectTaskStatusLabel,
  normalizeTeamProjectMembers,
  type TeamProjectDeliverable,
  type TeamProjectHeaderContent,
  type TeamProjectMember,
  type TeamProjectMemberRole,
  type TeamProjectMemberStatus,
  type TeamProjectStage,
  type TeamProjectTask,
  type TeamProjectTaskStatus,
} from "@/lib/team-project-hub";
import { inferUploadAssetKind } from "@/lib/upload-config";
import { uploadAssetFile } from "@/lib/upload-client";
import type { EditorPage } from "@/types/editor-page";

type TeamProjectHubEditorProps = {
  page: EditorPage
  initialMembers: TeamProjectMember[]
  ownerName: string
  mode?: "owner" | "stage_manager"
  managedStageIds?: string[]
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function toIsoOrNull(value: string) {
  return value ? new Date(`${value}T00:00:00`).toISOString() : null
}

function toDateInput(value: string | null) {
  if (!value) return ""
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""
  return parsed.toISOString().slice(0, 10)
}

function statusOptions() {
  return [
    { value: "not_started", label: "Not Started" },
    { value: "in_progress", label: "In Progress" },
    { value: "submitted", label: "Submitted" },
    { value: "changes_requested", label: "Changes Requested" },
    { value: "approved_done", label: "Approved" },
  ] satisfies Array<{ value: TeamProjectTaskStatus; label: string }>
}

function memberStatusOptions() {
  return [
    { value: "ACTIVE", label: "Active" },
    { value: "SUSPENDED", label: "Suspended" },
    { value: "REMOVED", label: "Removed" },
  ] satisfies Array<{ value: TeamProjectMemberStatus; label: string }>
}

function memberRoleOptions() {
  return [
    { value: "CONTRIBUTOR", label: "Contributor" },
    { value: "ADMIN", label: "Admin" },
  ] satisfies Array<{ value: TeamProjectMemberRole; label: string }>
}

function taskStatusVariant(status: TeamProjectTaskStatus): "success" | "warning" | "error" | "info" | "primary" | "neutral" {
  switch (status) {
    case "approved_done":
      return "success"
    case "submitted":
      return "primary"
    case "changes_requested":
      return "warning"
    case "in_progress":
      return "info"
    default:
      return "neutral"
  }
}

function getStageTaskCounts(stage: TeamProjectStage) {
  return {
    total: stage.tasks.length,
    notStarted: stage.tasks.filter((task) => task.status === "not_started").length,
    inProgress: stage.tasks.filter((task) => task.status === "in_progress").length,
    submitted: stage.tasks.filter((task) => task.status === "submitted").length,
    approved: stage.tasks.filter((task) => task.status === "approved_done").length,
  }
}

function isTaskReadyForCollapse(task: TeamProjectTask) {
  return Boolean(task.title.trim() && task.assigneeMemberId && task.assigneeEmail)
}

function buildAssigneeSnapshot(stages: TeamProjectStage[]) {
  const snapshot: Record<string, { assigneeMemberId: string; assigneeEmail: string }> = {}
  for (const stage of stages) {
    for (const task of stage.tasks) {
      snapshot[`${stage.id}:${task.id}`] = {
        assigneeMemberId: task.assigneeMemberId || "",
        assigneeEmail: task.assigneeEmail || "",
      }
    }
  }
  return snapshot
}

function buildStageOwnerSnapshot(stages: TeamProjectStage[]) {
  const snapshot: Record<string, { stageOwnerType: string; stageOwnerMemberId: string }> = {}
  for (const stage of stages) {
    snapshot[stage.id] = {
      stageOwnerType: stage.stageOwnerType,
      stageOwnerMemberId: stage.stageOwnerMemberId || "",
    }
  }
  return snapshot
}

type SortableTaskEditorCardProps = {
  stageId: string
  task: TeamProjectTask
  activeMembers: TeamProjectMember[]
  saving: boolean
  savingTaskId: string | null
  spotlight: boolean
  expanded: boolean
  onSaveTask: (stageId: string, taskId: string) => void
  onRemoveTask: (stageId: string, taskId: string) => void
  onToggleExpand: (stageId: string, taskId: string) => void
  onUpdateTask: (stageId: string, taskId: string, updater: (task: TeamProjectTask) => TeamProjectTask) => void
}

type TaskEditorCardBaseProps = SortableTaskEditorCardProps & {
  dragButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
  cardRef?: (node: HTMLDivElement | null) => void
  cardStyle?: React.CSSProperties
  isDragging?: boolean
}

function TaskEditorCardBase({
  stageId,
  task,
  activeMembers,
  saving,
  savingTaskId,
  spotlight,
  expanded,
  onSaveTask,
  onRemoveTask,
  onToggleExpand,
  onUpdateTask,
  dragButtonProps,
  cardRef,
  cardStyle,
  isDragging = false,
}: TaskEditorCardBaseProps) {
  return (
    <div
      ref={cardRef}
      style={cardStyle}
      className={`rounded-2xl border bg-background p-4 space-y-4 ${spotlight ? "border-primary/30 ring-2 ring-primary/10" : "border-divider"} ${isDragging ? "shadow-premium ring-2 ring-primary/20" : ""}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleExpand(stageId, task.id)}
              className="inline-flex items-center gap-2 rounded-xl bg-transparent px-0 py-0 text-left text-base font-bold text-text-primary border-none cursor-pointer"
            >
              <span className="truncate">{task.title || "Untitled Task"}</span>
              {expanded ? <ChevronUp size={16} className="shrink-0 text-text-secondary" /> : <ChevronDown size={16} className="shrink-0 text-text-secondary" />}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            {...dragButtonProps}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-divider bg-surface text-text-secondary transition hover:text-text-primary cursor-grab active:cursor-grabbing"
            aria-label={`Reorder ${task.title || "task"}`}
          >
            <GripVertical size={16} />
          </button>
          <Badge variant={taskStatusVariant(task.status)}>{getTeamProjectTaskStatusLabel(task.status)}</Badge>
          {task.assigneeName ? <Badge variant="neutral">{task.assigneeName}</Badge> : null}
          {task.deliveryDueAt ? <Badge variant="info">{toDateInput(task.deliveryDueAt)}</Badge> : null}
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {expanded ? (
            <>
              <Button
                variant="secondary"
                onClick={() => onSaveTask(stageId, task.id)}
                disabled={saving || savingTaskId === task.id}
                className="w-full rounded-xl cursor-pointer sm:w-auto"
              >
                <Save size={16} className="mr-2" />
                {savingTaskId === task.id ? (
                  "Saving…"
                ) : (
                  <>
                    <span className="sm:hidden">Save</span>
                    <span className="hidden sm:inline">Save Task</span>
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => onRemoveTask(stageId, task.id)}
                className="w-full rounded-xl cursor-pointer text-error hover:text-error sm:w-auto"
              >
                <Trash2 size={16} className="mr-2" />
                Remove
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              onClick={() => onToggleExpand(stageId, task.id)}
              className="w-full rounded-xl cursor-pointer sm:w-auto"
            >
              {spotlight ? "Continue Editing" : "Expand"}
            </Button>
          )}
        </div>
      </div>
      {expanded ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            labelInside="Task Title"
            value={task.title}
            onChange={(event) => onUpdateTask(stageId, task.id, (current) => ({ ...current, title: event.target.value }))}
          />
          <div className="space-y-2">
            <span className="text-sm font-semibold text-text-secondary">Assignee</span>
            <select
              value={task.assigneeMemberId}
              onChange={(event) => onUpdateTask(stageId, task.id, (current) => {
                const member = activeMembers.find((entry) => entry.id === event.target.value)
                return {
                  ...current,
                  assigneeMemberId: event.target.value,
                  assigneeName: member?.name || "",
                  assigneeEmail: member?.email || "",
                }
              })}
              className="w-full input-base px-4 py-3 appearance-none cursor-pointer text-text-primary bg-background focus:ring-primary-light"
            >
              <option value="">Select assignee</option>
              {activeMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name || member.email}
                </option>
              ))}
            </select>
          </div>
          <Input
            type="date"
            labelInside="Delivery Due Date"
            value={toDateInput(task.deliveryDueAt)}
            onChange={(event) => onUpdateTask(stageId, task.id, (current) => ({ ...current, deliveryDueAt: toIsoOrNull(event.target.value) }))}
          />
          <div className="space-y-2">
            <span className="text-sm font-semibold text-text-secondary">Status</span>
            <select
              value={task.status}
              onChange={(event) => onUpdateTask(stageId, task.id, (current) => ({ ...current, status: event.target.value as TeamProjectTaskStatus }))}
              className="w-full input-base px-4 py-3 appearance-none cursor-pointer text-text-primary bg-background focus:ring-primary-light"
            >
              {statusOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <Textarea
              rows={3}
              value={task.description}
              onChange={(event) => onUpdateTask(stageId, task.id, (current) => ({ ...current, description: event.target.value }))}
              placeholder="Scope, expectations, or acceptance criteria."
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function SortableTaskEditorCard(props: SortableTaskEditorCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.task.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <TaskEditorCardBase
      {...props}
      dragButtonProps={{ ...attributes, ...listeners }}
      cardRef={setNodeRef}
      cardStyle={style}
      isDragging={isDragging}
    />
  )
}

function StaticTaskEditorCard(props: SortableTaskEditorCardProps) {
  return <TaskEditorCardBase {...props} />
}

function stageOwnerLabel(stage: TeamProjectStage, members: TeamProjectMember[], fallbackOwner: string) {
  if (stage.stageOwnerType === "creator") return fallbackOwner
  const member = members.find((entry) => entry.id === stage.stageOwnerMemberId)
  return member?.name || stage.stageOwnerName || "Unassigned"
}

function enrichTasks(stage: TeamProjectStage, members: TeamProjectMember[]) {
  return stage.tasks.map((task) => {
    const member = members.find((entry) => entry.id === task.assigneeMemberId)
    return {
      ...task,
      assigneeName: member?.name || task.assigneeName,
      assigneeEmail: member?.email || task.assigneeEmail,
    }
  })
}

export function TeamProjectHubEditor({
  page,
  initialMembers,
  ownerName,
  mode = "owner",
  managedStageIds = [],
}: TeamProjectHubEditorProps) {
  const blocks = React.useMemo(() => page.blocks || [], [page.blocks]);
  const sections = React.useMemo(() => getTeamProjectHubSections(blocks), [blocks]);

  const [header, setHeader] = React.useState<TeamProjectHeaderContent>({
    ...sections.header,
    ownerName: sections.header.ownerName || ownerName,
  });
  const [statusText, setStatusText] = React.useState(sections.status.manualText || sections.status.text);
  const currentStep = 1
  const [stages, setStages] = React.useState<TeamProjectStage[]>(sections.timeline.stages);
  const [deliverables, setDeliverables] = React.useState<TeamProjectDeliverable[]>(sections.deliverables.items);
  const [members, setMembers] = React.useState<TeamProjectMember[]>(normalizeTeamProjectMembers(initialMembers));
  const [selectedStageId, setSelectedStageId] = React.useState(sections.timeline.stages[0]?.id || "");
  const [saving, setSaving] = React.useState(false);
  const [invitingMemberId, setInvitingMemberId] = React.useState<string | null>(null);
  const [uploadingDeliverableId, setUploadingDeliverableId] = React.useState<string | null>(null);
  const [savingTaskId, setSavingTaskId] = React.useState<string | null>(null);
  const [savingStageId, setSavingStageId] = React.useState<string | null>(null);
  const [spotlightTaskId, setSpotlightTaskId] = React.useState<string | null>(null);
  const [expandedTaskIdByStage, setExpandedTaskIdByStage] = React.useState<Record<string, string | null>>({});
  const [dirtyStageIds, setDirtyStageIds] = React.useState<string[]>([]);
  const [dirty, setDirty] = React.useState(false);
  const [dndReady, setDndReady] = React.useState(false);
  const assigneeSnapshotRef = React.useRef<Record<string, { assigneeMemberId: string; assigneeEmail: string }> | null>(null)
  const stageOwnerSnapshotRef = React.useRef<Record<string, { stageOwnerType: string; stageOwnerMemberId: string }> | null>(null)

  const activeMembers = members.filter((member) => member.status === "ACTIVE");
  const hasTeamMembers = activeMembers.length > 0;
  const isStageManagerView = mode === "stage_manager"
  const managedStageIdSet = React.useMemo(() => new Set(managedStageIds), [managedStageIds])
  const visibleStages = React.useMemo(
    () => (isStageManagerView ? stages.filter((stage) => managedStageIdSet.has(stage.id)) : stages),
    [isStageManagerView, managedStageIdSet, stages]
  )
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const markDirty = React.useCallback(() => setDirty(true), []);
  const handleViewPublic = React.useCallback(() => window.open(`/${page.handle}`, "_blank"), [page.handle]);
  const markStageDirty = React.useCallback((stageId: string) => {
    setDirtyStageIds((current) => (current.includes(stageId) ? current : [...current, stageId]))
  }, [])
  const toggleTaskExpanded = React.useCallback((stageId: string, taskId: string) => {
    setExpandedTaskIdByStage((current) => ({
      ...current,
      [stageId]: current[stageId] === taskId ? null : taskId,
    }))
  }, [])

  React.useEffect(() => {
    if (assigneeSnapshotRef.current) return
    assigneeSnapshotRef.current = buildAssigneeSnapshot(stages)
  }, [stages])

  React.useEffect(() => {
    if (stageOwnerSnapshotRef.current) return
    stageOwnerSnapshotRef.current = buildStageOwnerSnapshot(stages)
  }, [stages])

  React.useEffect(() => {
    setDndReady(true)
  }, [])

  React.useEffect(() => {
    if (!visibleStages.length) {
      setSelectedStageId("")
      return
    }

    setSelectedStageId((current) => {
      if (current && visibleStages.some((stage) => stage.id === current)) return current
      return visibleStages[0]?.id || ""
    })
  }, [visibleStages])

  function updateStage(stageId: string, updater: (stage: TeamProjectStage) => TeamProjectStage) {
    setStages((current) => current.map((stage) => (stage.id === stageId ? updater(stage) : stage)));
    markStageDirty(stageId);
    markDirty();
  }

  function updateTask(stageId: string, taskId: string, updater: (task: TeamProjectTask) => TeamProjectTask) {
    updateStage(stageId, (stage) => ({
      ...stage,
      tasks: stage.tasks.map((task) => (task.id === taskId ? updater(task) : task)),
    }));
  }

  function addMember() {
    setMembers((current) => [
      {
        id: uid("member"),
        name: "",
        email: "",
        internalLabel: "",
        status: "ACTIVE",
        role: "CONTRIBUTOR",
      },
      ...current,
    ]);
    markDirty();
  }

  function addStage() {
    if (!hasTeamMembers) {
      showToast("Add at least one active team member before creating stages", "warning")
      return
    }

    const stageId = uid("stage");
    setStages((current) => [
      ...current,
      {
        id: stageId,
        label: "",
        department: "",
        dueDate: null,
        status: "Not started",
        stageOwnerType: "creator",
        stageOwnerMemberId: null,
        stageOwnerName: ownerName,
        tasks: [],
      },
    ]);
    setSelectedStageId(stageId);
    setSpotlightTaskId(null)
    setExpandedTaskIdByStage((current) => ({ ...current, [stageId]: null }))
    markStageDirty(stageId)
    markDirty();
  }

  function addTask(stageId: string) {
    if (!hasTeamMembers) {
      showToast("Add at least one active team member before creating tasks", "warning")
      return
    }

    setSelectedStageId(stageId)
    const taskId = uid("task")
    updateStage(stageId, (stage) => ({
      ...stage,
      tasks: [
        {
          id: taskId,
          stageId: stage.id,
          title: "",
          description: "",
          assigneeMemberId: "",
          assigneeName: "",
          assigneeEmail: "",
          deliveryDueAt: null,
          status: "not_started",
          submission: null,
          submittedAt: null,
          approvedDoneAt: null,
          changesRequestedAt: null,
          comments: [],
        },
        ...stage.tasks,
      ],
    }))
    setSpotlightTaskId(taskId)
    setExpandedTaskIdByStage((current) => ({ ...current, [stageId]: taskId }))
  }

  function handleTaskDragEnd(stageId: string, event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    updateStage(stageId, (stage) => {
      const oldIndex = stage.tasks.findIndex((task) => task.id === active.id)
      const newIndex = stage.tasks.findIndex((task) => task.id === over.id)
      if (oldIndex < 0 || newIndex < 0) return stage
      return { ...stage, tasks: arrayMove(stage.tasks, oldIndex, newIndex) }
    })
    setSpotlightTaskId(String(active.id))
  }

  function addDeliverable() {
    setDeliverables((current) => [
      ...current,
      {
        id: uid("deliverable"),
        title: "",
        description: "",
        url: "",
        fileName: "",
      },
    ]);
    markDirty();
  }

  async function uploadProjectFile(deliverableId: string, file: File) {
    const inferredKind = inferUploadAssetKind(file.type)
    if (!inferredKind) {
      showToast("Unsupported file type. Use a document, image, or audio file.", "warning")
      return
    }

    setUploadingDeliverableId(deliverableId)
    try {
      const uploaded = await uploadAssetFile(file, { kind: inferredKind, pageId: page.id })
      setDeliverables((current) =>
        current.map((entry) =>
          entry.id === deliverableId
            ? {
                ...entry,
                title: entry.title || uploaded.originalFilename || file.name,
                url: uploaded.secureUrl,
                fileName: uploaded.originalFilename || file.name,
                publicId: uploaded.publicId,
                resourceType: uploaded.resourceType,
                bytes: uploaded.bytes,
              }
            : entry
        )
      )
      markDirty()
      showToast("Project file uploaded", "success")
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to upload project file", "error")
    } finally {
      setUploadingDeliverableId(null)
    }
  }

  async function saveTaskAndNotify(stageId: string, taskId: string) {
    const stage = stages.find((entry) => entry.id === stageId) || null
    const task = stage?.tasks.find((entry) => entry.id === taskId) || null
    if (!task) return

    if (!task.assigneeMemberId || !task.assigneeEmail) {
      showToast("Select an assignee before saving and notifying", "warning")
      return
    }

    setSavingTaskId(taskId)
    setSaving(true)

    try {
      const saved = await persistTeamProjectHub()
      if (!saved.ok) return
      setDirtyStageIds((current) => current.filter((id) => id !== stageId))

      const assignmentResponse = await fetch(`/api/team-project/${page.handle}/task-assignment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId, taskId }),
      })

      const assignmentPayload = await assignmentResponse.json().catch(() => null)
      if (!assignmentResponse.ok) {
        throw new Error(assignmentPayload?.error || assignmentPayload?.message || "Failed to send task assignment notification")
      }

      setExpandedTaskIdByStage((current) => {
        if (!isTaskReadyForCollapse(task)) return current
        return { ...current, [stageId]: null }
      })
      setSpotlightTaskId(null)
      showToast("Task saved and assignment notification sent", "success")
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to save task", "error")
    } finally {
      setSavingTaskId(null)
      setSaving(false)
    }
  }

  async function saveStageAndNotify(stageId: string) {
    const stage = stages.find((entry) => entry.id === stageId) || null
    if (!stage) return

    const snapshot = assigneeSnapshotRef.current || {}
    const stageOwnerSnapshot = stageOwnerSnapshotRef.current || {}
    const tasksMissingAssignee = stage.tasks.filter((task) => !task.assigneeMemberId || !task.assigneeEmail).length
    const notifyCandidates = stage.tasks
      .filter((task) => task.assigneeMemberId && task.assigneeEmail)
      .filter((task) => {
        const prev = snapshot[`${stage.id}:${task.id}`]
        if (!prev) return true
        return prev.assigneeMemberId !== task.assigneeMemberId || prev.assigneeEmail !== task.assigneeEmail
      })
      .map((task) => task.id)

    const previousOwner = stageOwnerSnapshot[stage.id]
    const stageOwnerChanged =
      stage.stageOwnerType === "member" &&
      !!stage.stageOwnerMemberId &&
      (!previousOwner ||
        previousOwner.stageOwnerType !== "member" ||
        previousOwner.stageOwnerMemberId !== stage.stageOwnerMemberId)

    setSavingStageId(stageId)
    setSaving(true)

    try {
      const saved = await persistTeamProjectHub()
      if (!saved.ok) return

      assigneeSnapshotRef.current = buildAssigneeSnapshot(stages)
      stageOwnerSnapshotRef.current = buildStageOwnerSnapshot(stages)

      let sent = 0
      let failed = 0
      let quotaHit = false
      let stageManagerSent = 0

      if (stageOwnerChanged) {
        const stageManager = members.find((entry) => entry.id === stage.stageOwnerMemberId) || null
        if (stageManager?.email && stageManager.status === "ACTIVE") {
          const response = await fetch(`/api/team-project/${page.handle}/invite`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ memberId: stageManager.id, email: stageManager.email }),
          })

          if (response.ok) {
            stageManagerSent = 1
          } else if (response.status === 429) {
            quotaHit = true
          } else {
            failed += 1
          }
        } else {
          showToast("Stage saved. Stage manager must be an active team member with an email to receive a notification.", "warning")
        }
      }

      for (const taskId of notifyCandidates) {
        if (quotaHit) break
        const response = await fetch(`/api/team-project/${page.handle}/task-assignment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stageId, taskId }),
        })

        if (response.ok) {
          sent += 1
          continue
        }

        if (response.status === 429) {
          quotaHit = true
          break
        }

        failed += 1
      }

      if (quotaHit) {
        showToast("Stage saved, but the daily email limit was reached before all assignment notifications could send", "warning")
      } else if (sent || failed) {
        showToast(
          `Stage saved. ${stageManagerSent ? "Stage manager notified. " : ""}${sent} assignment notification${sent === 1 ? "" : "s"} sent${failed ? `, ${failed} failed` : ""}${tasksMissingAssignee ? `, ${tasksMissingAssignee} missing assignee` : ""}.`,
          failed ? "warning" : "success"
        )
      } else if (tasksMissingAssignee) {
        showToast(`Stage saved. ${tasksMissingAssignee} task${tasksMissingAssignee === 1 ? "" : "s"} missing an assignee, so no notifications were sent.`, "warning")
      } else {
        showToast(`Stage saved${stageManagerSent ? " and stage manager notified" : ""}`, "success")
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to save stage", "error")
    } finally {
      setSavingStageId(null)
      setSaving(false)
    }
  }

  async function persistTeamProjectHub() {
    const normalizedStages = stages.map((stage) => ({
      ...stage,
      status: getTeamProjectStageStatus(stage),
      stageOwnerName: stageOwnerLabel(stage, members, ownerName),
      tasks: enrichTasks(stage, members),
    }))

    const blocksPayload = [
      {
        type: "PROJECT_HEADER",
        order: 0,
        content: {
          ...header,
          section: "team_project_header",
          ownerName,
        },
      },
      {
        type: "STATUS_SUMMARY",
        order: 1,
        content: {
          section: "team_project_status",
          text: statusText,
          manualText: statusText,
        },
      },
      {
        type: "TIMELINE",
        order: 2,
        content: {
          section: "team_project_timeline",
          currentStep,
          stages: normalizedStages,
        },
      },
      {
        type: "DELIVERABLES",
        order: 3,
        content: {
          section: "team_project_deliverables",
          items: deliverables,
        },
      },
    ]

    try {
      const blocksRes = await fetch(`/api/editor/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks: blocksPayload }),
      })
      const membersRes = isStageManagerView
        ? null
        : await fetch(`/api/team-project/${page.handle}/members`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pageId: page.id, items: members }),
          })

      if (!blocksRes.ok || (membersRes && !membersRes.ok)) {
        const payload = !blocksRes.ok
          ? await blocksRes.json().catch(() => null)
          : await membersRes?.json().catch(() => null)
        throw new Error(payload?.message || payload?.error || "Failed to save Team Project Hub")
      }

      const membersPayload = membersRes ? await membersRes.json().catch(() => null) : null
      const savedMembers = membersPayload?.items ? normalizeTeamProjectMembers(membersPayload.items) : null
      if (savedMembers) setMembers(savedMembers)

      assigneeSnapshotRef.current = buildAssigneeSnapshot(stages)
      stageOwnerSnapshotRef.current = buildStageOwnerSnapshot(stages)
      setDirtyStageIds([])
      setDirty(false)
      return { ok: true as const, members: savedMembers }
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to save Team Project Hub", "error")
      return { ok: false as const, members: null }
    }
  }

  async function handleSave() {
    setSaving(true);

    try {
      const saved = await persistTeamProjectHub()
      if (saved.ok) {
        showToast("Team Project Hub saved", "success")
      }
    } finally {
      setSaving(false)
    }
  }

  async function inviteMember(memberId: string) {
    let member = members.find((entry) => entry.id === memberId) || null
    if (!member || !member.email || member.status !== "ACTIVE") {
      showToast("Member must be active and have an email before you can send an invite", "warning")
      return
    }

    if (dirty) {
      const emailSnapshot = member.email
      setSaving(true)
      const saved = await persistTeamProjectHub()
      setSaving(false)
      if (!saved.ok) return

      const normalizedEmail = emailSnapshot.toLowerCase().trim()
      const nextMembers = saved.members || []
      member = nextMembers.find((entry) => entry.email.toLowerCase().trim() === normalizedEmail) || member
      memberId = member.id
    }

    setInvitingMemberId(memberId)
    try {
      const response = await fetch(`/api/team-project/${page.handle}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, email: member.email }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.error || payload?.message || "Failed to send invite")
      }

      const inviteSentAt = new Date().toISOString()
      setMembers((current) =>
        current.map((entry) => (
          entry.id === memberId
            ? { ...entry, inviteSentAt }
            : entry
        ))
      )
      showToast("Invite sent successfully", "success")
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to send invite", "error")
    } finally {
      setInvitingMemberId(null)
    }
  }

  return (
    <>
      <Toaster />
      <div className="w-full max-w-6xl mx-auto space-y-8 pb-16">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-primary text-sm font-semibold">
            <Badge variant="primary">Team Project Hub</Badge>
            <span>{isStageManagerView ? "Stage Manager Mode" : "Edit Mode"}</span>
            {dirty ? <span className="text-warning">· Unsaved changes</span> : null}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="secondary" onClick={handleViewPublic} className="py-2 px-4 shadow-sm text-xs rounded-xl cursor-pointer whitespace-nowrap">
              <Eye size={14} className="mr-1.5" />
              Preview
            </Button>
            {!isStageManagerView ? (
              <Button variant="primary" onClick={handleSave} disabled={saving || !dirty} className="py-2 px-5 shadow-sm text-sm rounded-xl cursor-pointer border-none text-white whitespace-nowrap">
                <Save size={14} className="mr-1.5" />
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            ) : null}
          </div>
        </div>

        {isStageManagerView ? (
          <Card className="rounded-3xl border border-primary/15 bg-surface p-6 shadow-premium space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">Limited Access</Badge>
              <Badge variant="neutral">{visibleStages.length} Managed Stage{visibleStages.length === 1 ? "" : "s"}</Badge>
            </div>
            <p className="text-sm text-text-secondary">
              You can manage only the stages assigned to you, including task updates, task assignments, and stage progress. Workspace header, team access, and project files remain owner-controlled.
            </p>
          </Card>
        ) : null}

        {!isStageManagerView ? (
          <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-premium space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl text-text-primary">Project Header</h3>
              <p className="text-sm text-text-secondary">Define the internal identity and project summary before assigning stages.</p>
            </div>
            <Badge variant="success">{stages.length} Stages</Badge>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input labelInside="Project Title" value={header.title} onChange={(event) => { setHeader((current) => ({ ...current, title: event.target.value })); markDirty(); }} />
            <Input labelInside="Department / Unit" value={header.department} onChange={(event) => { setHeader((current) => ({ ...current, department: event.target.value })); markDirty(); }} />
            <Input labelInside="Owner" value={ownerName} readOnly />
            <Input labelInside="Overall Status" value={header.overallStatus} onChange={(event) => { setHeader((current) => ({ ...current, overallStatus: event.target.value })); markDirty(); }} />
            <div className="md:col-span-2">
              <Textarea rows={3} value={header.summary} onChange={(event) => { setHeader((current) => ({ ...current, summary: event.target.value })); markDirty(); }} placeholder="Summarize the project, scope, and success criteria." />
            </div>
            <div className="md:col-span-2">
              <Textarea rows={3} value={statusText} onChange={(event) => { setStatusText(event.target.value); markDirty(); }} placeholder="Current project status update" />
            </div>
          </div>
          </Card>
        ) : null}

        {!isStageManagerView ? (
          <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-premium space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl text-text-primary">Team Access</h3>
              <p className="text-sm text-text-secondary">Manage collaborators, track invite acceptance, and control who can access internal delivery workflows.</p>
            </div>
            <Button variant="secondary" onClick={addMember} className="rounded-xl cursor-pointer">
              <Plus size={16} className="mr-2" />
              Add Member
            </Button>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {members.map((member) => (
              <div key={member.id} className="rounded-[1.75rem] border border-divider bg-background p-5 shadow-sm space-y-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-lg font-bold text-text-primary">{member.name || "New Team Member"}</p>
                    <p className="text-sm text-text-secondary">{member.email || "Add an email address to enable access"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={member.role === "ADMIN" ? "primary" : "neutral"}>
                      {member.role === "ADMIN" ? "Admin" : "Contributor"}
                    </Badge>
                    <Badge variant={member.status === "ACTIVE" ? "success" : member.status === "SUSPENDED" ? "warning" : "neutral"}>
                      {member.status}
                    </Badge>
                    <Badge
                      variant={member.userId || member.inviteAcceptedAt ? "success" : member.inviteSentAt ? "info" : "neutral"}
                    >
                      {member.userId || member.inviteAcceptedAt ? "Invite Accepted" : member.inviteSentAt ? "Invite Sent" : "Invite Pending"}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input labelInside="Name" value={member.name} onChange={(event) => { setMembers((current) => current.map((entry) => entry.id === member.id ? { ...entry, name: event.target.value } : entry)); markDirty(); }} />
                  <Input labelInside="Email" type="email" value={member.email} onChange={(event) => { setMembers((current) => current.map((entry) => entry.id === member.id ? { ...entry, email: event.target.value.toLowerCase() } : entry)); markDirty(); }} />
                  <Input labelInside="Internal Label" value={member.internalLabel || ""} onChange={(event) => { setMembers((current) => current.map((entry) => entry.id === member.id ? { ...entry, internalLabel: event.target.value } : entry)); markDirty(); }} />
                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-text-secondary">Role</span>
                    <select
                      value={member.role}
                      onChange={(event) => { setMembers((current) => current.map((entry) => entry.id === member.id ? { ...entry, role: event.target.value as TeamProjectMemberRole } : entry)); markDirty(); }}
                      className="w-full input-base px-4 py-3 appearance-none cursor-pointer text-text-primary bg-background focus:ring-primary-light"
                    >
                      {memberRoleOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-text-secondary">Status</span>
                    <select
                      value={member.status}
                      onChange={(event) => { setMembers((current) => current.map((entry) => entry.id === member.id ? { ...entry, status: event.target.value as TeamProjectMemberStatus } : entry)); markDirty(); }}
                      className="w-full input-base px-4 py-3 appearance-none cursor-pointer text-text-primary bg-background focus:ring-primary-light"
                    >
                      {memberStatusOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-divider bg-surface px-4 py-3">
                  <div className="text-sm text-text-secondary">
                    {member.userId || member.inviteAcceptedAt
                      ? "This collaborator has accepted access and can enter the workspace with their login email."
                      : member.inviteSentAt
                      ? "Invite sent. Once they sign in with this email, access will be accepted automatically."
                      : "Save the team roster, then send the invite to grant workspace access."}
                    <div className="mt-2 text-xs font-semibold text-text-secondary">
                      {member.role === "ADMIN"
                        ? "Admins can monitor the full Team Project Hub like the creator."
                        : "Contributors are limited to stages they manage and tasks assigned to them."}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => inviteMember(member.id)}
                      disabled={invitingMemberId === member.id || saving || !member.email || member.status !== "ACTIVE"}
                      className="rounded-xl cursor-pointer"
                    >
                      <Mail size={16} className="mr-2" />
                      {invitingMemberId === member.id ? "Sending…" : member.inviteSentAt ? "Re-send Invite" : "Send Invite"}
                    </Button>
                    <Button variant="ghost" onClick={() => { setMembers((current) => current.filter((entry) => entry.id !== member.id)); markDirty(); }} className="rounded-xl cursor-pointer text-error hover:text-error">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </Card>
        ) : null}

        <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-premium space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl text-text-primary">Stages & Ownership</h3>
              <p className="text-sm text-text-secondary">{isStageManagerView ? "Manage the stages assigned to you and keep task delivery moving." : "Assign each stage to the creator or an active allowlist member."}</p>
            </div>
            {!isStageManagerView ? (
              <Button variant="secondary" onClick={addStage} disabled={!hasTeamMembers} className="rounded-xl cursor-pointer">
                <Plus size={16} className="mr-2" />
                Add Stage
              </Button>
            ) : null}
          </div>
          {!hasTeamMembers ? (
            <div className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-4 text-sm text-text-primary">
              Add at least one active team member in Team Access before setting up stages and ownership.
            </div>
          ) : null}
          <div className="grid gap-4">
            {visibleStages.map((stage, index) => (
              <div key={stage.id} className={`relative overflow-hidden rounded-[2rem] border border-divider bg-background shadow-sm ${!hasTeamMembers ? "pointer-events-none opacity-50" : ""}`}>
                <div className="absolute bottom-0 left-7 top-0 hidden w-px bg-divider/80 md:block" />
                <div className="relative p-5 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className={`relative z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-black ${selectedStageId === stage.id ? "border-primary/30 bg-primary text-white" : "border-divider bg-surface text-text-secondary"}`}>
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1 space-y-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={selectedStageId === stage.id ? "primary" : "neutral"}>Stage {index + 1}</Badge>
                            <Badge variant="info">{getStageTaskCounts(stage).total} Tasks</Badge>
                            {getStageTaskCounts(stage).submitted ? (
                              <Badge variant="warning">{getStageTaskCounts(stage).submitted} In Review</Badge>
                            ) : null}
                            {getStageTaskCounts(stage).approved ? (
                              <Badge variant="success">{getStageTaskCounts(stage).approved} Approved</Badge>
                            ) : null}
                            <Badge variant="neutral" className="md:hidden">{getTeamProjectStageCompletionPercentage(stage)}%</Badge>
                          </div>
                          <div>
                            <h4 className="text-xl font-black tracking-tight text-text-primary">{stage.label || `Stage ${index + 1}`}</h4>
                            <p className="mt-1 text-sm text-text-secondary">
                              {stage.department || "No department set"} • {stage.stageOwnerType === "creator" ? ownerName : stage.stageOwnerName || "No manager assigned"}
                            </p>
                          </div>
                        </div>
                        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
                          <Button
                            variant={selectedStageId === stage.id ? "primary" : "secondary"}
                            onClick={() => setSelectedStageId((current) => (current === stage.id ? "" : stage.id))}
                            className="w-full rounded-xl cursor-pointer sm:w-auto"
                          >
                            {selectedStageId === stage.id ? <ChevronUp size={16} className="mr-2" /> : <ChevronDown size={16} className="mr-2" />}
                            <span className="sm:hidden">{selectedStageId === stage.id ? "Collapse" : "Expand"}</span>
                            <span className="hidden sm:inline">{selectedStageId === stage.id ? "Collapse Stage" : "Expand Stage"}</span>
                          </Button>
                          {!isStageManagerView ? (
                            <Button variant="ghost" onClick={() => { setStages((current) => current.filter((entry) => entry.id !== stage.id)); if (selectedStageId === stage.id) setSelectedStageId(visibleStages.find((entry) => entry.id !== stage.id)?.id || ""); markDirty(); }} className="w-full rounded-xl cursor-pointer text-error hover:text-error sm:w-auto">
                              <Trash2 size={16} className="mr-2" />
                              Remove
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 md:hidden">
                        <Badge variant="neutral">Not Started {getStageTaskCounts(stage).notStarted}</Badge>
                        <Badge variant="info">In Progress {getStageTaskCounts(stage).inProgress}</Badge>
                        <Badge variant="primary">Submitted {getStageTaskCounts(stage).submitted}</Badge>
                        <Badge variant="success">Approved {getStageTaskCounts(stage).approved}</Badge>
                        <Badge variant={getTeamProjectStageCompletionPercentage(stage) === 100 ? "success" : getTeamProjectStageCompletionPercentage(stage) > 0 ? "info" : "neutral"}>
                          {getTeamProjectStageStatus(stage)}
                        </Badge>
                      </div>

                      <div className="hidden grid-cols-2 gap-3 md:grid lg:hidden">
                        <div className="rounded-[1.4rem] border border-divider bg-surface/90 p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">Not Started</p>
                              <p className="mt-2 text-2xl font-black text-text-primary">{getStageTaskCounts(stage).notStarted}</p>
                            </div>
                            <Badge variant="neutral">Queue</Badge>
                          </div>
                        </div>
                        <div className="rounded-[1.4rem] border border-divider bg-surface/90 p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">In Progress</p>
                              <p className="mt-2 text-2xl font-black text-text-primary">{getStageTaskCounts(stage).inProgress}</p>
                            </div>
                            <Badge variant="info">Active</Badge>
                          </div>
                        </div>
                        <div className="rounded-[1.4rem] border border-divider bg-surface/90 p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">Submitted</p>
                              <p className="mt-2 text-2xl font-black text-text-primary">{getStageTaskCounts(stage).submitted}</p>
                            </div>
                            <Badge variant="primary">Review</Badge>
                          </div>
                        </div>
                        <div className="rounded-[1.4rem] border border-divider bg-surface/90 p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">Approved</p>
                              <p className="mt-2 text-2xl font-black text-text-primary">{getStageTaskCounts(stage).approved}</p>
                            </div>
                            <Badge variant="success">Done</Badge>
                          </div>
                        </div>
                        <div className="col-span-2 rounded-[1.4rem] border border-divider bg-surface/90 p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">Stage Status</p>
                              <p className="mt-2 text-lg font-bold text-text-primary">{getTeamProjectStageStatus(stage)}</p>
                            </div>
                            <Badge variant="neutral">{getTeamProjectStageCompletionPercentage(stage)}%</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="hidden grid-cols-2 gap-3 lg:grid lg:grid-cols-5">
                        <div className="rounded-2xl border border-divider bg-surface px-4 py-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">Not Started</p>
                          <p className="mt-2 text-lg font-bold text-text-primary">{getStageTaskCounts(stage).notStarted}</p>
                        </div>
                        <div className="rounded-2xl border border-divider bg-surface px-4 py-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">In Progress</p>
                          <p className="mt-2 text-lg font-bold text-text-primary">{getStageTaskCounts(stage).inProgress}</p>
                        </div>
                        <div className="rounded-2xl border border-divider bg-surface px-4 py-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">Submitted</p>
                          <p className="mt-2 text-lg font-bold text-text-primary">{getStageTaskCounts(stage).submitted}</p>
                        </div>
                        <div className="rounded-2xl border border-divider bg-surface px-4 py-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">Approved</p>
                          <p className="mt-2 text-lg font-bold text-text-primary">{getStageTaskCounts(stage).approved}</p>
                        </div>
                        <div className="rounded-2xl border border-divider bg-surface px-4 py-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">Stage Status</p>
                          <p className="mt-2 truncate text-lg font-bold text-text-primary">{getTeamProjectStageStatus(stage)}</p>
                        </div>
                      </div>

                      {selectedStageId === stage.id ? (
                        <div className="space-y-5">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <Input labelInside="Stage Title" value={stage.label} onChange={(event) => updateStage(stage.id, (current) => ({ ...current, label: event.target.value }))} />
                            <Input labelInside="Department" value={stage.department} onChange={(event) => updateStage(stage.id, (current) => ({ ...current, department: event.target.value }))} />
                            <Input type="date" labelInside="Due Date" value={toDateInput(stage.dueDate)} onChange={(event) => updateStage(stage.id, (current) => ({ ...current, dueDate: toIsoOrNull(event.target.value) }))} />
                            <Input labelInside="Stage Status" value={getTeamProjectStageStatus(stage)} readOnly />
                          </div>

                          {!isStageManagerView ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                              <div className="space-y-2">
                                <span className="text-sm font-semibold text-text-secondary">Owner Type</span>
                                <select
                                  value={stage.stageOwnerType}
                                  onChange={(event) => updateStage(stage.id, (current) => ({
                                    ...current,
                                    stageOwnerType: event.target.value === "member" ? "member" : "creator",
                                    stageOwnerMemberId: event.target.value === "member" ? current.stageOwnerMemberId : null,
                                    stageOwnerName: event.target.value === "member"
                                      ? stageOwnerLabel(current, members, ownerName)
                                      : ownerName,
                                  }))}
                                  className="w-full input-base px-4 py-3 appearance-none cursor-pointer text-text-primary bg-background focus:ring-primary-light"
                                >
                                  <option value="creator">Creator</option>
                                  <option value="member">Allowlist User</option>
                                </select>
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <span className="text-sm font-semibold text-text-secondary">Stage Manager</span>
                                <select
                                  value={stage.stageOwnerType === "member" ? stage.stageOwnerMemberId || "" : "creator"}
                                  onChange={(event) => updateStage(stage.id, (current) => {
                                    if (event.target.value === "creator") {
                                      return {
                                        ...current,
                                        stageOwnerType: "creator",
                                        stageOwnerMemberId: null,
                                        stageOwnerName: ownerName,
                                      }
                                    }

                                    const member = members.find((entry) => entry.id === event.target.value)
                                    return {
                                      ...current,
                                      stageOwnerType: "member",
                                      stageOwnerMemberId: member?.id || null,
                                      stageOwnerName: member?.name || "",
                                    }
                                  })}
                                  className="w-full input-base px-4 py-3 appearance-none cursor-pointer text-text-primary bg-background focus:ring-primary-light"
                                >
                                  <option value="creator">Creator</option>
                                  {activeMembers.map((member) => (
                                    <option key={member.id} value={member.id}>
                                      {member.name || member.email}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-divider bg-surface px-4 py-4 text-sm text-text-secondary">
                              Stage manager access is limited to your assigned stage workspace and tasks.
                            </div>
                          )}

                          <div className="space-y-4">
                            <div className="rounded-2xl border border-divider bg-surface px-4 py-4">
                              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div className="space-y-1">
                                  <p className="text-xs font-black uppercase tracking-[0.18em] text-text-secondary">Stage Completion</p>
                                  <div className="flex items-center gap-3">
                                    <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-divider">
                                      <div
                                        className="h-full rounded-full bg-primary transition-all"
                                        style={{ width: `${getTeamProjectStageCompletionPercentage(stage)}%` }}
                                      />
                                    </div>
                                    <p className="text-sm font-bold text-text-primary">{getTeamProjectStageCompletionPercentage(stage)}%</p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  {dirtyStageIds.includes(stage.id) ? (
                                    <Badge variant="warning">Unsaved</Badge>
                                  ) : (
                                    <Badge variant="success">Saved</Badge>
                                  )}
                                  {savingTaskId && stage.tasks.some((task) => task.id === savingTaskId) ? (
                                    <Badge variant="info">Saving…</Badge>
                                  ) : null}
                                </div>
                              </div>
                            </div>

                            <div className="sticky top-4 z-10 rounded-[1.5rem] border border-primary/15 bg-surface/95 p-3 shadow-sm backdrop-blur">
                              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant="primary">Editing Stage {index + 1}</Badge>
                                  <Badge variant="neutral">{stage.label || `Stage ${index + 1}`}</Badge>
                                </div>
                                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                                  <Button
                                    variant="secondary"
                                    onClick={() => saveStageAndNotify(stage.id)}
                                    disabled={saving || savingStageId === stage.id || !dirtyStageIds.includes(stage.id)}
                                    className="w-full rounded-xl cursor-pointer sm:w-auto"
                                  >
                                    <Save size={16} className="mr-2" />
                                    {savingStageId === stage.id ? "Saving…" : dirtyStageIds.includes(stage.id) ? "Save Stage" : "Saved"}
                                  </Button>
                                  <Button
                                    variant="primary"
                                    onClick={() => addTask(stage.id)}
                                    disabled={!hasTeamMembers}
                                    className="w-full rounded-xl cursor-pointer border-none text-white sm:w-auto"
                                  >
                                    <Plus size={16} className="mr-2" />
                                    Add Task
                                  </Button>
                                </div>
                              </div>
                              {dirtyStageIds.includes(stage.id) ? (
                                <div className="mt-3 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-xs font-semibold text-text-primary">
                                  This stage has unsaved changes. Save the stage to store updates and send any required notifications.
                                </div>
                              ) : null}
                            </div>

                            {stage.tasks.length ? (
                              dndReady ? (
                                <DndContext
                                  sensors={sensors}
                                  collisionDetection={closestCenter}
                                  onDragEnd={(event) => handleTaskDragEnd(stage.id, event)}
                                >
                                  <SortableContext
                                    items={stage.tasks.map((task) => task.id)}
                                    strategy={verticalListSortingStrategy}
                                  >
                                    <div className="space-y-4">
                                      {stage.tasks.map((task) => (
                                        <SortableTaskEditorCard
                                          key={task.id}
                                          stageId={stage.id}
                                          task={task}
                                          activeMembers={activeMembers}
                                          saving={saving}
                                          savingTaskId={savingTaskId}
                                          spotlight={spotlightTaskId === task.id}
                                          expanded={expandedTaskIdByStage[stage.id] === task.id || spotlightTaskId === task.id}
                                          onSaveTask={saveTaskAndNotify}
                                          onRemoveTask={(stageId, taskId) => updateStage(stageId, (current) => ({ ...current, tasks: current.tasks.filter((entry) => entry.id !== taskId) }))}
                                          onToggleExpand={toggleTaskExpanded}
                                          onUpdateTask={updateTask}
                                        />
                                      ))}
                                    </div>
                                  </SortableContext>
                                </DndContext>
                              ) : (
                                <div className="space-y-4">
                                  {stage.tasks.map((task) => (
                                    <StaticTaskEditorCard
                                      key={task.id}
                                      stageId={stage.id}
                                      task={task}
                                      activeMembers={activeMembers}
                                      saving={saving}
                                      savingTaskId={savingTaskId}
                                      spotlight={spotlightTaskId === task.id}
                                      expanded={expandedTaskIdByStage[stage.id] === task.id || spotlightTaskId === task.id}
                                      onSaveTask={saveTaskAndNotify}
                                      onRemoveTask={(stageId, taskId) => updateStage(stageId, (current) => ({ ...current, tasks: current.tasks.filter((entry) => entry.id !== taskId) }))}
                                      onToggleExpand={toggleTaskExpanded}
                                      onUpdateTask={updateTask}
                                    />
                                  ))}
                                </div>
                              )
                            ) : null}
                            {!stage.tasks.length ? (
                              <div className="rounded-2xl border border-dashed border-divider bg-background px-4 py-4 text-sm text-text-secondary">
                                No tasks yet. Add a task to begin assigning work to this stage.
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-divider bg-surface px-4 py-4 text-sm text-text-secondary">
                          Expand this stage to edit ownership, manage inline tasks, and use the sticky quick actions.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div />
        </Card>

        {!isStageManagerView ? (
          <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-premium space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl text-text-primary">Related Project Files</h3>
              <p className="text-sm text-text-secondary">Optional reference files for briefs, assets, contracts, and any other project material your team needs.</p>
            </div>
            <Button variant="secondary" onClick={addDeliverable} className="rounded-xl cursor-pointer">
              <Plus size={16} className="mr-2" />
              Add Project File
            </Button>
          </div>
          <div className="space-y-4">
            {deliverables.map((deliverable) => (
              <div key={deliverable.id} className="rounded-[1.75rem] border border-divider bg-background p-5 shadow-sm space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-base font-bold text-text-primary">{deliverable.title || "Untitled Project File"}</p>
                      <p className="text-sm text-text-secondary">
                        {deliverable.fileName || "Upload a related project file from your device"}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => { setDeliverables((current) => current.filter((entry) => entry.id !== deliverable.id)); markDirty(); }} className="rounded-xl cursor-pointer text-error hover:text-error">
                    <Trash2 size={16} />
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input labelInside="File Title" value={deliverable.title} onChange={(event) => { setDeliverables((current) => current.map((entry) => entry.id === deliverable.id ? { ...entry, title: event.target.value } : entry)); markDirty(); }} />
                  <Input labelInside="Optional Description" value={deliverable.description} onChange={(event) => { setDeliverables((current) => current.map((entry) => entry.id === deliverable.id ? { ...entry, description: event.target.value } : entry)); markDirty(); }} />
                </div>
                <Dropzone
                  label="Project File"
                  hint={uploadingDeliverableId === deliverable.id ? "Uploading to Cloudinary…" : "PDF, DOCX, XLSX, PPTX, TXT, images, and audio supported"}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.rtf,.txt,image/*,audio/*"
                  disabled={uploadingDeliverableId === deliverable.id}
                  onChange={async (file) => {
                    await uploadProjectFile(deliverable.id, file)
                  }}
                />
                {deliverable.url ? (
                  <a
                    href={deliverable.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-divider bg-surface px-4 py-3 text-sm text-text-primary transition hover:border-primary/20"
                  >
                    <div>
                      <p className="font-semibold">{deliverable.fileName || deliverable.title || "Uploaded file"}</p>
                      <p className="text-xs text-text-secondary">{deliverable.description || "Cloudinary-hosted project file"}</p>
                    </div>
                    <Badge variant="info">Uploaded</Badge>
                  </a>
                ) : (
                  <div className="rounded-2xl border border-dashed border-divider bg-surface px-4 py-3 text-sm text-text-secondary">
                    This file slot is optional. Upload only if the project needs supporting documents or assets.
                  </div>
                )}
              </div>
            ))}
          </div>
          </Card>
        ) : null}
        <div className="sticky bottom-4 z-20">
          <div className="ml-auto flex w-full max-w-md items-center justify-end gap-3 rounded-[1.6rem] border border-primary/20 bg-surface/95 p-3 shadow-premium backdrop-blur">
            <div className="mr-auto px-2 text-xs font-semibold text-text-secondary">
              {isStageManagerView ? (dirtyStageIds.length ? "Managed stages have unsaved changes" : "Managed stages saved") : dirty ? "Unsaved changes" : "All changes saved"}
            </div>
            <Button variant="secondary" onClick={handleViewPublic} className="py-2 px-4 shadow-sm text-xs rounded-xl cursor-pointer whitespace-nowrap">
              <Eye size={14} className="mr-1.5" />
              Preview
            </Button>
            {!isStageManagerView ? (
              <Button variant="primary" onClick={handleSave} disabled={saving || !dirty} className="py-2 px-5 shadow-sm text-sm rounded-xl cursor-pointer border-none text-white whitespace-nowrap">
                <Save size={14} className="mr-1.5" />
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}
