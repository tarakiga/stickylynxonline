import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProjectPortalPublic } from "@/components/public/ProjectPortalPublic";
import { EpkPublic } from "@/components/public/EpkPublic";
import { MediaKitPublic } from "@/components/public/MediaKitPublic";
import { FoodMenuPublic } from "@/components/public/FoodMenuPublic";

export default async function PublicPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;

  const page = await prisma.page.findUnique({
    where: { handle },
    include: { blocks: { orderBy: { order: "asc" } } }
  });

  if (!page) {
    notFound();
  }

  // Handle privacy (optional for now, but good to have)
  if (!page.isPublic) {
    // For now we allow viewing if you have the link, or we could redirect to a splash
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
       {(page.category as string) === "PROJECT_PORTAL" ? (
           <ProjectPortalPublic page={page} />
       ) : (page.category as string) === "EPK" ? (
           <EpkPublic page={page} />
       ) : (page.category as string) === "INFLUENCER_MEDIA_KIT" ? (
           <MediaKitPublic page={page} />
       ) : (page.category as string) === "FOOD_MENU" ? (
           <FoodMenuPublic page={page} />
       ) : (
           <div className="p-10 flex flex-col items-center justify-center min-h-screen text-center">
              <h1 className="text-4xl font-bold mb-4">{page.title || page.handle}</h1>
              <p className="text-text-secondary">This generic page is under construction.</p>
           </div>
       )}
    </div>
  );
}
