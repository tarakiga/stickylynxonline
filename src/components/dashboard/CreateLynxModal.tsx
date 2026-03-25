"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { CategoryCard } from "@/components/ui/CategoryCard";

export function CreateLynxModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOpen = searchParams.get("create") === "true";

  if (!isOpen) return null;

  const close = () => router.push("/dashboard");

  const categories = [
    { title: "Project Portal", description: "Progress and feedback hub for your clients.", type: "PROJECT_PORTAL", enabled: true },
    { title: "EPK", description: "Electronic Press Kit for artists and musicians.", type: "EPK", enabled: true },
    { title: "Food Menu", description: "Mobile-friendly menu for restaurants and cafes.", type: "FOOD_MENU", enabled: false },
    { title: "Resume", description: "Professional profile with experience and skills.", type: "RESUME", enabled: false },
    { title: "Generic", description: "A simple link-in-bio page for creators.", type: "GENERIC", enabled: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={close} />
      <div className="relative bg-surface border border-divider rounded-3xl p-6 md:p-10 shadow-premium w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <button className="absolute right-4 top-4 md:right-8 md:top-8 text-text-secondary hover:text-text-primary transition-colors focus:outline-none bg-background rounded-full p-2 border-none cursor-pointer z-10 shadow-sm" onClick={close}>
          <X size={24} />
        </button>
        <div className="text-center mb-8 md:mb-12">
           <h2 className="text-3xl md:text-4xl font-bold text-text-primary">Choose a Template</h2>
           <p className="text-text-secondary mt-2 text-lg">Select a category to jumpstart your Lynx page.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
           {categories.map(cat => (
             <div key={cat.type} className="relative">
               <CategoryCard 
                  title={cat.title} 
                  description={cat.enabled ? cat.description : "Coming Soon"} 
                  layout="grid"
                  onClick={cat.enabled ? () => router.push(`/dashboard?drawer=${cat.type}`) : undefined}
               />
               {!cat.enabled && (
                 <div className="absolute inset-0 bg-surface/70 backdrop-blur-[1px] rounded-2xl flex items-center justify-center cursor-not-allowed">
                   <span className="bg-divider text-text-secondary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Coming Soon</span>
                 </div>
               )}
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}
