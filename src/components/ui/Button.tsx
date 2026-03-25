import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary-light text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "btn-primary": variant === "primary",
            "bg-surface border border-divider hover:bg-divider text-text-primary shadow-sm": variant === "secondary",
            "border-2 border-primary text-primary hover:bg-primary/5": variant === "outline",
            "text-text-secondary hover:text-text-primary hover:bg-divider": variant === "ghost",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
