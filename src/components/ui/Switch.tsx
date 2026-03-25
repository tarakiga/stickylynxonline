import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Switch({ label, className, ...props }: SwitchProps) {
  return (
    <label className={cn("flex items-center justify-between cursor-pointer", className)}>
      <span className="text-sm font-semibold text-text-primary">{label}</span>
      <div className="relative inline-flex items-center">
        <input type="checkbox" className="sr-only switch-peer peer" {...props} />
        <div className="w-11 h-6 bg-divider rounded-full peer-checked:bg-primary transition-colors duration-300 relative">
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 peer-checked:translate-x-full shadow-sm"></div>
        </div>
      </div>
    </label>
  )
}

export function SegmentedControl({ options, name }: { options: { label: string, value: string, badge?: string }[], name: string }) {
  return (
    <div className="p-1 flex text-sm font-semibold bg-background rounded-xl border border-divider shadow-sm">
      {options.map((opt, i) => (
        <label key={i} className="flex-1 text-center cursor-pointer relative">
          <input type="radio" name={name} value={opt.value} className="sr-only peer" defaultChecked={i === 0} />
          <div className="py-2 rounded-lg peer-checked:bg-surface peer-checked:text-primary peer-checked:shadow-sm transition-all flex items-center justify-center gap-1 text-text-secondary hover:text-text-primary">
            {opt.label}
            {opt.badge && <span className="text-[10px] text-white bg-error px-1.5 py-0.5 rounded-full">{opt.badge}</span>}
          </div>
        </label>
      ))}
    </div>
  )
}
