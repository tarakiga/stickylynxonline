import * as React from "react"
import { Play } from "lucide-react"

export function MediaCard({ title, subtitle, imageUrl }: { title: string, subtitle: string, imageUrl: string }) {
  return (
    <div className="bg-surface border border-divider rounded-xl p-3 flex items-center gap-4 group hover:shadow-premium transition-shadow">
      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-divider">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
          <Play fill="currentColor" size={24} />
        </div>
      </div>
      <div className="flex-1 min-w-0 pointer-events-none">
        <h4 className="font-bold text-sm text-text-primary truncate">{title}</h4>
        <p className="text-xs text-text-secondary truncate">{subtitle}</p>
      </div>
      <button className="w-8 h-8 rounded-full border border-divider flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary transition-colors shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
      </button>
    </div>
  )
}
