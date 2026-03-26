"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-divider/60 rounded-lg", className)} />
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("w-6 h-6 border-2 border-divider border-t-primary rounded-full animate-spin", className)} />
  )
}
