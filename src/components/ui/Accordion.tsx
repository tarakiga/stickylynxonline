"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

export interface AccordionItem {
  id: string
  title: string
  content: React.ReactNode
}

export function Accordion({ items, defaultOpenId, className }: { items: AccordionItem[]; defaultOpenId?: string; className?: string }) {
  const [open, setOpen] = React.useState<string | null>(defaultOpenId || null)
  return (
    <div className={cn("space-y-2", className)}>
      {items.map(it => (
        <div key={it.id} className="border border-divider rounded-xl bg-surface overflow-hidden">
          <button
            onClick={() => setOpen(prev => (prev === it.id ? null : it.id))}
            className="w-full flex items-center justify-between px-4 py-3 text-left font-bold text-text-primary hover:bg-background cursor-pointer border-none"
          >
            <span>{it.title}</span>
            <span className="text-text-secondary">{open === it.id ? "−" : "+"}</span>
          </button>
          {open === it.id && <div className="px-4 py-3 border-t border-divider text-text-secondary">{it.content}</div>}
        </div>
      ))}
    </div>
  )
}
