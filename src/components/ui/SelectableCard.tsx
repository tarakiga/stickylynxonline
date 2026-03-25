import * as React from "react"

export function SelectableCard({ title, desc, name, value, defaultChecked }: { title: string, desc: string, name: string, value: string, defaultChecked?: boolean }) {
  return (
    <label className="cursor-pointer block relative">
        <input type="radio" name={name} value={value} className="sr-only peer" defaultChecked={defaultChecked} />
        <div className="bg-surface border border-divider shadow-sm rounded-xl p-5 flex items-start gap-4 transition-colors peer-checked:border-primary peer-checked:bg-primary-light/10">
            <div className="w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center mt-0.5 border-divider peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white bg-background text-transparent transition-colors">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            </div>
            <div>
                <h4 className="font-bold text-text-primary">{title}</h4>
                <p className="text-sm text-text-secondary mt-1">{desc}</p>
            </div>
        </div>
    </label>
  )
}
