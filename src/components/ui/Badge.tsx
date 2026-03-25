import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "error" | "info" | "primary" | "neutral";
  pulse?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "neutral", pulse, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border transition-colors",
          {
            "bg-success/10 text-success border-success/20":
              variant === "success",
            "bg-warning/10 text-warning border-warning/20":
              variant === "warning",
            "bg-error/10 text-error border-error/20": variant === "error",
            "bg-info/10 text-info border-info/20": variant === "info",
            "bg-primary/10 text-primary border-primary/20":
              variant === "primary",
            "bg-divider text-text-secondary border-divider":
              variant === "neutral",
          },
          className
        )}
        {...props}
      >
        {pulse && (
          <span className="relative flex h-2 w-2">
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                {
                  "bg-success": variant === "success",
                  "bg-warning": variant === "warning",
                  "bg-error": variant === "error",
                  "bg-info": variant === "info",
                  "bg-primary": variant === "primary",
                  "bg-text-secondary": variant === "neutral",
                }
              )}
            />
            <span
              className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                {
                  "bg-success": variant === "success",
                  "bg-warning": variant === "warning",
                  "bg-error": variant === "error",
                  "bg-info": variant === "info",
                  "bg-primary": variant === "primary",
                  "bg-text-secondary": variant === "neutral",
                }
              )}
            />
          </span>
        )}
        {children}
      </span>
    )
  }
)
Badge.displayName = "Badge"
