"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps {
  src?: string
  name?: string
  size?: number
  rounded?: "full" | "xl"
  className?: string
}

export function Avatar({ src, name, size = 48, rounded = "xl", className }: AvatarProps) {
  const initials = (name || "").trim().substring(0, 2).toUpperCase() || "A"
  const r = rounded === "full" ? "rounded-full" : "rounded-xl"
  return (
    <div
      className={cn("bg-divider overflow-hidden border border-divider shadow-sm flex items-center justify-center text-text-primary", r, className)}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={name || "Avatar"} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-primary/10 text-primary font-bold flex items-center justify-center">
          {initials}
        </div>
      )}
    </div>
  )
}
