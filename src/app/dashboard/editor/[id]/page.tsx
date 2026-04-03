import * as React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { ProjectPortalEditor } from "@/components/editor/ProjectPortalEditor";
import { EpkEditor } from "@/components/editor/EpkEditor";
import { MediaKitEditor } from "@/components/editor/MediaKitEditor";
import { FoodMenuEditor } from "@/components/editor/FoodMenuEditor";
import { PortfolioCaseStudyEditor } from "@/components/editor/PortfolioCaseStudyEditor";
import { ServiceMenuEditor } from "@/components/editor/ServiceMenuEditor";
import { TeamProjectHubEditor } from "@/components/editor/TeamProjectHubEditor";
import { PropertyListingEditor } from "@/components/editor/PropertyListingEditor";
import { hasFeature } from "@/lib/plan-rules";
import { PORTFOLIO_CASE_STUDY_CATEGORY } from "@/lib/portfolio-case-study";
import { getUserPlanSnapshot } from "@/lib/subscription";
import { SERVICE_MENU_CATEGORY } from "@/lib/service-menu";
import { getTeamProjectHubSections, normalizeTeamProjectMembers, TEAM_PROJECT_HUB_CATEGORY } from "@/lib/team-project-hub";
import { getPageWithBlocksById } from "@/lib/page-loaders";

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect(`/login?redirect_url=${encodeURIComponent(`/dashboard/editor/${id}`)}`);

  const page = await getPageWithBlocksById(id);

  if (!page) {
    redirect("/dashboard");
  }

  const authProfile = await currentUser();
  const primaryEmail = authProfile?.emailAddresses[0]?.emailAddress?.toLowerCase() || null;

  const isOwner = page.userId === userId
  const planSnapshot = await getUserPlanSnapshot(userId);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const defaultCurrency = user?.currencyCode || "USD";

  const teamMembers =
    (page.category as string) === TEAM_PROJECT_HUB_CATEGORY
      ? normalizeTeamProjectMembers(await prisma.teamProjectMember.findMany({
          where: { pageId: page.id },
          orderBy: [{ createdAt: "asc" }],
        }))
      : [];

  let editorMode: "owner" | "stage_manager" = "owner"
  let managedStageIds: string[] = []
  let ownerName = user?.name || user?.email || "Project Owner"

  if (!isOwner) {
    if ((page.category as string) !== TEAM_PROJECT_HUB_CATEGORY) {
      redirect("/dashboard");
    }

    const pageOwner = await prisma.user.findUnique({ where: { id: page.userId } });
    ownerName = pageOwner?.name || pageOwner?.email || "Project Owner"

    const member =
      teamMembers.find((entry) => entry.userId && entry.userId === userId) ||
      teamMembers.find((entry) => primaryEmail && entry.email === primaryEmail) ||
      null

    if (!member || member.status !== "ACTIVE") {
      redirect("/dashboard")
    }

    const sections = getTeamProjectHubSections(page.blocks || [])
    managedStageIds = sections.timeline.stages
      .filter((stage) => stage.stageOwnerType === "member" && stage.stageOwnerMemberId === member.id)
      .map((stage) => stage.id)

    if (!managedStageIds.length) {
      redirect("/dashboard")
    }

    editorMode = "stage_manager"
  }

  if (editorMode === "stage_manager") {
    redirect(`/stage-manager/editor/${id}`)
  }

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-12 w-full h-full min-h-screen relative">
      <div className="mb-8 flex items-center justify-between w-full max-w-5xl mx-auto px-4 mt-6">
        <div className="flex items-center gap-4">
           <Link href="/dashboard" className="p-2 hover:bg-divider rounded-full transition-colors text-text-secondary hover:text-text-primary shadow-sm cursor-pointer">
              <ArrowLeft size={20} />
           </Link>
           <div>
             <p className="text-text-secondary text-sm font-bold tracking-widest uppercase mb-0.5">{page.category.replace(/_/g, " ")} WORKSPACE</p>
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
         ) : (page.category as string) === SERVICE_MENU_CATEGORY ? (
             <ServiceMenuEditor page={page} defaultCurrency={defaultCurrency} />
         ) : (page.category as string) === PORTFOLIO_CASE_STUDY_CATEGORY ? (
             <PortfolioCaseStudyEditor page={page} />
         ) : (page.category as string) === TEAM_PROJECT_HUB_CATEGORY ? (
             <TeamProjectHubEditor page={page} initialMembers={teamMembers} ownerName={ownerName} mode={editorMode} managedStageIds={managedStageIds} />
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
