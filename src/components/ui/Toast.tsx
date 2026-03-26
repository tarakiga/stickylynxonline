"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

type ToastVariant = "info" | "success" | "warning" | "error"

type ToastItem = {
  id: string
  message: string
  variant?: ToastVariant
}

export function showToast(message: string, variant: ToastVariant = "info") {
  if (typeof window !== "undefined") {
    const detail = { id: `t-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, message, variant }
    window.dispatchEvent(new CustomEvent("slx-toast", { detail }))
  }
}

export function Toaster() {
  const [items, setItems] = React.useState<ToastItem[]>([])
  React.useEffect(() => {
    function onAdd(e: Event) {
      const ev = e as CustomEvent<ToastItem>
      setItems(prev => [...prev, ev.detail])
      setTimeout(() => {
        setItems(prev => prev.filter(x => x.id !== ev.detail.id))
      }, 3000)
    }
    window.addEventListener("slx-toast", onAdd as EventListener)
    return () => window.removeEventListener("slx-toast", onAdd as EventListener)
  }, [])
  return (
    <div className="fixed bottom-6 right-6 z-[100] space-y-2">
      {items.map(it => (
        <div key={it.id} className={cn(
          "rounded-xl px-4 py-3 shadow-premium border text-sm",
          "bg-surface border-divider text-text-primary",
          it.variant === "success" && "border-success/30",
          it.variant === "warning" && "border-warning/30",
          it.variant === "error" && "border-error/30"
        )}>
          {it.message}
        </div>
      ))}
    </div>
  )
}
