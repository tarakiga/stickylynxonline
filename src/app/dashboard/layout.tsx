import * as React from "react";
import { auth } from "@clerk/nextjs/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { HeaderAvatar } from "@/components/dashboard/HeaderAvatar";
import { DarkModeToggle } from "@/components/dashboard/DarkModeToggle";
import prisma from "@/lib/prisma";
import { getBrandCssVariables, normalizeBrandProfile } from "@/lib/branding";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, brandProfile: true },
      })
    : null;
  const brandProfile = normalizeBrandProfile(user?.brandProfile, user?.name || user?.email || "")
  const brandStyle = getBrandCssVariables(brandProfile)

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row" style={brandStyle as React.CSSProperties}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-surface border-b border-divider flex items-center justify-between px-6 sm:px-10 sticky top-0 z-30">
           <h1 className="text-xl font-bold text-text-primary md:hidden">Stickylynx</h1>
           <div className="ml-auto flex items-center gap-4">
             <DarkModeToggle />
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
