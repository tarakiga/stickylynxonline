"use client"
import * as React from "react"
import { X } from "lucide-react"

export function MultiContactInput({ label, error }: { label: string, error?: string }) {
  const [contacts, setContacts] = React.useState<string[]>(["alex@example.com"])
  const [inputVal, setInputVal] = React.useState("")
  const [localError, setLocalError] = React.useState(false)

  const validate = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || /^\+?[\d\s-]{7,15}$/.test(val)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addContact()
    }
  }

  const addContact = () => {
    const val = inputVal.trim().replace(/,$/, '')
    if (!val) return
    if (validate(val) && !contacts.includes(val)) {
      setContacts([...contacts, val])
      setInputVal("")
      setLocalError(false)
    } else {
      setLocalError(true)
    }
  }

  const removeContact = (c: string) => setContacts(contacts.filter(x => x !== c))

  return (
    <div className="space-y-2 w-full">
      <span className="text-sm font-semibold text-text-secondary">{label}</span>
      <p className="text-xs text-text-secondary mb-2">Type email/phone and press Enter or comma.</p>
      <div 
        className="min-h-[3rem] w-full input-base p-1.5 flex flex-wrap gap-2 items-center cursor-text" 
        onClick={() => document.getElementById('mc-input')?.focus()}
      >
        {contacts.map((c) => (
          <span key={c} className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold px-2 py-1.5 rounded-lg flex items-center gap-1">
            {c}
            <button className="text-primary hover:text-error ml-1 focus:outline-none" onClick={() => removeContact(c)}>
              <X size={14} />
            </button>
          </span>
        ))}
        <input 
          id="mc-input"
          type="text" 
          className="flex-1 bg-transparent border-none min-w-[120px] outline-none text-sm p-1 text-text-primary placeholder:text-text-secondary/50 focus:ring-0" 
          placeholder="Add contact..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addContact}
        />
      </div>
      {(error || localError) && <p className="text-xs text-error mt-1">{error || "Invalid email or phone number"}</p>}
    </div>
  )
}
