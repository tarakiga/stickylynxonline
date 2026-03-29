import * as React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectPortalEditor } from "@/components/editor/ProjectPortalEditor";
import { EpkEditor } from "@/components/editor/EpkEditor";
import { MediaKitEditor } from "@/components/editor/MediaKitEditor";
import { FoodMenuEditor } from "@/components/editor/FoodMenuEditor";
import { PropertyListingEditor } from "@/components/editor/PropertyListingEditor";
import { hasFeature } from "@/lib/plan-rules";
import { getUserPlanSnapshot } from "@/lib/subscription";

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const page = await prisma.page.findUnique({
    where: { id },
    include: { blocks: { orderBy: { order: "asc" } } }
  });

  if (!page || page.userId !== userId) {
    redirect("/dashboard");
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const defaultCurrency = user?.currencyCode || "USD";
  const planSnapshot = await getUserPlanSnapshot(userId);

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-12 w-full h-full min-h-screen relative">
      <div className="mb-8 flex items-center justify-between w-full max-w-5xl mx-auto px-4 mt-6">
        <div className="flex items-center gap-4">
           <Link href="/dashboard" className="p-2 hover:bg-divider rounded-full transition-colors text-text-secondary hover:text-text-primary shadow-sm cursor-pointer">
              <ArrowLeft size={20} />
           </Link>
           <div>
             <p className="text-text-secondary text-sm font-bold tracking-widest uppercase mb-0.5">{page.category.replace("_", " ")} WORKSPACE</p>
             <h1 className="text-2xl font-bold tracking-tight text-text-primary">Editing &apos;{page.title || page.handle}&apos;</h1>
           </div>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 mb-6">
        <div className="rounded-3xl border border-primary/20 bg-primary/5 px-5 py-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary mb-1">{planSnapshot.rules.label} Notification Limit</p>
          <p className="text-sm font-semibold text-text-primary">
            Your current plan allows up to {planSnapshot.rules.dailyEmailNotifications} email notifications per day.
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Applies to project portal invites, feedback updates, approvals, submissions, and media kit requests.
          </p>
        </div>
      </div>
      
      <div className="flex-1 w-full px-4">
         {(page.category as string) === "PROJECT_PORTAL" ? (
             <ProjectPortalEditor page={page} />
         ) : (page.category as string) === "EPK" ? (
             <EpkEditor page={page} />
         ) : (page.category as string) === "INFLUENCER_MEDIA_KIT" ? (
             <MediaKitEditor page={page} />
         ) : (page.category as string) === "FOOD_MENU" ? (
             <FoodMenuEditor
               page={page}
               defaultCurrency={defaultCurrency}
               canUseAdvancedFoodMenu={hasFeature(planSnapshot.plan, "ADVANCED_FOOD_MENU")}
               canUseCustomBranding={hasFeature(planSnapshot.plan, "CUSTOM_BRANDING")}
             />
         ) : (page.category as string) === "PROPERTY_LISTING" ? (
             <PropertyListingEditor page={page} defaultCurrency={defaultCurrency} />
         ) : (
             <div className="w-full max-w-5xl mx-auto bg-surface border border-divider p-8 rounded-3xl flex items-center justify-center text-text-secondary shadow-sm min-h-[400px]">
                <div className="text-center">
                   <h2 className="text-xl font-bold text-text-primary mb-2">Visual Block Editor Workspace</h2>
                   <p>Our drag-and-drop block interface will be constructed here.</p>
                </div>
             </div>
         )}
      </div>
    </div>
  );
}
