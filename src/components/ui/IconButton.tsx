import * as React from "react"
import { cn } from "@/lib/utils"

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "danger" | "success" | "primary";
  size?: "sm" | "md";
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "default", size = "sm", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full border-none bg-transparent transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-light disabled:opacity-50 disabled:cursor-not-allowed",
          {
            sm: "w-8 h-8",
            md: "w-10 h-10",
          }[size],
          {
            "text-text-secondary hover:text-text-primary hover:bg-divider":
              variant === "default",
            "text-text-secondary hover:text-error hover:bg-error/10":
              variant === "danger",
            "text-text-secondary hover:text-success hover:bg-success/10":
              variant === "success",
            "text-text-secondary hover:text-primary hover:bg-primary/10":
              variant === "primary",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
IconButton.displayName = "IconButton"
