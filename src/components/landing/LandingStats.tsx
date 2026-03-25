import * as React from 'react';
import { ChartBar, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

export function LandingStats() {
  return (
    <section id="at-a-glance" className="py-24 bg-surface border-y border-divider relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-20">
          <div className="max-w-xl space-y-6">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em] leading-none mb-2">At-a-Glance Information</h2>
            <h3 className="text-3xl sm:text-5xl font-black text-text-primary tracking-tight">Real-Time Data for a Real-Time World.</h3>
            <p className="text-lg text-text-secondary leading-relaxed font-medium">Get instant feedback on your digital presence. Stickylynx provides a unified dashboard to monitor your stats, feedback, and engagement, all at a single glance.</p>
            
            <div className="grid sm:grid-cols-2 gap-6 pt-4">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
                    <ChartBar size={24} />
                 </div>
                 <p className="font-bold text-text-primary text-sm">Unified Dashboard</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center shrink-0">
                    <TrendingUp size={24} />
                 </div>
                 <p className="font-bold text-text-primary text-sm">Growth Tracking</p>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:max-w-md grid grid-cols-2 gap-4 sm:gap-6">
             <div className="bg-background border border-divider rounded-[32px] p-8 text-center shadow-premium hover:border-primary/20 transition-all duration-300">
                <p className="text-4xl font-black text-primary mb-2">100%</p>
                <p className="text-[10px] uppercase font-black text-text-secondary tracking-widest leading-none">Security Score</p>
                <div className="mt-4 flex justify-center text-success"><ShieldCheck size={16} /></div>
             </div>
             <div className="bg-background border border-divider rounded-[32px] p-8 text-center shadow-premium hover:border-secondary/20 transition-all duration-300">
                <p className="text-4xl font-black text-secondary mb-2">5ms</p>
                <p className="text-[10px] uppercase font-black text-text-secondary tracking-widest leading-none">API Latency</p>
                <div className="mt-4 flex justify-center text-info"><Zap size={16} /></div>
             </div>
             <div className="bg-background border border-divider rounded-[32px] p-8 text-center shadow-premium hover:border-accent/20 transition-all duration-300">
                <p className="text-4xl font-black text-accent mb-2">24/7</p>
                <p className="text-[10px] uppercase font-black text-text-secondary tracking-widest leading-none">Global Uptime</p>
                <div className="mt-4 flex justify-center text-accent"><Globe size={16} className="w-4 h-4" /></div>
             </div>
             <div className="bg-background border border-divider rounded-[32px] p-8 text-center shadow-premium hover:border-info/20 transition-all duration-300 flex flex-col items-center justify-center">
                <p className="text-4xl font-black text-info mb-2 leading-none">LIVE</p>
                <div className="w-2 h-2 bg-info rounded-full animate-ping mt-1 mb-2" />
                <p className="text-[10px] uppercase font-black text-text-secondary tracking-widest leading-none">Real-time Feed</p>
             </div>
          </div>
        </div>
      </div>
      
      {/* Visual background circle */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2" />
    </section>
  );
}

function Globe({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
