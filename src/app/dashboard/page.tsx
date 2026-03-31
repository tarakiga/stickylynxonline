import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { PageItemCard } from "@/components/ui/PageItemCard";
import { CreateLynxModal } from "@/components/dashboard/CreateLynxModal";
import { CreateLynxDrawer } from "@/components/dashboard/CreateLynxDrawer";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import { ensureUserAccount, getUserPlanSnapshot } from "@/lib/subscription";

type DashboardPageRow = {
  id: string
  title: string | null
  handle: string
  category: string
}

function isUnknownPageCategoryError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false
  }

  const code = "code" in error ? error.code : undefined
  const message = "message" in error ? error.message : undefined

  return code === "P2023" && typeof message === "string" && message.includes("PageCategory")
}

async function getDashboardPages(userId: string): Promise<DashboardPageRow[]> {
  try {
    return await prisma.page.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        handle: true,
        category: true,
      },
    })
  } catch (error) {
    if (!isUnknownPageCategoryError(error)) {
      throw error
    }

    return prisma.$queryRaw<DashboardPageRow[]>`
      SELECT "id", "title", "handle", "category"::text AS "category"
      FROM "Page"
      WHERE "userId" = ${userId}
      ORDER BY "updatedAt" DESC
    `
  }
}

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect("/login");
  }

  const primaryEmail = user.emailAddresses[0]?.emailAddress;

  if (primaryEmail) {
    await ensureUserAccount({
      userId,
      email: primaryEmail,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    });
  }

  const pages = await getDashboardPages(userId);
  const planSnapshot = await getUserPlanSnapshot(userId);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold text-text-primary tracking-tight">Your Lynx</h1>
           <p className="text-text-secondary mt-1">Manage, edit, and share your individual lynx profiles, menus, and EPKs.</p>
           <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-secondary mt-3">
             {planSnapshot.rules.label} • {planSnapshot.usage.totalPages}/{planSnapshot.rules.maxPages} Lynx • {planSnapshot.rules.maxFoodMenus === null ? `${planSnapshot.usage.foodMenus} Food Menus` : `${planSnapshot.usage.foodMenus}/${planSnapshot.rules.maxFoodMenus} Food Menus`}
           </p>
         </div>
         <Link href="/dashboard?create=true" className="btn-primary font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm text-sm sm:text-base cursor-pointer">
           <Plus size={20} />
           Create New Lynx
         </Link>
      </div>

      {pages.length === 0 ? (
        <div className="bg-surface border border-divider rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
           <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
             <Plus size={32} />
           </div>
           <h2 className="text-xl font-bold text-text-primary mb-2">You don&apos;t have any lynx yet</h2>
           <p className="text-text-secondary mb-6 max-w-md">Click the exact button below to pick a template and start building your brand online.</p>
           <Link href="/dashboard?create=true" className="btn-primary font-bold px-8 py-3.5 rounded-xl shadow-sm cursor-pointer block">Get Started</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          {pages.map((page) => (
             <PageItemCard
               key={page.id}
               id={page.id}
               title={page.title || page.handle}
               handle={page.handle}
               category={page.category}
             />
          ))}
        </div>
      )}
      
      <Suspense fallback={null}>
        <CreateLynxModal
          planLabel={planSnapshot.rules.label}
          totalPages={planSnapshot.usage.totalPages}
          maxPages={planSnapshot.rules.maxPages}
          foodMenus={planSnapshot.usage.foodMenus}
          maxFoodMenus={planSnapshot.rules.maxFoodMenus}
        />
        <CreateLynxDrawer
          planLabel={planSnapshot.rules.label}
          totalPages={planSnapshot.usage.totalPages}
          maxPages={planSnapshot.rules.maxPages}
          foodMenus={planSnapshot.usage.foodMenus}
          maxFoodMenus={planSnapshot.rules.maxFoodMenus}
        />
      </Suspense>
    </div>
  )
}
