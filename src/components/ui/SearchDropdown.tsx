"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SearchDropdownProps {
  options: string[];
  placeholder?: string;
  value?: string;
  onChange?: (val: string) => void;
  label?: string;
}

export function SearchDropdown({ options, placeholder = "Select...", value, onChange, label }: SearchDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="card p-5 space-y-2 relative group" ref={containerRef}>
      {label && <span className="text-sm font-semibold text-text-secondary">{label}</span>}
      <div 
        className="relative cursor-pointer" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <input 
          type="text" 
          className="w-full input-base px-4 py-3 pl-10 cursor-pointer pointer-events-none" 
          value={value || ""} 
          placeholder={placeholder}
          readOnly 
        />
        <svg className="w-5 h-5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
        <svg className={cn("w-4 h-4 text-text-secondary absolute right-4 top-1/2 -translate-y-1/2 transition-transform duration-200", isOpen && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
      
      {isOpen && (
        <div className="absolute left-0 top-[105%] w-full bg-surface border border-divider shadow-premium rounded-xl p-2 z-50 flex flex-col max-h-64">
          <div className="relative mb-2 shrink-0">
            <input 
              type="text" 
              className="w-full bg-background border border-divider text-text-primary text-sm rounded-lg px-3 py-2 pl-8 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            <svg className="w-4 h-4 text-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <ul className="overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredOptions.length > 0 ? filteredOptions.map(opt => (
              <li 
                key={opt}
                className={cn(
                  "px-3 py-2 text-sm rounded-md cursor-pointer transition-colors",
                  opt === value ? "bg-primary/10 text-primary font-semibold" : "hover:bg-primary/10 hover:text-primary"
                )}
                onClick={() => {
                  onChange?.(opt);
                  setIsOpen(false);
                  setSearch("");
                }}
              >
                {opt}
              </li>
            )) : (
              <li className="px-3 py-2 text-sm text-text-secondary text-center">No results found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
