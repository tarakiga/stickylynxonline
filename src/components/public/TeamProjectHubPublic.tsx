"use client";

import * as React from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Clock3, MessageSquare, Send, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Toaster, showToast } from "@/components/ui/Toast";
import {
  getTeamProjectStageCompletionPercentage,
  getTeamProjectStageStatus,
  getTeamProjectHubSections,
  getTeamProjectTaskStatusLabel,
  getTeamProjectTaskTimingLabel,
  type TeamProjectMember,
  type TeamProjectStage,
  type TeamProjectSubmissionType,
  type TeamProjectTask,
} from "@/lib/team-project-hub";
import type { EditorPage } from "@/types/editor-page";

type ViewerState = {
  isOwner: boolean
  isAdmin: boolean
  canAccess: boolean
  memberId: string | null
  memberName: string | null
}

type TeamProjectHubPublicProps = {
  page: EditorPage
  members: TeamProjectMember[]
  viewer: ViewerState
}

function ensureHref(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return "#"
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function toDateLabel(value: string | null) {
  if (!value) return "No due date"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "No due date"
  return parsed.toLocaleDateString()
}

function canManageStage(viewer: ViewerState, stage: TeamProjectStage) {
  return viewer.isOwner || (!!viewer.memberId && stage.stageOwnerType === "member" && stage.stageOwnerMemberId === viewer.memberId)
}

function canSubmitTask(viewer: ViewerState, task: TeamProjectTask) {
  return !!viewer.memberId && task.assigneeMemberId === viewer.memberId
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ""))
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

export function TeamProjectHubPublic({ page, members, viewer }: TeamProjectHubPublicProps) {
  const sections = React.useMemo(() => getTeamProjectHubSections(page.blocks || []), [page.blocks]);
  const [stages, setStages] = React.useState<TeamProjectStage[]>(sections.timeline.stages);
  const [submitTarget, setSubmitTarget] = React.useState<{ stageId: string; taskId: string } | null>(null);
  const [submissionType, setSubmissionType] = React.useState<TeamProjectSubmissionType>("text");
  const [submissionValue, setSubmissionValue] = React.useState("");
  const [submissionNote, setSubmissionNote] = React.useState("");
  const [submissionFile, setSubmissionFile] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [commentDrafts, setCommentDrafts] = React.useState<Record<string, string>>({});
  const [commenting, setCommenting] = React.useState<string | null>(null);
  const [approving, setApproving] = React.useState<string | null>(null);
  const [selectedStageId, setSelectedStageId] = React.useState("");
  const [expandedTaskByStage, setExpandedTaskByStage] = React.useState<Record<string, string | null>>({});
  const [stageRailOpen, setStageRailOpen] = React.useState(true);

  const visibleStages = React.useMemo(() => {
    if (viewer.isOwner || viewer.isAdmin) return stages
    if (!viewer.memberId) return []

    const seen = new Set<string>()
    return stages.filter((stage) => {
      const managesStage = stage.stageOwnerType === "member" && stage.stageOwnerMemberId === viewer.memberId
      const assignedStage = stage.tasks.some((task) => task.assigneeMemberId === viewer.memberId)
      const visible = managesStage || assignedStage
      if (!visible || seen.has(stage.id)) return false
      seen.add(stage.id)
      return true
    })
  }, [stages, viewer.isAdmin, viewer.isOwner, viewer.memberId])

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

  const activeStage = visibleStages.find((stage) => stage.id === selectedStageId) || visibleStages[0] || null

  React.useEffect(() => {
    if (!activeStage) return

    setExpandedTaskByStage((current) => {
      if (current[activeStage.id] && activeStage.tasks.some((task) => task.id === current[activeStage.id])) {
        return current
      }

      const priorityTask =
        activeStage.tasks.find((task) => canManageStage(viewer, activeStage) && task.status === "submitted") ||
        activeStage.tasks.find((task) => canSubmitTask(viewer, task) && task.status !== "approved_done") ||
        activeStage.tasks[0] ||
        null

      return {
        ...current,
        [activeStage.id]: priorityTask?.id || null,
      }
    })
  }, [activeStage, viewer])

  function updateTask(stageId: string, taskId: string, updater: (task: TeamProjectTask) => TeamProjectTask) {
    setStages((current) =>
      current.map((stage) =>
        stage.id === stageId
          ? { ...stage, tasks: stage.tasks.map((task) => (task.id === taskId ? updater(task) : task)) }
          : stage
      )
    )
  }

  async function handleSubmitTask() {
    if (!submitTarget) return
    setSubmitting(true)

    try {
      let value = submissionValue.trim()

      if (submissionType === "upload") {
        if (!submissionFile) throw new Error("Select a file to submit")
        value = await readFileAsDataUrl(submissionFile)
      }

      if (!value) throw new Error("Submission content is required")

      const response = await fetch(`/api/tasks/${page.handle}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: submitTarget.taskId,
          stageId: submitTarget.stageId,
          submission: {
            id: `submission-${Date.now()}`,
            type: submissionType,
            value,
            note: submissionNote.trim(),
            submittedAt: new Date().toISOString(),
          },
        }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.message || payload?.error || "Failed to submit task")

      updateTask(submitTarget.stageId, submitTarget.taskId, (task) => ({
        ...task,
        status: "submitted",
        submission: payload?.task?.submission || {
          id: `submission-${Date.now()}`,
          type: submissionType,
          value,
          note: submissionNote.trim(),
          submittedAt: new Date().toISOString(),
        },
        submittedAt: payload?.task?.submittedAt || new Date().toISOString(),
      }))

      setSubmitTarget(null)
      setSubmissionType("text")
      setSubmissionValue("")
      setSubmissionNote("")
      setSubmissionFile(null)
      showToast("Task submitted", "success")
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to submit task", "error")
    } finally {
      setSubmitting(false)
    }
  }

  async function postComment(stageId: string, taskId: string, requestChanges: boolean) {
    const key = `${stageId}:${taskId}`
    const text = commentDrafts[key]?.trim() || ""
    if (!text) {
      showToast("Comment cannot be empty", "warning")
      return
    }

    setCommenting(key)

    try {
      const response = await fetch(`/api/comments/${page.handle}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stageId,
          taskId,
          text,
          requestChanges,
        }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.message || payload?.error || "Failed to post comment")

      updateTask(stageId, taskId, (task) => ({
        ...task,
        status: requestChanges ? "changes_requested" : task.status,
        changesRequestedAt: requestChanges ? new Date().toISOString() : task.changesRequestedAt,
        comments: payload?.task?.comments || task.comments,
      }))

      setCommentDrafts((current) => ({ ...current, [key]: "" }))
      showToast(requestChanges ? "Comment posted and changes requested" : "Comment posted", "success")
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to post comment", "error")
    } finally {
      setCommenting(null)
    }
  }

  async function approveTask(stageId: string, taskId: string) {
    setApproving(`${stageId}:${taskId}`)

    try {
      const response = await fetch(`/api/tasks/${page.handle}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId, taskId, action: "approve" }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.message || payload?.error || "Failed to approve task")

      updateTask(stageId, taskId, (task) => ({
        ...task,
        status: "approved_done",
        approvedDoneAt: payload?.task?.approvedDoneAt || new Date().toISOString(),
      }))

      showToast("Task approved", "success")
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to approve task", "error")
    } finally {
      setApproving(null)
    }
  }

  return (
    <>
      <Toaster />
      <div className="mx-auto min-h-screen max-w-6xl space-y-8 px-4 py-8 pb-24">
        <Card className="rounded-[2rem] border border-divider bg-surface p-8 shadow-premium">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge variant="primary" className="rounded-full px-3 py-1 text-[10px] tracking-[0.18em] uppercase">
                Team Project Hub
              </Badge>
              <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight text-text-primary">{sections.header.title || page.title || "Team Project Hub"}</h1>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  {sections.header.department || "Internal Workspace"} • {sections.header.ownerName || "Owner"}
                </p>
                <p className="max-w-3xl text-base leading-8 text-text-secondary">{sections.header.summary}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-divider bg-background px-4 py-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-text-secondary">Overall Status</p>
                <p className="mt-2 text-lg font-bold text-text-primary">{sections.header.overallStatus || "Active"}</p>
              </div>
              <div className="rounded-2xl border border-divider bg-background px-4 py-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-text-secondary">Workspace Role</p>
                <p className="mt-2 text-lg font-bold text-text-primary">{viewer.isOwner ? "Creator" : viewer.memberName || "Contributor"}</p>
              </div>
              <div className="rounded-2xl border border-divider bg-background px-4 py-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-text-secondary">Team Members</p>
                <p className="mt-2 text-lg font-bold text-text-primary">{members.length}</p>
              </div>
            </div>
          </div>
          <div className="mt-8 rounded-[1.5rem] border border-primary/15 bg-primary/5 p-5">
            <p className="text-sm font-medium leading-7 text-text-primary">{sections.status.manualText || sections.status.text}</p>
          </div>
        </Card>

        <Card className="rounded-[2rem] border border-divider bg-surface p-6 shadow-sm space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <h2 className="text-xl font-bold text-text-primary">Stage Progress</h2>
              </div>
              <p className="mt-2 text-sm text-text-secondary">A compact stage carousel keeps long workflows manageable while still surfacing the current delivery phase.</p>
            </div>
            <Button variant="ghost" onClick={() => setStageRailOpen((value) => !value)} className="rounded-xl cursor-pointer">
              {stageRailOpen ? <ChevronUp size={16} className="mr-2" /> : <ChevronDown size={16} className="mr-2" />}
              {stageRailOpen ? "Collapse Stages" : "Expand Stages"}
            </Button>
          </div>
          {visibleStages.length ? (
            <>
              {stageRailOpen ? (
                <div className="rounded-[1.5rem] border border-divider bg-background p-4 text-sm text-text-secondary">
                  Stages can run in parallel. Select any stage below to review its live tasks, updates, and completion status.
                </div>
              ) : null}
              <div className="grid gap-3 lg:grid-cols-3">
                {visibleStages.map((stage) => {
                  const isActive = stage.id === activeStage?.id
                  const submittedCount = stage.tasks.filter((task) => task.status === "submitted").length
                  const completion = getTeamProjectStageCompletionPercentage(stage)
                  const derivedStatus = getTeamProjectStageStatus(stage)
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => setSelectedStageId(stage.id)}
                      className={`rounded-[1.5rem] border p-4 text-left transition cursor-pointer ${isActive ? "border-primary/30 bg-primary/5 shadow-sm" : "border-divider bg-background hover:border-primary/20"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-text-secondary">{stage.department || "Stage"}</p>
                          <p className="mt-2 text-lg font-bold text-text-primary">{stage.label}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={completion === 100 ? "success" : isActive ? "primary" : "neutral"}>
                            {derivedStatus}
                          </Badge>
                          <span className="text-xs font-semibold text-text-secondary">{completion}% complete</span>
                        </div>
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-divider">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completion}%` }} />
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-text-secondary">
                        <div>
                          <p className="font-semibold text-text-primary">{stage.tasks.length}</p>
                          <p>Tasks</p>
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary">{submittedCount}</p>
                          <p>In review</p>
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary">{toDateLabel(stage.dueDate)}</p>
                          <p>Due</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-divider bg-background px-5 py-6 text-sm text-text-secondary">
              No visible stages are available for your current role yet.
            </div>
          )}
        </Card>

        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-text-primary">Stage Workspace</h2>
            <p className="text-sm text-text-secondary">Creators and admins can see the full workspace. Assigned stage managers only see their own stage sections, while contributors see work tied to them.</p>
          </div>

          {activeStage ? (
            <Card className="rounded-[2rem] border border-divider bg-surface p-6 shadow-sm space-y-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{activeStage.department || "Stage"}</p>
                  <h3 className="text-2xl font-bold text-text-primary">{activeStage.label}</h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    Managed by {activeStage.stageOwnerName || "Creator"} • Due {toDateLabel(activeStage.dueDate)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {getTeamProjectStageCompletionPercentage(activeStage) === 100 ? (
                    <Badge variant="success">Completed</Badge>
                  ) : null}
                  {viewer.isAdmin && !viewer.isOwner ? (
                    <Badge variant="info">Admin View</Badge>
                  ) : null}
                  <Badge variant={canManageStage(viewer, activeStage) ? "primary" : "neutral"}>
                    {canManageStage(viewer, activeStage) ? "Manager Actions Enabled" : viewer.isAdmin ? "Admin Overview" : "Contributor View"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                {activeStage.tasks.map((task) => {
                  const timing = getTeamProjectTaskTimingLabel(task)
                  const manageStage = canManageStage(viewer, activeStage)
                  const canSubmit = canSubmitTask(viewer, task)
                  const draftKey = `${activeStage.id}:${task.id}`
                  const isExpanded = expandedTaskByStage[activeStage.id] === task.id
                  const latestComment = task.comments[task.comments.length - 1] || null

                  return (
                    <div key={task.id} className="rounded-[1.5rem] border border-divider bg-background p-5">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setExpandedTaskByStage((current) => ({
                          ...current,
                          [activeStage.id]: current[activeStage.id] === task.id ? null : task.id,
                        }))}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter" && event.key !== " ") return
                          event.preventDefault()
                          setExpandedTaskByStage((current) => ({
                            ...current,
                            [activeStage.id]: current[activeStage.id] === task.id ? null : task.id,
                          }))
                        }}
                        className="flex w-full cursor-pointer flex-col gap-4 text-left lg:flex-row lg:items-start lg:justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={task.status === "approved_done" ? "success" : task.status === "changes_requested" ? "warning" : task.status === "submitted" ? "primary" : "neutral"}>
                              {getTeamProjectTaskStatusLabel(task.status)}
                            </Badge>
                            {timing ? (
                              <Badge variant={timing.tone === "success" ? "success" : timing.tone === "error" ? "error" : "neutral"}>
                                {timing.label}
                              </Badge>
                            ) : null}
                            {latestComment ? (
                              <Badge variant={latestComment.isCorrectionRequest ? "warning" : "neutral"}>
                                Latest review {latestComment.isCorrectionRequest ? "requests changes" : "updated"}
                              </Badge>
                            ) : null}
                          </div>
                          <h4 className="text-xl font-bold text-text-primary">{task.title}</h4>
                          {task.description ? <p className="max-w-3xl text-sm leading-7 text-text-secondary">{task.description}</p> : null}
                          <div className="flex flex-wrap gap-5 text-sm leading-7 text-text-secondary">
                            <p><span className="font-semibold text-text-primary">Assignee:</span> {task.assigneeName || task.assigneeEmail || "Unassigned"}</p>
                            <p><span className="font-semibold text-text-primary">Due:</span> {toDateLabel(task.deliveryDueAt)}</p>
                            <p><span className="font-semibold text-text-primary">Comments:</span> {task.comments.length}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          {canSubmit && task.status !== "approved_done" ? (
                            <Button variant="primary" onClick={(event) => { event.stopPropagation(); setSubmitTarget({ stageId: activeStage.id, taskId: task.id }); }} className="rounded-xl border-none text-white cursor-pointer">
                              <Send size={14} className="mr-2" />
                              Submit
                            </Button>
                          ) : null}
                          {manageStage && task.status === "submitted" ? (
                            <Button variant="secondary" onClick={(event) => { event.stopPropagation(); approveTask(activeStage.id, task.id); }} disabled={approving === `${activeStage.id}:${task.id}`} className="rounded-xl cursor-pointer">
                              <CheckCircle2 size={14} className="mr-2" />
                              {approving === `${activeStage.id}:${task.id}` ? "Approving…" : "Approve"}
                            </Button>
                          ) : null}
                          <Button variant="ghost" className="rounded-xl cursor-pointer">
                            {isExpanded ? <ChevronUp size={16} className="mr-2" /> : <ChevronDown size={16} className="mr-2" />}
                            {isExpanded ? "Collapse" : "Open"}
                          </Button>
                        </div>
                      </div>

                      {isExpanded ? (
                        <div className="mt-5 space-y-5 border-t border-divider pt-5">
                          {task.submission ? (
                            <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                              <div className="flex items-center gap-2">
                                <Clock3 size={14} className="text-primary" />
                                <p className="text-sm font-semibold text-text-primary">
                                  Submission • {task.submission.type} • {task.submission.submittedAt ? new Date(task.submission.submittedAt).toLocaleString() : "Pending time"}
                                </p>
                              </div>
                              <div className="mt-3 space-y-2 text-sm text-text-secondary">
                                {task.submission.type === "link" ? (
                                  <a href={ensureHref(task.submission.value)} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                                    Open submitted link
                                  </a>
                                ) : (
                                  <p className="break-all">{task.submission.value}</p>
                                )}
                                {task.submission.note ? <p>{task.submission.note}</p> : null}
                              </div>
                            </div>
                          ) : null}

                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <MessageSquare size={16} className="text-primary" />
                              <h5 className="font-bold text-text-primary">Review Thread</h5>
                            </div>
                            <div className="space-y-3">
                              {task.comments.map((comment) => (
                                <div key={comment.id} className="rounded-2xl border border-divider bg-surface px-4 py-4">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-text-primary">{comment.authorName}</p>
                                    <Badge variant={comment.isCorrectionRequest ? "warning" : "neutral"}>
                                      {comment.isCorrectionRequest ? "Correction Request" : comment.authorRole.replace("_", " ")}
                                    </Badge>
                                  </div>
                                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-text-secondary">{comment.body}</p>
                                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                                    {new Date(comment.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                              {!task.comments.length ? (
                                <div className="rounded-2xl border border-dashed border-divider bg-surface px-4 py-4 text-sm text-text-secondary">
                                  No comments yet.
                                </div>
                              ) : null}
                            </div>
                            {(manageStage || canSubmit) ? (
                              <div className="rounded-2xl border border-divider bg-surface p-4 space-y-3">
                                <Textarea
                                  rows={3}
                                  value={commentDrafts[draftKey] || ""}
                                  onChange={(event) => setCommentDrafts((current) => ({ ...current, [draftKey]: event.target.value }))}
                                  placeholder={manageStage ? "Add feedback, request changes, or leave a note." : "Reply to the review thread."}
                                />
                                <div className="flex flex-wrap gap-2">
                                  <Button variant="secondary" onClick={() => postComment(activeStage.id, task.id, false)} disabled={commenting === draftKey} className="rounded-xl cursor-pointer">
                                    {commenting === draftKey ? "Posting…" : "Post Comment"}
                                  </Button>
                                  {manageStage ? (
                                    <Button variant="primary" onClick={() => postComment(activeStage.id, task.id, true)} disabled={commenting === draftKey} className="rounded-xl border-none text-white cursor-pointer">
                                      Request Changes
                                    </Button>
                                  ) : null}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
                {!activeStage.tasks.length ? (
                  <div className="rounded-[1.5rem] border border-dashed border-divider bg-background px-5 py-6 text-sm text-text-secondary">
                    No tasks have been assigned in this stage yet.
                  </div>
                ) : null}
              </div>
            </Card>
          ) : null}
        </section>

        {sections.deliverables.items.length ? (
          <Card className="rounded-[2rem] border border-divider bg-surface p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-text-primary">Related Project Files</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {sections.deliverables.items.map((item) => (
                <a key={item.id} href={ensureHref(item.url)} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-divider bg-background px-4 py-4 transition hover:border-primary/25">
                  <p className="font-bold text-text-primary">{item.title || item.fileName || "Project File"}</p>
                  {item.fileName ? <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{item.fileName}</p> : null}
                  {item.description ? <p className="mt-2 text-sm leading-7 text-text-secondary">{item.description}</p> : null}
                </a>
              ))}
            </div>
          </Card>
        ) : null}

        {submitTarget ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-[2rem] border border-divider bg-surface p-6 shadow-premium space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-text-primary">Submit Task</h3>
                <Button variant="ghost" onClick={() => setSubmitTarget(null)} className="rounded-xl cursor-pointer">
                  Close
                </Button>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-semibold text-text-secondary">Submission Type</span>
                <select
                  value={submissionType}
                  onChange={(event) => setSubmissionType(event.target.value as TeamProjectSubmissionType)}
                  className="w-full input-base px-4 py-3 appearance-none cursor-pointer text-text-primary bg-background focus:ring-primary-light"
                >
                  <option value="text">Text</option>
                  <option value="upload">Upload</option>
                  <option value="link">Link</option>
                </select>
              </div>
              {submissionType === "text" ? (
                <Textarea rows={5} value={submissionValue} onChange={(event) => setSubmissionValue(event.target.value)} placeholder="Describe the submission or paste the deliverable text." />
              ) : submissionType === "link" ? (
                <Textarea rows={3} value={submissionValue} onChange={(event) => setSubmissionValue(event.target.value)} placeholder="Paste the deliverable URL." />
              ) : (
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-text-secondary">File</span>
                  <input type="file" onChange={(event) => setSubmissionFile(event.target.files?.[0] || null)} className="w-full text-sm text-text-primary" />
                </div>
              )}
              <Textarea rows={3} value={submissionNote} onChange={(event) => setSubmissionNote(event.target.value)} placeholder="Optional note for the reviewer." />
              <Button variant="primary" onClick={handleSubmitTask} disabled={submitting} className="w-full justify-center rounded-xl border-none text-white cursor-pointer">
                {submitting ? "Submitting…" : "Submit Task"}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}
