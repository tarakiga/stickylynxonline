"use client"
import * as React from "react"
import { Calendar } from "lucide-react"

export function DatePicker({ label, value }: { label: string, value: string }) {
  const [isOpen, setIsOpen] = React.useState(false)

  // This is a mockup to render the HTML structure seen in preview
  return (
    <div className="relative group cursor-pointer w-full" tabIndex={0} onBlur={() => setTimeout(() => setIsOpen(false), 200)}>
      <span className="text-sm font-semibold text-text-secondary block mb-2">{label}</span>
      <div className="relative" onClick={() => setIsOpen(!isOpen)}>
          <input type="text" className="w-full input-base px-4 py-3 pl-11 pointer-events-none cursor-pointer placeholder:text-text-secondary/50 text-text-primary" value={value} readOnly />
          <Calendar className="w-5 h-5 text-primary absolute left-4 top-1/2 -translate-y-1/2" />
      </div>
      
      {isOpen && (
        <div className="absolute left-0 top-[105%] w-[320px] bg-surface border border-divider shadow-premium rounded-xl p-4 transition-all duration-200 z-50">
            <div className="flex justify-between items-center mb-4 text-text-primary">
                <button className="w-8 h-8 rounded-lg hover:bg-divider flex items-center justify-center transition-colors">&lt;</button>
                <span className="font-bold text-sm">March 2026</span>
                <button className="w-8 h-8 rounded-lg hover:bg-divider flex items-center justify-center transition-colors">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-[10px] font-bold text-text-secondary uppercase">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium">
                {Array.from({length: 6}).map((_, i) => <div key={`prev-${i}`} className="py-2 text-text-secondary opacity-40">{23 + i}</div>)}
                {Array.from({length: 31}).map((_, i) => (
                  <div key={i} className={`py-2 rounded-lg cursor-pointer transition-colors ${i+1===24 ? 'bg-primary text-white shadow-sm font-bold' : 'hover:bg-primary/10 hover:text-primary text-text-primary'}`}>
                    {i+1}
                  </div>
                ))}
                {Array.from({length: 5}).map((_, i) => <div key={`next-${i}`} className="py-2 text-text-secondary opacity-40">{i + 1}</div>)}
            </div>
        </div>
      )}
    </div>
  )
}
