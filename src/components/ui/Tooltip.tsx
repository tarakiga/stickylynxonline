"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

export function Tooltip({ content, children, className }: { content: React.ReactNode; children: React.ReactNode; className?: string }) {
  const [open, setOpen] = React.useState(false)
  return (
    <span className={cn("relative inline-flex", className)} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {children}
      {open && (
        <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap bg-surface border border-divider text-text-secondary text-xs font-semibold px-2 py-1 rounded-lg shadow-sm z-50">
          {content}
        </span>
      )}
    </span>
  )
}
