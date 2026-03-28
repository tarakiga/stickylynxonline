"use client"
import * as React from "react"
import { Plus, Trash2 } from "lucide-react"

export interface PriceOption {
  id: string;
  name: string;
  price: string;
}

export interface PriceRepeaterProps {
  label?: string;
  value?: PriceOption[];
  onChange?: (options: PriceOption[]) => void;
  error?: string;
  currencySymbol?: string;
  disableMultiple?: boolean;
  lockedMessage?: string;
}

export function PriceRepeater({ label, value, onChange, error, currencySymbol = "$", disableMultiple = false, lockedMessage }: PriceRepeaterProps) {
  const [internalOptions, setInternalOptions] = React.useState<PriceOption[]>([
    { id: "1", name: "", price: "" }
  ])

  const options = value !== undefined ? value : internalOptions
  const setOptions = onChange ? onChange : setInternalOptions

  const addOption = () => {
    if (disableMultiple) return
    setOptions([...options, { id: Math.random().toString(36).substring(7), name: "", price: "" }])
  }

  const removeOption = (id: string) => {
    if (options.length <= 1) return
    setOptions(options.filter(opt => opt.id !== id))
  }

  const updateOption = (id: string, field: keyof PriceOption, val: string) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, [field]: val } : opt))
  }

  return (
    <div className="w-full space-y-3">
      {label && <span className="text-sm font-semibold text-text-secondary block">{label}</span>}
      <div className="space-y-3">
        {options.map((opt) => (
          <div key={opt.id} className="flex gap-2 items-center group">
            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center bg-surface border border-divider rounded-xl focus-within:ring-2 focus-within:ring-primary-light focus-within:border-primary transition-all shadow-sm">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  className="w-full h-11 bg-transparent px-4 py-2 outline-none text-sm text-text-primary placeholder:text-text-secondary/50 rounded-xl rounded-b-none sm:rounded-b-xl sm:rounded-r-none"
                  placeholder="Option name (e.g. Premium, Large)"
                  value={opt.name}
                  onChange={(e) => updateOption(opt.id, "name", e.target.value)}
                />
              </div>
              <div className="w-px bg-divider hidden sm:block self-stretch"></div>
              <div className="h-px bg-divider sm:hidden w-full"></div>
              <div className="w-full sm:w-32 relative flex items-center">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-sm">{currencySymbol}</span>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full h-11 bg-transparent pl-8 pr-4 py-2 outline-none text-sm text-text-primary placeholder:text-text-secondary/50 rounded-xl rounded-t-none sm:rounded-t-xl sm:rounded-l-none"
                  placeholder="0.00"
                  value={opt.price}
                  onChange={(e) => updateOption(opt.id, "price", e.target.value)}
                />
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => removeOption(opt.id)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:text-error hover:bg-error/10 transition-colors shrink-0 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-secondary disabled:cursor-not-allowed border-none bg-transparent cursor-pointer"
              disabled={options.length <= 1}
              aria-label="Remove price option"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
      <div>
        <button 
          type="button" 
          onClick={addOption}
          className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/10 hover:bg-primary/20 px-4 py-2.5 rounded-xl transition-colors border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disableMultiple}
        >
          <Plus size={16} />
          Add price option
        </button>
        {disableMultiple && <p className="text-[11px] text-text-secondary mt-2">{lockedMessage || "Higher plan required for multiple price options."}</p>}
      </div>
      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  )
}
