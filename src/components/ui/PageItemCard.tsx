"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { Eye, Edit2, Trash2, QrCode, Link2, Check, Download, X, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { Badge } from "@/components/ui/Badge"
import { QR_API_BASE } from "@/config/services"

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
  const [showMobileMore, setShowMobileMore] = React.useState(false);

  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${handle}`;
  const qrUrl = QR_API_BASE ? `${QR_API_BASE}/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}` : "";

  const catLabel = (category || "").replace(/_/g, " ");
  const catVariant: "success" | "warning" | "error" | "info" | "primary" | "neutral" =
    category === "PROJECT_PORTAL"
      ? "primary"
      : category === "EPK"
      ? "info"
      : /MENU|FOOD/i.test(category || "")
      ? "success"
      : "neutral";

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
    <div className="flex flex-col gap-2">
      <div className="group bg-surface border border-divider rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between shadow-sm hover:shadow-premium transition-all duration-300 relative overflow-hidden">
        {/* Subtle hover background highlight */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Content Section */}
        <div className="flex items-start md:items-center gap-4 min-w-0 flex-1 relative z-10">
          {/* Thumbnail: Hidden on mobile, visible on desktop */}
          <div className="hidden md:flex w-14 h-14 rounded-2xl border border-divider bg-background shadow-sm overflow-hidden shrink-0 items-center justify-center p-1.5 group-hover:border-primary/40 group-hover:shadow-md transition-all duration-300">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="w-full h-full object-contain rounded-xl" />
            ) : (
              <div className="w-full h-full bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-base">
                {title.substring(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          {/* Text stack: Stays stacked on both, but vertical on mobile */}
          <div className="min-w-0 flex flex-col gap-1 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Badge variant={catVariant} className="text-[10px] px-2 py-0.5 font-bold tracking-wider uppercase inline-flex rounded-md">{catLabel}</Badge>
            </div>
            <h3 className="font-bold text-text-primary text-base sm:text-lg leading-tight truncate group-hover:text-primary transition-colors">{title}</h3>
            <div className="flex items-center gap-1.5 text-text-secondary">
              <Link2 size={12} className="shrink-0 opacity-60" />
              <p className="text-xs font-medium truncate opacity-80 group-hover:opacity-100 transition-opacity">stickylynx.online/{handle}</p>
            </div>
          </div>
        </div>

        {/* Actions Section: Aligned at bottom on mobile, right on desktop */}
        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 relative z-10 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-divider/40">
          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-1">
            <button onClick={handlePreview} className="p-2.5 rounded-xl text-text-secondary hover:text-primary hover:bg-primary/10 transition-all cursor-pointer border-none bg-transparent hover:scale-105 active:scale-95" title="Preview">
              <Eye size={19} />
            </button>
            <button onClick={handleEdit} className="p-2.5 rounded-xl text-text-secondary hover:text-primary hover:bg-primary/10 transition-all cursor-pointer border-none bg-transparent hover:scale-105 active:scale-95" title="Edit">
              <Edit2 size={19} />
            </button>
            <div className="w-px h-6 bg-divider mx-1 opacity-60" />
            {QR_API_BASE && (
              <button onClick={() => setShowQrModal(true)} className="p-2.5 rounded-xl text-text-secondary hover:text-primary hover:bg-primary/10 transition-all cursor-pointer border-none bg-transparent hover:scale-105 active:scale-95" title="QR Code">
                <QrCode size={19} />
              </button>
            )}
            <button onClick={handleCopyLink} className="p-2.5 rounded-xl text-text-secondary hover:text-primary hover:bg-primary/10 transition-all cursor-pointer border-none bg-transparent hover:scale-105 active:scale-95" title="Copy Link">
              {linkCopied ? <Check size={19} className="text-success" /> : <Link2 size={19} />}
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} className="ml-1 p-2.5 rounded-xl text-text-secondary hover:text-error hover:bg-error/10 transition-all cursor-pointer border-none bg-transparent hover:scale-105 active:scale-95" title="Delete">
              <Trash2 size={19} />
            </button>
          </div>

          {/* Mobile compact row: Full width flex on mobile */}
          <div className="flex md:hidden items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2">
              <button onClick={handlePreview} className="flex items-center gap-2 px-3 py-2 rounded-xl text-text-secondary bg-divider/20 hover:text-primary transition-all active:scale-95 text-xs font-bold" title="Preview">
                <Eye size={16} /> <span>View</span>
              </button>
              <button onClick={handleEdit} className="flex items-center gap-2 px-3 py-2 rounded-xl text-text-secondary bg-divider/20 hover:text-primary transition-all active:scale-95 text-xs font-bold" title="Edit">
                <Edit2 size={16} /> <span>Edit</span>
              </button>
            </div>
            <button 
              onClick={() => setShowMobileMore(v => !v)} 
              className={cn(
                "p-2.5 rounded-xl text-text-secondary transition-all cursor-pointer border active:scale-95", 
                showMobileMore ? "bg-primary/10 text-primary border-primary/20" : "bg-divider/20 border-transparent"
              )} 
              title="More"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Mobile: expanded extra actions with professional styling */}
        {showMobileMore && (
          <div className="md:hidden animate-in slide-in-from-top-2 fade-in duration-200 bg-background/50 border-t border-divider/20 mt-2 pt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button onClick={handleCopyLink} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-text-secondary hover:text-primary transition-all cursor-pointer border-none bg-transparent">
                {linkCopied ? <Check size={14} className="text-success" /> : <Link2 size={14} />}
                <span>Link</span>
              </button>
              {QR_API_BASE && (
                <button onClick={() => setShowQrModal(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-text-secondary hover:text-primary transition-all cursor-pointer border-none bg-transparent">
                  <QrCode size={14} />
                  <span>QR</span>
                </button>
              )}
            </div>
            <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-error hover:bg-error/5 transition-all cursor-pointer border-none bg-transparent">
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        )}
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" />
          <div className="relative bg-surface border border-divider rounded-[2rem] p-8 shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-300 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Background decorative elements */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <button onClick={() => setShowQrModal(false)} className="absolute right-6 top-6 text-text-secondary hover:text-text-primary transition-all bg-background/50 hover:bg-background rounded-full p-2 border border-divider/50 cursor-pointer z-10">
              <X size={20} />
            </button>

            <div className="relative z-10">
              <div className="mb-6">
                <h3 className="text-2xl font-black text-text-primary tracking-tight mb-1">QR Code</h3>
                <p className="text-sm text-text-secondary">Scan or share to grow your reach</p>
              </div>

              <div className="bg-white rounded-[1.5rem] p-6 flex flex-col items-center justify-center mb-6 border border-divider shadow-inner group/qr relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/qr:opacity-100 transition-opacity pointer-events-none" />
                <img src={qrUrl} alt={`QR code for ${title}`} className="w-[220px] h-[220px] relative z-10" />
              </div>

              <div className="bg-background/50 border border-divider rounded-xl p-3 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center shrink-0 border border-divider">
                  <Link2 size={18} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase font-bold text-text-secondary tracking-widest mb-0.5">Public URL</p>
                  <p className="text-xs font-medium text-text-primary truncate">{publicUrl.replace(/^https?:\/\//, "")}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <a
                  href={qrUrl}
                  download={`${handle}-qr.png`}
                  className="w-full btn-primary py-4 rounded-2xl text-base font-bold text-center flex items-center justify-center gap-2 text-white border-none cursor-pointer hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  <Download size={18} /> Download Asset
                </a>
                <button
                  onClick={handleCopyLink}
                  className="w-full bg-surface border border-divider hover:border-primary/30 hover:bg-primary/5 py-4 rounded-2xl text-base font-bold text-text-primary flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  {linkCopied ? <><Check size={18} className="text-success" /> Copied!</> : <><Link2 size={18} /> Copy Link</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
