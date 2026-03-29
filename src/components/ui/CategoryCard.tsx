import * as React from "react"
import { cn } from "@/lib/utils"

export interface CategoryCardProps {
  title: string;
  description: string;
  imageUrl?: string;
  layout?: "grid" | "list";
  onClick?: () => void;
  preview?: React.ReactNode;
  footer?: React.ReactNode;
}

export function CategoryCard({ title, description, imageUrl, layout = "grid", onClick, preview, footer }: CategoryCardProps) {
  if (layout === "list") {
    return (
      <div 
        onClick={onClick}
        className={cn(
          "group bg-surface border border-divider rounded-2xl p-4 flex items-center sm:items-start gap-4 shadow-sm hover:shadow-premium transition-all duration-300",
          onClick && "cursor-pointer hover:border-primary/30"
        )}
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-divider bg-background overflow-hidden flex-shrink-0 group-hover:border-primary/30 transition-colors">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full bg-primary/5 flex items-center justify-center font-bold text-primary text-xl">
               {title.substring(0, 2).toUpperCase()}
             </div>
          )}
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="font-bold text-text-primary text-base sm:text-lg truncate group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 line-clamp-2">{description}</p>
        </div>
      </div>
    )
  }

  // Grid layout (vertical showcase)
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group bg-surface border border-divider rounded-2xl overflow-hidden shadow-sm hover:shadow-premium transition-all duration-300 flex flex-col",
        onClick && "cursor-pointer hover:border-primary/30"
      )}
    >
      <div className="aspect-[4/3] sm:aspect-video w-full bg-divider relative overflow-hidden">
        {preview ? (
          <div className="h-full w-full bg-[radial-gradient(circle_at_top_right,rgba(109,40,217,0.08),transparent_35%),linear-gradient(180deg,rgba(249,250,251,0.98),rgba(243,244,246,0.96))] p-3 sm:p-4">
            <div className="pointer-events-none h-full w-full">{preview}</div>
          </div>
        ) : (
          <div className="h-full w-full bg-divider relative overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="w-full h-full object-cover filter group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full bg-primary/5 flex items-center justify-center font-bold text-primary text-3xl">
                 {title.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col bg-surface z-10 relative">
        <h3 className="font-bold text-text-primary text-lg truncate group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-text-secondary mt-2 line-clamp-2 flex-1">{description}</p>
        {footer ? <div className="mt-4">{footer}</div> : null}
      </div>
    </div>
  )
}
