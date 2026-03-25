import * as React from "react"
import { Mail, MapPin } from "lucide-react"

export function UserCard({ name, handle, avatarUrl, isPro, email, location }: { name: string, handle?: string, avatarUrl?: string, isPro?: boolean, email?: string, location?: string }) {
  // If email/location provided, we render the detailed view
  if (email || location) {
    return (
      <div className="bg-surface border border-divider rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-12 h-12 rounded-xl object-cover shadow-lg" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {name.substring(0,2).toUpperCase()}
                </div>
              )}
              <div>
                  <h4 className="font-bold text-text-primary">{name}</h4>
                  {isPro && <p className="text-xs text-secondary font-semibold">Pro Member</p>}
              </div>
          </div>
          <div className="border-t border-divider pt-4 space-y-3">
              {email && (
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <Mail className="w-4 h-4" />
                    <span>{email}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <MapPin className="w-4 h-4" />
                    <span>{location}</span>
                </div>
              )}
          </div>
      </div>
    )
  }

  // Simple compact view
  return (
    <div className="bg-surface border border-divider rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
            {avatarUrl ? (
               <img src={avatarUrl} alt={name} className="w-12 h-12 rounded-full ring-2 ring-divider object-cover" />
            ) : (
               <div className="w-12 h-12 rounded-full bg-divider flex items-center justify-center font-bold text-text-primary">{name.charAt(0)}</div>
            )}
            <div>
                <h4 className="font-bold text-sm text-text-primary">{name}</h4>
                <p className="text-xs text-text-secondary">{handle}</p>
            </div>
        </div>
        <button className="bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold px-4 py-2 rounded-full transition-colors cursor-pointer border-none">Follow</button>
    </div>
  )
}
