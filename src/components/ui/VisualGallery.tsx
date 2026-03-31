import * as React from "react"

export function VisualGallery({ images }: { images: string[] }) {
  return (
    <div className="bg-surface border border-divider rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex justify-between items-center mb-1">
          <h4 className="font-bold text-sm text-text-primary">Press Photos</h4>
          <button className="text-xs text-primary font-bold hover:underline bg-transparent border-none cursor-pointer">Download All (.ZIP)</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {images.map((src, idx) => (
          <div key={idx} className="aspect-square bg-divider rounded-lg overflow-hidden group relative cursor-pointer">
              <img src={src} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
