import * as React from "react"

export function PullQuote({ quote, source }: { quote: string, source: string }) {
  return (
    <div className="bg-primary/5 rounded-xl p-6 relative text-center">
      <svg className="w-8 h-8 text-primary/20 absolute top-4 left-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"></path></svg>
      <p className="text-sm font-semibold italic mt-4 mb-3 text-text-primary">&quot;{quote}&quot;</p>
      <span className="text-xs font-bold text-primary">— {source}</span>
      <div className="flex justify-center gap-2 mt-4">
          <div className="w-2 h-2 rounded-full bg-primary cursor-pointer hover:bg-primary-hover"></div>
          <div className="w-2 h-2 rounded-full bg-divider cursor-pointer hover:bg-text-secondary"></div>
          <div className="w-2 h-2 rounded-full bg-divider cursor-pointer hover:bg-text-secondary"></div>
      </div>
    </div>
  )
}
