import * as React from "react"

export function AssetCard({ title, imageUrl, currPrice, origPrice, saleBadge, newBadge }: { title: string, imageUrl: string, currPrice: string, origPrice?: string, saleBadge?: string, newBadge?: boolean }) {
  return (
     <div className="bg-surface border border-divider rounded-xl overflow-hidden shadow-sm hover:shadow-premium transition-shadow">
        <div className="h-32 bg-divider relative">
            <img src={imageUrl} className="w-full h-full object-cover" alt={title} />
            {saleBadge && <span className="absolute top-2 left-2 bg-error text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">{saleBadge}</span>}
            {newBadge && <span className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase">New</span>}
        </div>
        <div className="p-4">
            <h4 className="font-bold text-text-primary">{title}</h4>
            <p className="text-sm font-semibold text-text-secondary mt-1">
              {origPrice && <span className="line-through opacity-50 mr-1">{origPrice}</span>}
              <span className="text-primary text-lg">{currPrice}</span>
            </p>
        </div>
    </div>
  )
}
