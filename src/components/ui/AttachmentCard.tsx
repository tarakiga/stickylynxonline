"use client"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/Badge"
import { FileText, ImageIcon, Link as LinkIcon, AlignLeft, ExternalLink, Eye, Download, X } from "lucide-react"

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; badgeVariant: "info" | "success" | "primary" | "warning" }> = {
  file:     { label: "File",  icon: <FileText className="w-4 h-4" />,  color: "bg-info/10 text-info",         badgeVariant: "info" },
  image:    { label: "Image", icon: <ImageIcon className="w-4 h-4" />, color: "bg-secondary/10 text-secondary", badgeVariant: "success" },
  document: { label: "File",  icon: <FileText className="w-4 h-4" />,  color: "bg-info/10 text-info",         badgeVariant: "info" },
  url:      { label: "URL",   icon: <LinkIcon className="w-4 h-4" />,  color: "bg-primary/10 text-primary",   badgeVariant: "primary" },
  text:     { label: "Text",  icon: <AlignLeft className="w-4 h-4" />, color: "bg-warning/10 text-warning",   badgeVariant: "warning" },
}

function ensureProtocol(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) return url
  return `https://${url}`
}

export interface AttachmentCardProps {
  type: string;
  value: string;
  className?: string;
}

export function AttachmentCard({ type, value, className }: AttachmentCardProps) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.file
  const [showPreview, setShowPreview] = React.useState(false)

  // URL: render as a clickable hyperlink card
  if (type === "url") {
    return (
      <a
        href={ensureProtocol(value)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-2 bg-background border border-divider rounded-xl px-3 py-2.5 transition-colors hover:border-primary/30 hover:bg-primary/5 group overflow-hidden",
          className
        )}
      >
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", config.color)}>
          {config.icon}
        </div>
        <span className="flex-1 text-[11px] sm:text-xs font-semibold text-primary truncate min-w-0 group-hover:underline">
          {value}
        </span>
        <ExternalLink className="w-3.5 h-3.5 text-text-secondary shrink-0" />
      </a>
    )
  }

  // Text: render as a styled text block
  if (type === "text") {
    return (
      <div className={cn("bg-background border border-divider rounded-xl p-3 overflow-hidden", className)}>
        <div className="flex items-center gap-2 mb-2">
          <div className={cn("w-6 h-6 rounded-md flex items-center justify-center shrink-0", config.color)}>
            <AlignLeft className="w-3 h-3" />
          </div>
          <Badge variant={config.badgeVariant} className="text-[9px] px-1.5 py-0">{config.label}</Badge>
        </div>
        <p className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap break-words" style={{ overflowWrap: "anywhere" }}>
          {value}
        </p>
      </div>
    )
  }

  // File / Image: render as a file attachment card with preview + download
  const isDataUrl = value.startsWith("data:");
  const isWebUrl = value.startsWith("http") || value.startsWith("/");
  const canPreview = isDataUrl || isWebUrl;
  const isImageType = type === "image" || (isDataUrl && value.startsWith("data:image"));
  const displayName = isDataUrl ? (isImageType ? "Uploaded image" : "Uploaded file") : value;
  return (
    <>
      <div className={cn("bg-background border border-divider rounded-xl overflow-hidden", className)}>
        {/* Image thumbnail preview */}
        {isImageType && canPreview && (
          <div className="cursor-pointer" onClick={() => setShowPreview(true)}>
            <img src={isDataUrl ? value : ensureProtocol(value)} alt="Preview" className="w-full max-h-[200px] object-cover" />
          </div>
        )}
        <div className="p-3 flex items-center gap-2 sm:gap-3">
          <div className={cn("w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0", config.color)}>
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-text-primary truncate">{displayName}</p>
            <p className="text-[10px] text-text-secondary">{isImageType ? "Image attachment" : "File attachment"}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {canPreview && (
              <button onClick={() => setShowPreview(true)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-divider text-text-secondary flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors border-none cursor-pointer">
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}
            {canPreview && (
              <a href={isDataUrl ? value : ensureProtocol(value)} download={displayName} className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Download className="w-3.5 h-3.5" />
              </a>
            )}
            <Badge variant={config.badgeVariant} className="text-[9px] px-1.5 py-0">{config.label}</Badge>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      {showPreview && canPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
          <div className="relative bg-surface border border-divider rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-divider">
              <p className="text-sm font-bold text-text-primary truncate flex-1">{displayName}</p>
              <div className="flex items-center gap-2 shrink-0">
                <a href={isDataUrl ? value : ensureProtocol(value)} download={displayName} className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <Download className="w-4 h-4" />
                </a>
                <button onClick={() => setShowPreview(false)} className="w-8 h-8 rounded-lg bg-divider hover:bg-error/10 hover:text-error flex items-center justify-center transition-colors border-none cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(85vh-64px)] flex items-center justify-center bg-background">
              {isImageType ? (
                <img src={isDataUrl ? value : ensureProtocol(value)} alt={displayName} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-30" />
                  <p className="text-sm font-semibold text-text-primary">{displayName}</p>
                  <p className="text-xs text-text-secondary mt-1">Use the download button to open this file</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
