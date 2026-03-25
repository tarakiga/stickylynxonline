"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, BarChart, Settings, LogOut, Palette } from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Lynx', href: '/dashboard', icon: FileText },
    { name: 'Branding', href: '/dashboard/branding', icon: Palette },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-divider hidden md:flex flex-col min-h-screen sticky top-0">
      <div className="p-6">
        <div className="w-12 h-12 bg-primary text-white flex items-center justify-center font-bold text-2xl rounded-xl shadow-premium mb-8 uppercase">
          SL
        </div>
        <nav className="space-y-2 flex-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link key={link.name} href={link.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-bold ${isActive ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'text-text-secondary hover:bg-background hover:text-text-primary'}`}>
                <Icon size={20} />
                {link.name}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="mt-auto p-6 space-y-2">
         <SignOutButton>
           <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:text-error hover:bg-error/10 transition-colors font-bold cursor-pointer text-left">
             <LogOut size={20} />
             Log out
           </button>
         </SignOutButton>
      </div>
    </aside>
  );
}
