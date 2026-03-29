"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { PROPERTY_LISTING_CATEGORY } from "@/lib/property-listing";

type CreateLynxModalProps = {
  planLabel: string
  totalPages: number
  maxPages: number
  foodMenus: number
  maxFoodMenus: number | null
}

export function CreateLynxModal({
  planLabel,
  totalPages,
  maxPages,
  foodMenus,
  maxFoodMenus,
}: CreateLynxModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOpen = searchParams.get("create") === "true";
  const totalLimitReached = totalPages >= maxPages;
  const foodMenuLimitReached = maxFoodMenus !== null && foodMenus >= maxFoodMenus;

  if (!isOpen) return null;

  const close = () => router.push("/dashboard");

  const categories = [
    { title: "Project Portal", description: totalLimitReached ? `${planLabel} includes up to ${maxPages} Lynx.` : "Clear project status, tasks, updates, and feedback.", imageUrl: "/categories/project-portal.jpg", type: "PROJECT_PORTAL", enabled: !totalLimitReached },
    { title: "EPK", description: totalLimitReached ? `${planLabel} includes up to ${maxPages} Lynx.` : "Electronic Press Kit for artists and musicians.", imageUrl: "/categories/epk.jpg", type: "EPK", enabled: !totalLimitReached },
    { title: "Food Menu", description: totalLimitReached ? `${planLabel} includes up to ${maxPages} Lynx.` : foodMenuLimitReached ? `${planLabel} includes ${maxFoodMenus} Food Menu${maxFoodMenus === 1 ? "" : "s"}.` : "Mobile-first digital menu with sections, variations, and multi-location support.", imageUrl: "/categories/food-menu.jpg", type: "FOOD_MENU", enabled: !totalLimitReached && !foodMenuLimitReached },
    { title: "Influencer Media Kit", description: totalLimitReached ? `${planLabel} includes up to ${maxPages} Lynx.` : "Live media kit for creators to pitch brands and agencies.", imageUrl: "/categories/influencer.jpg", type: "INFLUENCER_MEDIA_KIT", enabled: !totalLimitReached },
    { title: "Property Listing", description: totalLimitReached ? `${planLabel} includes up to ${maxPages} Lynx.` : "Premium real estate pages with gallery, specs, pricing, and agent contact built in.", imageUrl: "/categories/property-listing.jpg", type: PROPERTY_LISTING_CATEGORY, enabled: !totalLimitReached },
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
        <div className="mb-8 rounded-2xl border border-divider bg-background px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-secondary mb-1">{planLabel} Plan</p>
          <p className="text-sm font-semibold text-text-primary">
            {totalPages}/{maxPages} Lynx used • {maxFoodMenus === null ? `${foodMenus} Food Menus used` : `${foodMenus}/${maxFoodMenus} Food Menus used`}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
           {categories.map(cat => (
             <div key={cat.type} className="relative">
               <CategoryCard 
                  title={cat.title} 
                  description={cat.enabled ? cat.description : "Coming Soon"} 
                  imageUrl={cat.imageUrl}
                  layout="grid"
                  onClick={cat.enabled ? () => router.push(`/dashboard?drawer=${cat.type}`) : undefined}
               />
               {!cat.enabled && (
                 <div className="absolute inset-0 bg-surface/70 backdrop-blur-[1px] rounded-2xl flex items-center justify-center cursor-not-allowed">
                   <span className="bg-divider text-text-secondary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                     {totalLimitReached
                       ? `${maxPages}/${maxPages} Lynx Used`
                       : cat.type === "FOOD_MENU" && maxFoodMenus !== null
                       ? `${foodMenus}/${maxFoodMenus} Menus Used`
                       : "Unavailable"}
                   </span>
                 </div>
               )}
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}
