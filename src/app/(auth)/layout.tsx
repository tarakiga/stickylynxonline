import * as React from "react"
import Image from "next/image"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      <div className="flex items-center justify-center p-6 sm:p-12 z-10 relative bg-background h-screen overflow-y-auto">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500 py-12">
          {children}
        </div>
      </div>
      <div className="hidden lg:flex bg-surface border-l border-divider relative items-center justify-center overflow-hidden">
        {/* Decorative dynamic ambient background using design system tokens */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[120px] mix-blend-multiply"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-secondary/20 rounded-full blur-[120px] mix-blend-multiply"></div>
        
        <div className="relative z-10 p-16 max-w-2xl">
          <div className="w-16 h-16 rounded-2xl shadow-premium mb-8 overflow-hidden border border-divider bg-background">
            <Image src="/logo.png" alt="Stickylynx" width={64} height={64} className="w-full h-full object-contain" priority />
          </div>
          <h2 className="text-5xl font-bold text-text-primary tracking-tight leading-tight">
             The simplest way to build, monetize, and share your world.
          </h2>
          <p className="text-xl text-text-secondary mt-6 font-medium">
             Everything you need to launch your EPK, Menu, or Link in Bio—no code required.
          </p>
        </div>
      </div>
    </div>
  )
}
