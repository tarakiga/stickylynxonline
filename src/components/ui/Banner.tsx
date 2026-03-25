"use client"
import * as React from "react"
import { AlertTriangle } from "lucide-react"

export function Banner({ title, desc, actionLabel, variant = "warning" }: { title: string, desc: React.ReactNode, actionLabel?: string, variant?: "warning" | "promo" }) {
  if (variant === "promo") {
      return (
        <div className="rounded-xl overflow-hidden relative shadow-md">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90"></div>
            <div className="relative z-10 p-5 text-white flex justify-between items-center gap-4">
                <div>
                    <h4 className="font-bold">{title}</h4>
                    <p className="text-xs opacity-90 mt-1">{desc}</p>
                </div>
                {actionLabel && <button className="bg-white text-primary text-xs font-bold px-4 py-2 rounded-full hover:shadow-lg border-none transition-transform hover:scale-105 shrink-0 cursor-pointer">{actionLabel}</button>}
            </div>
        </div>
      )
  }

  return (
    <div className="rounded-xl bg-warning/10 border border-warning text-warning p-4 flex items-start gap-3 shadow-sm">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
            <h4 className="font-bold text-sm">{title}</h4>
            <p className="text-xs mt-0.5 opacity-90">{desc}</p>
        </div>
    </div>
  )
}

export function CookiesBanner() {
  const [visible, setVisible] = React.useState(true)
  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-auto max-w-lg bg-surface border border-divider rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 z-50 animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
        <div className="text-sm">
            <span className="font-bold text-text-primary block md:inline mr-1">We use cookies</span> 
            <span className="text-text-secondary">to improve your experience.</span>
        </div>
        <div className="flex gap-2 w-full md:w-auto shrink-0">
            <button className="flex-1 md:flex-none border border-divider hover:bg-divider bg-transparent text-text-primary px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer" onClick={() => setVisible(false)}>Decline</button>
            <button className="flex-1 md:flex-none btn-primary px-4 py-2 text-xs font-bold rounded-lg border-none cursor-pointer" onClick={() => setVisible(false)}>Accept All</button>
        </div>
    </div>
  )
}
