"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { Eye, Edit2, Trash2, QrCode, Link2, Check, Download, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { Badge } from "@/components/ui/Badge"

export interface PageItemCardProps {
  id: string;
  title: string;
  handle: string;
  category: string;
  imageUrl?: string;
}

export function PageItemCard({ id, title, handle, category, imageUrl }: PageItemCardProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showQrModal, setShowQrModal] = React.useState(false);
  const [linkCopied, setLinkCopied] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${handle}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}`;

  function handlePreview() {
    window.open(`/${handle}`, "_blank");
  }

  function handleEdit() {
    router.push(`/dashboard/editor/${id}`);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(publicUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  return (
    <>
      <div className="group bg-surface border border-divider rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-sm hover:shadow-premium transition-all duration-300">
        {/* Left: avatar + title + category */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border border-divider bg-background shadow-sm overflow-hidden shrink-0 flex items-center justify-center p-1 group-hover:border-primary/30 transition-colors">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="w-full h-full object-contain rounded-lg" />
            ) : (
              <div className="w-full h-full bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-sm">
                {title.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-text-primary text-sm sm:text-base truncate">{title}</h3>
            <p className="text-[10px] text-text-secondary truncate">/{handle}</p>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Desktop actions */}
          <div className="hidden sm:flex items-center gap-0.5">
            <button onClick={handlePreview} className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer border-none bg-transparent" title="Preview">
              <Eye size={17} />
            </button>
            <button onClick={handleEdit} className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer border-none bg-transparent" title="Edit">
              <Edit2 size={17} />
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} className="p-2 rounded-lg text-text-secondary hover:text-error hover:bg-error/10 transition-colors cursor-pointer border-none bg-transparent" title="Delete">
              <Trash2 size={17} />
            </button>
            <div className="w-px h-5 bg-divider mx-1" />
            <button onClick={() => setShowQrModal(true)} className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer border-none bg-transparent" title="QR Code">
              <QrCode size={17} />
            </button>
            <button onClick={handleCopyLink} className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer border-none bg-transparent" title="Copy Link">
              {linkCopied ? <Check size={17} className="text-success" /> : <Link2 size={17} />}
            </button>
          </div>

          {/* Mobile: compact row */}
          <div className="flex sm:hidden items-center gap-0.5">
            <button onClick={handlePreview} className="p-1.5 rounded-lg text-text-secondary hover:text-primary transition-colors cursor-pointer border-none bg-transparent"><Eye size={16} /></button>
            <button onClick={handleEdit} className="p-1.5 rounded-lg text-text-secondary hover:text-primary transition-colors cursor-pointer border-none bg-transparent"><Edit2 size={16} /></button>
            <button onClick={() => setShowDeleteConfirm(true)} className="p-1.5 rounded-lg text-text-secondary hover:text-error transition-colors cursor-pointer border-none bg-transparent"><Trash2 size={16} /></button>
            <button onClick={handleCopyLink} className="p-1.5 rounded-lg text-text-secondary hover:text-primary transition-colors cursor-pointer border-none bg-transparent">
              {linkCopied ? <Check size={16} className="text-success" /> : <Link2 size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Lynx"
        description={`Are you sure you want to delete "${title}"? All pages, tasks, and data will be permanently removed.`}
      />

      {/* QR Code modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowQrModal(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />
          <div className="relative bg-surface border border-divider rounded-2xl p-6 shadow-premium w-full max-w-sm animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowQrModal(false)} className="absolute right-4 top-4 text-text-secondary hover:text-text-primary transition-colors bg-background rounded-full p-1 border-none cursor-pointer">
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-text-primary mb-1">QR Code</h3>
            <p className="text-xs text-text-secondary mb-4">Scan or download to share <strong>{title}</strong></p>
            <div className="bg-white rounded-xl p-4 flex items-center justify-center mb-4 border border-divider">
              <img src={qrUrl} alt={`QR code for ${title}`} className="w-[200px] h-[200px]" />
            </div>
            <p className="text-[10px] text-text-secondary text-center mb-4 truncate">{publicUrl}</p>
            <div className="flex gap-2">
              <a
                href={qrUrl}
                download={`${handle}-qr.png`}
                className="flex-1 btn-primary py-2.5 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2 text-white border-none cursor-pointer"
              >
                <Download size={14} /> Download
              </a>
              <button
                onClick={handleCopyLink}
                className="flex-1 bg-surface border border-divider hover:bg-divider py-2.5 rounded-xl text-sm font-bold text-text-primary flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {linkCopied ? <><Check size={14} className="text-success" /> Copied!</> : <><Link2 size={14} /> Copy Link</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
