"use client"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"

export interface TableColumn {
  key: string
  header: string
  width?: string
}

export function Table({ columns, rows, pageSize = 5, className }: { columns: TableColumn[]; rows: Record<string, unknown>[]; pageSize?: number; className?: string }) {
  const [page, setPage] = React.useState(1)
  const total = rows.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize
  const slice = rows.slice(start, start + pageSize)
  const prev = () => setPage(p => Math.max(1, p - 1))
  const next = () => setPage(p => Math.min(pages, p + 1))
  return (
    <div className={cn("border border-divider rounded-2xl bg-surface overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-background border-b border-divider">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="text-left font-bold text-text-secondary uppercase tracking-widest text-[11px] px-4 py-3" style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((row, i) => (
              <tr key={i} className="border-b border-divider last:border-b-0">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-text-primary">{String(row[col.key] ?? "")}</td>
                ))}
              </tr>
            ))}
            {slice.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-text-secondary">No data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3 bg-background border-t border-divider">
        <span className="text-xs text-text-secondary">Page {page} of {pages}</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={prev} disabled={page <= 1} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer">Prev</Button>
          <Button variant="ghost" onClick={next} disabled={page >= pages} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer">Next</Button>
        </div>
      </div>
    </div>
  )
}
