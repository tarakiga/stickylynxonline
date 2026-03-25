"use client"
import * as React from "react"
import { cn } from "@/lib/utils"
import { type TaskStatus, TASK_STATUS_META } from "@/types/editor"

export interface StatusToggleProps {
  status: TaskStatus;
  onChange: (next: TaskStatus) => void;
  disabled?: boolean;
}

export function StatusToggle({ status, onChange, disabled }: StatusToggleProps) {
  const meta = TASK_STATUS_META[status]

  const colorMap: Record<TaskStatus, string> = {
    todo:        "bg-divider text-text-secondary hover:bg-text-secondary/20",
    in_progress: "bg-primary/10 text-primary hover:bg-primary/20",
    review:      "bg-warning/10 text-warning hover:bg-warning/20",
    done:        "bg-success/10 text-success hover:bg-success/20",
  }

  return (
    <button
      type="button"
      onClick={() => onChange(meta.next)}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide border-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-primary-light disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap",
        colorMap[status]
      )}
      title={`Click to change status to "${TASK_STATUS_META[meta.next].label}"`}
    >
      <span className={cn(
        "w-1.5 h-1.5 rounded-full shrink-0",
        {
          "bg-text-secondary": status === "todo",
          "bg-primary":        status === "in_progress",
          "bg-warning":        status === "review",
          "bg-success":        status === "done",
        }
      )} />
      {meta.label}
    </button>
  )
}
