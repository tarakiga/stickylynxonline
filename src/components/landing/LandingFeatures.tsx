import * as React from 'react';
import { Music, Utensils, FileText, Layout, Clock, Monitor, Smartphone, Globe } from 'lucide-react';

export function LandingFeatures() {
  const categories = [
    {
       title: "Musicians (EPK)",
       icon: Music,
       iconBg: "bg-primary/10 text-primary",
       description: "Launch your career with a high-end Digital Press Kit. Audio, Video, and Press info in one sleek Lynx."
    },
    {
       title: "Restaurants (Menus)",
       icon: Utensils,
       iconBg: "bg-success/10 text-success",
       description: "Digitize your menu with beautiful imagery, dynamic categories, and instant updates for your diners."
    },
    {
       title: "Freelancers (Portals)",
       icon: Clock,
       iconBg: "bg-warning/10 text-warning",
       description: "Give your clients a premium project dashboard. Track milestones, approvals, and feedback in real-time."
    },
    {
       title: "Influencers (Media Kit)",
       icon: FileText,
       iconBg: "bg-info/10 text-info",
       description: "Pitch brands with audience metrics, rate cards, and campaign services in a polished media kit."
    }
  ];

  return (
    <section id="features" className="py-24 bg-surface relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
           <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-2 leading-none">The At-a-Glance Platform</h2>
           <h3 className="text-3xl sm:text-5xl font-black text-text-primary tracking-tight">One Platform, Endless Possibilities.</h3>
           <p className="text-lg text-text-secondary font-medium">Whether you're an artist, entrepreneur, or creative, Stickylynx provides the power to build your digital universe exactly how you want it.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
           {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="group p-8 rounded-[32px] border border-divider bg-background hover:bg-surface hover:shadow-premium hover:-translate-y-2 transition-all duration-300">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform ${cat.iconBg}`}>
                      <Icon size={28} />
                   </div>
                   <h4 className="text-xl font-bold text-text-primary mb-3">{cat.title}</h4>
                   <p className="text-text-secondary text-sm leading-relaxed font-medium">{cat.description}</p>
                   
                   <div className="mt-8 flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                      <span>Learn More</span>
                      <div className="w-4 h-0.5 bg-primary" />
                   </div>
                </div>
              )
           })}
        </div>
        
        
      </div>
    </section>
  );
}
