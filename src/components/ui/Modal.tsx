"use client"
import * as React from "react"
import { AlertTriangle, CheckCircle2, XCircle, Loader2, X } from "lucide-react"

export interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title: string;
  description: string;
  children?: React.ReactNode;
  icon?: "danger" | "success" | "error" | "info" | "progress";
}

export function Modal({ isOpen, onClose, title, description, children, icon }: ModalProps) {
  if (!isOpen) return null

  const getIcon = () => {
    switch(icon) {
      case "danger": return <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0"><AlertTriangle size={24} /></div>
      case "error": return <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0"><XCircle size={24} /></div>
      case "success": return <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0"><CheckCircle2 size={24} /></div>
      case "progress": return <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0"><Loader2 size={24} className="animate-spin" /></div>
      default: return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
       {/* Backdrop */}
       <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
       
       {/* Modal Content */}
       <div className="relative bg-surface border border-divider rounded-2xl p-6 md:p-8 shadow-premium w-full max-w-md animate-in fade-in zoom-in-95 duration-200" role="dialog" aria-modal="true">
          {onClose && (
            <button className="absolute right-4 top-4 text-text-secondary hover:text-text-primary transition-colors focus:outline-none bg-background rounded-full p-1 border-none cursor-pointer" onClick={onClose} aria-label="Close modal">
              <X size={20} />
            </button>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
             {getIcon()}
             <div className="flex-1 mt-1 sm:mt-0 text-center sm:text-left">
                <h3 className="text-lg font-bold text-text-primary leading-tight">{title}</h3>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">{description}</p>
                {children && <div className="mt-6 w-full">{children}</div>}
             </div>
          </div>
       </div>
    </div>
  )
}
