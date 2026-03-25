import Link from 'next/link';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

export function LandingHero() {
  return (
    <section className="relative pt-32 sm:pt-40 pb-20 overflow-hidden min-h-screen flex items-center">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 -z-10" />

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* Left column */}
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="inline-flex items-center gap-2.5 bg-primary-light text-primary px-4 py-2 rounded-full font-bold text-xs sm:text-sm shadow-sm">
            <Sparkles size={16} />
            <span>Join 10,000+ professionals using Stickylynx</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black text-text-primary tracking-tight leading-[1.1]">
            Launch a powerful single page <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-accent">in minutes!</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-text-secondary max-w-xl leading-relaxed font-medium">
            Create shareable pages for menus, resumes, press kits, EPKs and client portals with one design-system-driven builder, no code, no clutter, just clear links and polished layouts.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register" className="btn-primary px-8 py-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold shadow-premium text-base">
              Get Started for Free <ArrowRight size={20} />
            </Link>
            <button className="bg-surface border border-divider hover:bg-divider px-8 py-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold transition-all text-sm sm:text-base cursor-pointer">
              <Play size={18} fill="currentColor" /> Watch Demo
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-6 pt-6">
            <div>
              <p className="text-3xl font-black text-text-primary mb-1">2s</p>
              <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Fast loading</p>
            </div>
            <div>
              <p className="text-3xl font-black text-text-primary mb-1">5+</p>
              <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Page Categories</p>
            </div>
          </div>
        </div>

        {/* Right column (Mockup image) */}
        <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-300">
           {/* Visual enhancement blobs */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 rounded-full blur-[80px] -z-10 group-hover:bg-primary/30 transition-colors" />
           <div className="bg-surface/60 backdrop-blur-xl border border-divider rounded-[40px] p-2.5 shadow-premium">
              <div className="relative">
                <img 
                  src="/landing/hero.png" 
                  alt="Stickylynx Visual Mockup" 
                  className="w-full h-auto rounded-[32px] shadow-sm transform hover:scale-[1.01] transition-transform duration-500"
                />
                {/* Official Logo Overlay */}
                <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur-md p-2 rounded-xl shadow-premium border border-divider animate-in fade-in zoom-in duration-700 delay-500">
                  <img src="/logo.png" alt="Stickylynx Official" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                </div>
              </div>
           </div>
           
           {/* Floating elements */}
           <div className="absolute -bottom-6 -left-6 bg-surface border border-divider p-4 rounded-2xl shadow-premium animate-bounce duration-[2s]">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-success/10 text-success rounded-xl flex items-center justify-center">
                    <Sparkles size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] uppercase font-black text-text-secondary tracking-widest leading-none mb-1">Live Update</p>
                    <p className="text-sm font-bold text-text-primary leading-none">Lynx Published!</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
