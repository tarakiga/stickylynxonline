import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export function Select({ label, options, className, ...props }: { label?: string, options: {label: string, value: string}[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="space-y-2 w-full">
      {label && <span className="text-sm font-semibold text-text-secondary">{label}</span>}
      <div className="relative">
          <select className={cn("w-full input-base px-4 py-3 appearance-none cursor-pointer text-text-primary bg-background focus:ring-primary-light", className)} {...props}>
            {options.map((opt, i) => <option key={i} value={opt.value}>{opt.label}</option>)}
          </select>
          <ChevronDown className="w-4 h-4 text-text-secondary absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  )
}
