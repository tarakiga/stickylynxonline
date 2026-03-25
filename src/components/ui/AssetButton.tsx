import * as React from "react"
import { Lock } from "lucide-react"

export function AssetButton({ label }: { label: string }) {
  return (
    <div className="relative flex">
      <input 
        type="password" 
        className="w-full bg-surface border border-divider text-text-primary px-4 py-3 rounded-l-xl rounded-r-none border-r-0 placeholder-text-secondary focus:outline-none focus:ring-0 focus:border-divider" 
        placeholder="Passcode" 
      />
      <button className="bg-surface text-text-primary border border-divider border-l-0 px-4 rounded-r-xl text-sm font-bold hover:bg-divider transition-colors flex items-center gap-2 shrink-0">
        <Lock size={16} />
        {label}
      </button>
    </div>
  )
}
