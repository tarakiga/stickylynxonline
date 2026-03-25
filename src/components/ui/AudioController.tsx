import * as React from "react"
import { Play } from "lucide-react"

export function AudioController() {
  return (
    <div className="bg-surface border border-divider rounded-xl p-4">
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-md transform hover:scale-105 transition-transform shrink-0">
          <Play fill="currentColor" size={20} className="ml-0.5" />
        </button>
        <div className="flex-1">
          <div className="flex justify-between text-[10px] font-bold text-text-secondary mb-1">
            <span>1:04</span>
            <span>3:42</span>
          </div>
          <div className="w-full h-1.5 bg-divider rounded-full overflow-hidden cursor-pointer relative group">
            <div className="h-full bg-primary w-1/3"></div>
            <div className="absolute top-1/2 left-1/3 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow border border-divider opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
