import * as React from "react"

export function TechGrid({ items }: { items: { channel: string, desc: string, needs: string, req: string }[] }) {
  return (
    <div className="bg-background border border-divider rounded-xl overflow-hidden text-left">
      <div className="px-5 py-3 border-b border-divider bg-surface/50">
          <h4 className="font-bold text-sm text-text-primary">Tech Rider Inputs</h4>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="grid grid-cols-2 divide-x divide-divider border-b border-divider last:border-0 text-sm">
            <div className="p-3 bg-surface hover:bg-primary/5 transition-colors">
                <span className="text-[10px] font-bold text-text-secondary uppercase">{item.channel}</span>
                <p className="font-semibold text-text-primary mt-1">{item.desc}</p>
            </div>
            <div className="p-3 bg-surface hover:bg-primary/5 transition-colors">
                <span className="text-[10px] font-bold text-text-secondary uppercase">{item.needs}</span>
                <p className="font-medium text-text-secondary mt-1">{item.req}</p>
            </div>
        </div>
      ))}
    </div>
  )
}
