import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { ProjectPortalPublic } from "@/components/public/ProjectPortalPublic";
import { EpkPublic } from "@/components/public/EpkPublic";
import { MediaKitPublic } from "@/components/public/MediaKitPublic";
import { FoodMenuPublic } from "@/components/public/FoodMenuPublic";
import { ServiceMenuPublic } from "@/components/public/ServiceMenuPublic";
import { PropertyListingPublic } from "@/components/public/PropertyListingPublic";
import { PortalDeny } from "@/components/public/PortalDeny";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { getBrandCssVariables, normalizeBrandProfile } from "@/lib/branding";
import { SERVICE_MENU_CATEGORY } from "@/lib/service-menu";
import { getPageWithBlocksAndUserByHandle } from "@/lib/page-loaders";

export default async function PublicPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;

  const page = await getPageWithBlocksAndUserByHandle(handle);

  if (!page) {
    notFound();
  }

  const isPortal = (page.category as string) === "PROJECT_PORTAL";
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
