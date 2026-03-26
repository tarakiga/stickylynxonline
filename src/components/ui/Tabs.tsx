"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

export interface Tab {
  id: string
  label: string
}

export function Tabs({ tabs, value, onChange, className }: { tabs: Tab[]; value: string; onChange: (id: string) => void; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 bg-surface border border-divider rounded-xl p-1", className)}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "px-4 py-2 text-sm font-bold rounded-lg cursor-pointer border-none",
            value === t.id ? "bg-primary text-on-primary shadow-sm" : "text-text-secondary hover:text-text-primary hover:bg-background"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
