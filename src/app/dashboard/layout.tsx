import * as React from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { HeaderAvatar } from "@/components/dashboard/HeaderAvatar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-surface border-b border-divider flex items-center justify-between px-6 sm:px-10 sticky top-0 z-30">
           <h1 className="text-xl font-bold text-text-primary md:hidden">Stickylynx</h1>
           <div className="ml-auto flex items-center gap-4">
             <HeaderAvatar />
           </div>
        </header>
        <main className="flex-1 p-6 sm:p-10 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
