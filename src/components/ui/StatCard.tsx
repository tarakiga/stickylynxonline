import * as React from "react"

export function StatCard({ title, mainValue, subValue, progress, trend, maxProgress }: { title: string, mainValue: React.ReactNode, subValue?: React.ReactNode, progress?: number, maxProgress?: number, trend?: string }) {
  return (
    <div className="bg-surface border border-divider rounded-xl p-4 flex flex-col justify-between shadow-sm">
      <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">{title}</h4>
      {trend ? (
        <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-text-primary">{mainValue}</span>
            <span className="text-success text-xs font-bold bg-success/10 px-1 py-0.5 rounded">{trend}</span>
        </div>
      ) : (
        <span className="text-xl font-bold text-text-primary">
          {mainValue} {subValue && <span className="text-xs text-text-secondary">{subValue}</span>}
        </span>
      )}
      
      {typeof progress === 'number' && typeof maxProgress === 'number' && (
        <div className="w-full h-1.5 bg-divider rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(progress / maxProgress) * 100}%` }}></div>
        </div>
      )}
    </div>
  )
}
