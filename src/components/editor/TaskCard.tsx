"use client";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/IconButton";
import { StatusToggle } from "@/components/ui/StatusToggle";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Calendar,
  Send,
  Trash2,
  Edit2,
  ExternalLink,
  FileText,
  ImageIcon,
  AlignLeft,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types/editor";

/* ─── Component ──────────────────────────────────────────────── */
export function TaskCard({
  task,
  onStatusChange,
  onDelete,
  onSubmit,
  onEdit,
}: {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onSubmit: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  const submissionIcon: Record<string, React.ReactNode> = {
    url: <ExternalLink className="w-3.5 h-3.5" />,
    file: <FileText className="w-3.5 h-3.5" />,
    image: <ImageIcon className="w-3.5 h-3.5" />,
    text: <AlignLeft className="w-3.5 h-3.5" />,
  };

  return (
    <>
      <div
        className={cn(
          "bg-surface border border-divider rounded-xl overflow-hidden transition-all group",
          task.status === "done" ? "opacity-60" : "hover:border-primary/20"
        )}
      >
        <div className="p-4 flex items-start gap-3">
          {/* Left: status + info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusToggle
                status={task.status}
                onChange={(next) => onStatusChange(task.id, next)}
              />
              {task.dueDate && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md",
                    isOverdue
                      ? "bg-error/10 text-error"
                      : "bg-divider text-text-secondary"
                  )}
                >
                  <Calendar className="w-3 h-3" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
              {task.submission && (
                <Badge variant="primary" className="text-[9px] px-1.5 py-0">Submitted</Badge>
              )}
              {(task.comments?.length ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] text-text-secondary font-semibold">
                  <MessageSquare className="w-3 h-3" /> {task.comments.length}
                </span>
              )}
            </div>

            <h4 className={cn(
              "font-bold text-sm text-text-primary",
              task.status === "done" && "line-through"
            )}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Submission preview */}
            {task.submission && (
              <div className="flex items-center gap-1.5 text-[10px] text-primary font-semibold">
                {submissionIcon[task.submission.type]}
                <span className="truncate max-w-[200px]">{task.submission.value}</span>
              </div>
            )}
          </div>

          {/* Right: actions */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            {task.status !== "done" && !task.submission && (
              <Button
                variant="primary"
                onClick={() => onSubmit(task.id)}
                className="text-[10px] py-1 px-2.5 rounded-lg h-auto cursor-pointer border-none text-white shadow-sm"
              >
                <Send className="w-3 h-3 mr-1" /> Submit
              </Button>
            )}
            <div className="flex items-center gap-0.5">
              <IconButton variant="primary" size="sm" onClick={() => onEdit(task.id)} title="Edit task">
                <Edit2 className="w-3.5 h-3.5" />
              </IconButton>
              <IconButton variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)} title="Delete task">
                <Trash2 className="w-3.5 h-3.5" />
              </IconButton>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => onDelete(task.id)}
        title="Delete Task"
        description={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
      />
    </>
  );
}
