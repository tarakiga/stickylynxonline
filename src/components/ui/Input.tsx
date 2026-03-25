"use client"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  prefix?: string;
  suffix?: string;
  error?: string;
  success?: boolean;
  labelInside?: string;
  floatingLabel?: string;
  actionButton?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, endIcon, prefix, suffix, error, success, labelInside, floatingLabel, actionButton, type, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === "password"
    const inputType = isPassword ? (showPassword ? "text" : "password") : type
    const inputId = id || React.useId()

    return (
      <div className="w-full">
        {labelInside && <span className="text-sm font-semibold text-text-secondary mb-1 block">{labelInside}</span>}
        <div className="relative w-full group">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none z-10">
              {icon}
            </div>
          )}
          {prefix && (
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold z-10">{prefix}</span>
          )}
          
          <input
            id={inputId}
            ref={ref}
            type={inputType}
            className={cn(
              "w-full input-base px-4 py-3 placeholder:text-text-secondary/50 transition-all",
              icon || prefix ? "pl-11" : "",
              suffix || endIcon || isPassword ? "pr-12" : "",
              actionButton ? "pr-24" : "",
              error ? "border-error focus:ring-error/20 focus:border-error bg-error/5" : "",
              success ? "border-success focus:ring-success/20 focus:border-success bg-success/5" : "",
              floatingLabel ? "peer placeholder-transparent pt-6 pb-2" : "",
              labelInside ? "bg-background focus:border-primary focus:ring-2 focus:ring-primary-light" : "",
              className
            )}
            placeholder={floatingLabel || props.placeholder}
            {...props}
          />
          
          {floatingLabel && (
            <label htmlFor={inputId} className="absolute left-4 top-4 -translate-y-2 text-text-secondary text-xs transition-all pointer-events-none peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-4 peer-focus:-translate-y-2 peer-focus:text-xs">
              {floatingLabel}
            </label>
          )}

          {isPassword && (
             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors focus:outline-none">
               {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
             </button>
          )}
          
          {!isPassword && endIcon && (
             <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
               {endIcon}
             </div>
          )}

          {suffix && (
             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm pointer-events-none">{suffix}</span>
          )}

          {success && !isPassword && !endIcon && (
            <CheckCircle2 className="w-5 h-5 text-success absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}

          {error && !isPassword && !endIcon && (
            <AlertCircle className="w-5 h-5 text-error absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}

          {actionButton && (
            <div className="absolute right-1 top-1 bottom-1">
              {actionButton}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-error mt-1">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"
