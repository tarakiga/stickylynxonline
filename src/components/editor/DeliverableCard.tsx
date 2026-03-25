"use client";
import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/IconButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Trash2,
  ExternalLink,
  UploadCloud,
  ImageIcon,
  FileText,
  AlignLeft,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Deliverable, DeliverableType } from "@/types/editor";

const TYPE_META: Record<DeliverableType, { label: string; icon: React.ReactNode; color: string }> = {
  file:  { label: "File",  icon: <FileText className="w-4 h-4" />,   color: "bg-info/10 text-info" },
  image: { label: "Image", icon: <ImageIcon className="w-4 h-4" />,  color: "bg-secondary/10 text-secondary" },
  url:   { label: "URL",   icon: <LinkIcon className="w-4 h-4" />,   color: "bg-primary/10 text-primary" },
  text:  { label: "Text",  icon: <AlignLeft className="w-4 h-4" />,  color: "bg-warning/10 text-warning" },
};

export function DeliverableCard({
  deliverable,
  onDelete,
}: {
  deliverable: Deliverable;
  onDelete: (id: string) => void;
}) {
  const safeType: DeliverableType = deliverable.type && deliverable.type in TYPE_META ? deliverable.type : "file";
  const meta = TYPE_META[safeType];
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  return (
    <>
    <div className="bg-surface border border-divider rounded-xl overflow-hidden transition-all hover:border-primary/20 group">
      {/* Type-specific content area */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", meta.color)}>
              {meta.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-text-primary truncate">{deliverable.title}</h4>
              <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{deliverable.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Badge variant={meta.color.includes("info") ? "info" : meta.color.includes("secondary") ? "success" : meta.color.includes("primary") ? "primary" : "warning"} className="text-[9px] px-1.5 py-0">
              {meta.label}
            </Badge>
            <IconButton variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="w-3.5 h-3.5" />
            </IconButton>
          </div>
        </div>

        {/* Type-specific display */}
        {safeType === "file" && (
          <div className="border-2 border-dashed border-divider rounded-lg p-4 flex items-center gap-3 bg-background group-hover:border-primary/30 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-surface shadow-sm flex items-center justify-center shrink-0">
              <UploadCloud className="w-5 h-5 text-text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">
                {deliverable.value || "Awaiting file upload from client"}
              </p>
              <p className="text-[10px] text-text-secondary">Click to upload or drag & drop</p>
            </div>
          </div>
        )}

        {safeType === "image" && (
          <div className="border-2 border-dashed border-divider rounded-lg p-4 flex items-center gap-3 bg-background group-hover:border-primary/30 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-surface shadow-sm flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5 text-text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">
                {deliverable.value || "Awaiting image from client"}
              </p>
              <p className="text-[10px] text-text-secondary">PNG, JPG, SVG up to 10MB</p>
            </div>
          </div>
        )}

        {safeType === "url" && deliverable.value && (
          <a
            href={deliverable.value}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-background border border-divider rounded-lg px-3 py-2.5 text-sm transition-colors hover:border-primary/30 hover:text-primary cursor-pointer"
          >
            <LinkIcon className="w-4 h-4 text-text-secondary shrink-0" />
            <span className="flex-1 truncate font-semibold text-text-primary text-xs">
              {deliverable.value}
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-text-secondary shrink-0" />
          </a>
        )}
        {safeType === "url" && !deliverable.value && (
          <div className="bg-background border border-divider rounded-lg px-3 py-2.5 text-xs text-text-secondary">
            Awaiting URL from client
          </div>
        )}

        {safeType === "text" && (
          <div className="bg-background border border-divider rounded-lg px-3 py-2.5">
            <p className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap">
              {deliverable.value || "Awaiting text content from client"}
            </p>
          </div>
        )}
      </div>
    </div>
    <ConfirmDialog
      isOpen={showDeleteConfirm}
      onClose={() => setShowDeleteConfirm(false)}
      onConfirm={() => onDelete(deliverable.id)}
      title="Delete Deliverable"
      description={`Are you sure you want to delete "${deliverable.title}"? This action cannot be undone.`}
    />
    </>
  );
}
