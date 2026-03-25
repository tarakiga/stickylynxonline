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
       title: "Digital Resumes",
       icon: FileText,
       iconBg: "bg-info/10 text-info",
       description: "Standard PDFs are dead. Impress recruiters with a live, multimedia professional profile."
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
        
        {/* Why Stickylynx */}
        <div className="mt-24 bg-background border border-divider rounded-[40px] p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12 overflow-hidden relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2 -z-10" />
           
           <div className="lg:flex-1 space-y-8">
              <h3 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">Designed for Fortune 500 Aesthetics, built for you.</h3>
              <div className="space-y-6">
                 <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm"><Layout size={20} /></div>
                    <div>
                       <p className="font-bold text-text-primary">Atomic Design Components</p>
                       <p className="text-sm text-text-secondary leading-normal">Every block is a meticulously crafted UI component that looks premium on any device.</p>
                    </div>
                 </div>
                 <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center shrink-0 shadow-sm"><Monitor size={20} /></div>
                    <div>
                       <p className="font-bold text-text-primary">Device Agnostic Rendering</p>
                       <p className="text-sm text-text-secondary leading-normal">Your Lynx pages adapt perfectly to smartphones, tablets, and massive desktops.</p>
                    </div>
                 </div>
                 <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm"><Globe size={20} /></div>
                    <div>
                       <p className="font-bold text-text-primary">SEO Optimized by Default</p>
                       <p className="text-sm text-text-secondary leading-normal">Ranking matters. High Lighthouse scores and perfect meta-tags are baked in.</p>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="lg:flex-1 flex justify-center lg:justify-end">
              <div className="relative group">
                 <div className="w-64 h-[450px] sm:w-72 sm:h-[500px] bg-surface border-[8px] border-text-primary rounded-[48px] shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 inset-x-0 h-6 bg-text-primary rounded-b-2xl flex justify-center">
                       <div className="w-20 h-4 bg-text-primary rounded-b-xl" />
                    </div>
                    <div className="w-full h-full p-6 flex flex-col items-center justify-center gap-4 text-center">
                       <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2 animate-pulse"><Smartphone size={40} /></div>
                       <p className="text-lg font-black text-text-primary leading-tight">Your Digital Page</p>
                       <div className="w-full space-y-2">
                          <div className="h-2 w-3/4 bg-divider rounded mx-auto" />
                          <div className="h-2 w-1/2 bg-divider rounded mx-auto" />
                       </div>
                       <div className="w-3/4 h-10 bg-primary rounded-xl" />
                    </div>
                 </div>
                 {/* Decorative background element */}
                 <div className="absolute -inset-4 border-2 border-primary/20 rounded-[56px] -z-10 animate-pulse" />
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
