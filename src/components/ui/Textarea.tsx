"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <span className="text-sm font-semibold text-text-secondary mb-1 block">
            {label}
          </span>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full input-base px-4 py-3 resize-none placeholder:text-text-secondary/50 transition-all focus:ring-2 focus:ring-primary-light focus:border-primary",
            error
              ? "border-error focus:ring-error/20 focus:border-error bg-error/5"
              : "",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-error mt-1">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"
