import * as React from 'react';
import { ArrowRight, Star } from 'lucide-react';

export function LandingShowcase() {
  const templates = [
    { title: "Indie Musician", category: "EPK", color: "bg-primary" },
    { title: "Modern Cafe", category: "Digital Menu", color: "bg-success" },
    { title: "Senior Designer", category: "Portfolio", color: "bg-info" },
    { title: "Streetwear Brand", category: "Sales Portal", color: "bg-accent" }
  ];

  return (
    <section id="templates" className="py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
           <div className="max-w-2xl space-y-4">
              <h2 className="text-sm font-black text-secondary uppercase tracking-[0.2em] leading-none mb-1">Explore our Library</h2>
              <h3 className="text-3xl sm:text-5xl font-black text-text-primary tracking-tight">Premium Template Gallery.</h3>
              <p className="text-lg text-text-secondary leading-relaxed font-medium transition-colors">Pick a template and customize it to match your brand&apos;s unique identity. From high-end dark modes to minimalist light themes.</p>
           </div>
           <button className="hidden md:flex items-center gap-2.5 text-text-primary font-bold hover:text-primary transition-colors bg-transparent border-none cursor-pointer">
              View All Templates <ArrowRight size={20} />
           </button>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
           <div className="relative group animate-in slide-in-from-left-4 duration-700">
              <div className="absolute -inset-4 bg-secondary/10 rounded-[48px] -z-10 group-hover:bg-secondary/15 transition-colors" />
              <div className="relative overflow-hidden rounded-[32px] shadow-premium">
                <img 
                  src="/landing/templates.png" 
                  alt="Stickylynx Template Showcase" 
                  className="w-full h-auto transform hover:scale-[1.01] transition-transform duration-500" 
                />
                {/* Official Logo Badge */}
                <div className="absolute top-6 right-6 p-1.5 bg-background/80 backdrop-blur-md rounded-2xl border border-divider shadow-premium">
                  <img src="/logo.png" alt="Official" className="w-8 h-8 object-contain" />
                </div>
              </div>
           </div>
           
           <div className="space-y-6">
              {templates.map((tpl, i) => (
                <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-surface border border-divider shadow-sm hover:shadow-premium hover:border-primary/20 hover:-translate-x-2 transition-all duration-300">
                   <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${tpl.color}`} />
                      <div>
                         <h4 className="font-bold text-text-primary text-base">{tpl.title}</h4>
                         <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">{tpl.category}</p>
                      </div>
                   </div>
                   <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <Star size={20} fill="currentColor" />
                   </div>
                </div>
              ))}
              
              <div className="pt-6 sm:pt-4">
                 <button className="w-full btn-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-2.5 shadow-premium text-base cursor-pointer">
                    Browse Template Library <ArrowRight size={20} />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
