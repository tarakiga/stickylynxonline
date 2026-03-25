/* ═══════════════════════════════════════════════════════════════
   Shared types for the Project Portal editor system.
   Single source of truth — imported by all editor components.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Primitives ──────────────────────────────────────────────── */
export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type DeliverableType = "file" | "image" | "url" | "text";
export type AttachmentType = "url" | "image" | "document";
export type ReviewStatus = "draft" | "submitted" | "approved" | "revision_needed";

/* ─── Task System ─────────────────────────────────────────────── */
export interface TaskSubmission {
  type: DeliverableType;
  value: string;
  submittedAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Task {
  id: string;
  stageId: string;
  title: string;
  description: string;
  dueDate: string | null;
  status: TaskStatus;
  submission: TaskSubmission | null;
  comments: TaskComment[];
}

/* ─── Deliverable System ──────────────────────────────────────── */
export interface Deliverable {
  id: string;
  type: DeliverableType;
  title: string;
  description: string;
  value: string; // URL, file reference, or text content
}

/* ─── Stage Review System ─────────────────────────────────────── */
export interface Attachment {
  id: string;
  type: AttachmentType;
  value: string;
  label: string;
}

export interface StageReview {
  id: string;
  stageId: string;
  title: string;
  description: string;
  attachments: Attachment[];
  submittedAt: string;
  status: ReviewStatus;
}

export interface StageComment {
  id: string;
  stageId: string;
  reviewId?: string;
  author: string;
  text: string;
  timestamp: string;
  resolved: boolean;
}

/* ─── Milestone ───────────────────────────────────────────────── */
export interface MilestoneWithReviews {
  id: string;
  label: string;
  reviews: StageReview[];
  comments: StageComment[];
  tasks: Task[];
}

/* ─── Status Metadata ─────────────────────────────────────────── */
export const TASK_STATUS_META: Record<
  TaskStatus,
  { label: string; variant: "neutral" | "primary" | "warning" | "success"; next: TaskStatus }
> = {
  todo:        { label: "To Do",       variant: "neutral",  next: "in_progress" },
  in_progress: { label: "In Progress", variant: "primary",  next: "review" },
  review:      { label: "In Review",   variant: "warning",  next: "done" },
  done:        { label: "Done",        variant: "success",  next: "todo" },
};

export const DELIVERABLE_TYPE_OPTIONS: { label: string; value: DeliverableType }[] = [
  { label: "File Upload", value: "file" },
  { label: "Image",       value: "image" },
  { label: "URL Link",    value: "url" },
  { label: "Text",        value: "text" },
];
