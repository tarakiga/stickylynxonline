import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProjectPortalPublic } from "@/components/public/ProjectPortalPublic";
import { EpkPublic } from "@/components/public/EpkPublic";
import { MediaKitPublic } from "@/components/public/MediaKitPublic";
import { FoodMenuPublic } from "@/components/public/FoodMenuPublic";
import { PortfolioCaseStudyPublic } from "@/components/public/PortfolioCaseStudyPublic";
import { ServiceMenuPublic } from "@/components/public/ServiceMenuPublic";
import { TeamProjectHubPublic } from "@/components/public/TeamProjectHubPublic";
import { PropertyListingPublic } from "@/components/public/PropertyListingPublic";
import { PortalDeny } from "@/components/public/PortalDeny";
import { cookies } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getBrandCssVariables, normalizeBrandProfile } from "@/lib/branding";
import { PORTFOLIO_CASE_STUDY_CATEGORY } from "@/lib/portfolio-case-study";
import { SERVICE_MENU_CATEGORY } from "@/lib/service-menu";
import { normalizeTeamProjectMembers, TEAM_PROJECT_HUB_CATEGORY, type TeamProjectMember } from "@/lib/team-project-hub";
import { getTeamProjectHubPage, resolveTeamHubViewer } from "@/lib/team-project-hub-access";
import { getPageWithBlocksAndUserByHandle } from "@/lib/page-loaders";

export default async function PublicPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;

  const page = await getPageWithBlocksAndUserByHandle(handle);

  if (!page) {
    notFound();
  }

  const isPortal = (page.category as string) === "PROJECT_PORTAL";
  const isTeamHub = (page.category as string) === TEAM_PROJECT_HUB_CATEGORY;
  if (isPortal) {
    const { userId } = await auth();
    const isOwner = !!userId && userId === page.userId;
    const c = await cookies();
    const cookieVal = c.get(`portal_access_${page.id}`)?.value || "";
    const hasClientCookie =
      !!cookieVal && (cookieVal === page.clientPinHash);
    if (!isOwner && !hasClientCookie) {
      return (
        <PortalDeny handle={page.handle} pinEnabled={!!page.clientPinEnabled} ownerEmail={page.user?.email || undefined} />
      );
    }
  }

  let teamHubViewer = { isOwner: false, isAdmin: false, canAccess: false, memberId: null as string | null, memberName: null as string | null }
  let teamHubMembers: TeamProjectMember[] = []

  if (isTeamHub) {
    const [authState, authProfile, fullTeamHubPage] = await Promise.all([
      auth(),
      currentUser(),
      getTeamProjectHubPage(handle),
    ])

    if (!fullTeamHubPage) {
      notFound()
    }

    const resolvedViewer = await resolveTeamHubViewer({
      page: fullTeamHubPage,
      userId: authState.userId,
      email: authProfile?.emailAddresses[0]?.emailAddress || null,
    })

    if (!resolvedViewer.canAccess) {
      const redirectUrl = `/${page.handle}`
      const email = authProfile?.emailAddresses[0]?.emailAddress || resolvedViewer.member?.email || ""
      const loginUrl = `/login?redirect_url=${encodeURIComponent(redirectUrl)}${email ? `&email=${encodeURIComponent(email)}` : ""}`
      const registerUrl = `/register?redirect_url=${encodeURIComponent(redirectUrl)}${email ? `&email=${encodeURIComponent(email)}` : ""}`

      return (
        <div className="min-h-screen bg-background text-text-primary flex items-center justify-center px-4">
          <div className="max-w-lg rounded-[2rem] border border-divider bg-surface p-8 text-center shadow-premium">
            <h1 className="text-3xl font-bold text-text-primary">Team access required</h1>
            <p className="mt-3 text-sm leading-7 text-text-secondary">
              This workspace is restricted to active allowlist users. Ask the workspace owner to activate your access before trying again.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href={loginUrl}
                className="inline-flex items-center justify-center rounded-2xl border border-divider bg-background px-5 py-3 text-sm font-bold text-text-primary shadow-sm transition hover:bg-divider"
              >
                Sign In
              </Link>
              <Link
                href={registerUrl}
                className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-hover"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )
    }

    teamHubViewer = {
      isOwner: resolvedViewer.isOwner,
      isAdmin: resolvedViewer.isAdmin,
      canAccess: resolvedViewer.canAccess,
      memberId: resolvedViewer.member?.id || null,
      memberName: resolvedViewer.member?.name || null,
    }
    teamHubMembers = normalizeTeamProjectMembers(fullTeamHubPage.teamProjectMembers)
  }

  const brandProfileSource = page.user as ({ brandProfile?: unknown; name?: string | null; email?: string | null } | null)
  const brandProfile = normalizeBrandProfile(brandProfileSource?.brandProfile, page.user?.name || page.user?.email || page.title || page.handle)
  const brandStyle = getBrandCssVariables(brandProfile)

  return (
    <div className="min-h-screen bg-background text-text-primary" style={brandStyle as CSSProperties}>
       {(page.category as string) === "PROJECT_PORTAL" ? (
           <ProjectPortalPublic page={page} />
       ) : (page.category as string) === "EPK" ? (
           <EpkPublic page={page} />
       ) : (page.category as string) === "INFLUENCER_MEDIA_KIT" ? (
           <MediaKitPublic page={page} />
       ) : (page.category as string) === "FOOD_MENU" ? (
           <FoodMenuPublic page={page} />
       ) : (page.category as string) === SERVICE_MENU_CATEGORY ? (
           <ServiceMenuPublic page={page} />
       ) : (page.category as string) === TEAM_PROJECT_HUB_CATEGORY ? (
           <TeamProjectHubPublic page={page} members={teamHubMembers} viewer={teamHubViewer} />
       ) : (page.category as string) === PORTFOLIO_CASE_STUDY_CATEGORY ? (
           <PortfolioCaseStudyPublic page={page} />
       ) : (page.category as string) === "PROPERTY_LISTING" ? (
           <PropertyListingPublic page={page} />
       ) : (
           <div className="p-10 flex flex-col items-center justify-center min-h-screen text-center">
              <h1 className="text-4xl font-bold mb-4">{page.title || page.handle}</h1>
              <p className="text-text-secondary">This generic page is under construction.</p>
           </div>
       )}
    </div>
  );
}
