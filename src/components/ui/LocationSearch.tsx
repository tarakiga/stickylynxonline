"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { NOMINATIM_BASE } from "@/config/services"

export interface LocationSearchProps {
  onSelect?: (location: string) => void;
  label?: string;
}

export function LocationSearch({ onSelect, label }: LocationSearchProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<{ display_name: string }[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [error, setError] = React.useState(false);
  
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
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

  const fetchLocations = (q: string) => {
    if (q.length < 3) {
      setResults([]);
      setError(false);
      return;
    }
    
    setIsLoading(true);
    setError(false);
    
    if (!NOMINATIM_BASE) {
      setError(true);
      setIsLoading(false);
      return;
    }
    const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(q)}&limit=5`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setIsLoading(false);
      })
      .catch(() => {
        setError(true);
        setIsLoading(false);
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      fetchLocations(val);
    }, 600);
  };

  const handleSelect = (displayName: string) => {
    setQuery(displayName);
    setIsOpen(false);
    onSelect?.(displayName);
  };

  return (
    <div className="card p-5 space-y-2 relative" ref={containerRef}>
      {label && <span className="text-sm font-semibold text-text-secondary block">{label}</span>}
      <div className="relative">
        <input 
          type="text" 
          className="w-full input-base px-4 py-3 pl-11 focus:ring-primary-light" 
          placeholder="Search city or address..." 
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />
        <svg className="w-5 h-5 text-primary absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        
        {isLoading && (
          <svg className="w-5 h-5 text-text-secondary absolute right-4 top-1/2 -translate-y-1/2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        )}
      </div>
      
      {isOpen && query.length > 0 && (
        <div className="absolute left-0 top-[105%] w-full bg-surface border border-divider shadow-premium rounded-xl p-2 z-50 flex flex-col max-h-64 overflow-y-auto custom-scrollbar">
          <ul className="space-y-1 text-sm">
            {query.length < 3 ? (
              <li className="px-3 py-2 text-text-secondary text-xs text-center">Type at least 3 characters...</li>
            ) : error ? (
              <li className="px-3 py-2 text-error text-xs text-center">Error fetching results</li>
            ) : results.length === 0 && !isLoading ? (
              <li className="px-3 py-2 text-text-secondary text-xs text-center">No results found</li>
            ) : (
              results.map((item, i) => (
                <li 
                  key={i} 
                  className="px-3 py-2 hover:bg-primary/10 hover:text-primary rounded-md cursor-pointer transition-colors text-sm border-b border-divider last:border-0 truncate"
                  title={item.display_name}
                  onClick={() => handleSelect(item.display_name)}
                >
                  {item.display_name}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
