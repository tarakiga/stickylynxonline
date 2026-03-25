import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { PageItemCard } from "@/components/ui/PageItemCard";
import { CreateLynxModal } from "@/components/dashboard/CreateLynxModal";
import { CreateLynxDrawer } from "@/components/dashboard/CreateLynxDrawer";
import { Plus } from "lucide-react";
import { Suspense } from "react";

async function getOrCreateUser(userId: string, email: string, name: string | null) {
  let user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userId,
        email: email,
        name: name,
      }
    });
  }
  return user;
}

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect("/login");
  }

  const primaryEmail = user.emailAddresses[0]?.emailAddress;

  if (primaryEmail) {
    await getOrCreateUser(userId, primaryEmail, `${user.firstName || ""} ${user.lastName || ""}`.trim());
  }

  const pages = await prisma.page.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold text-text-primary tracking-tight">Your Lynx</h1>
           <p className="text-text-secondary mt-1">Manage, edit, and share your individual lynx profiles, menus, and EPKs.</p>
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
           <h2 className="text-xl font-bold text-text-primary mb-2">You don't have any lynx yet</h2>
           <p className="text-text-secondary mb-6 max-w-md">Click the exact button below to pick a template and start building your brand online.</p>
           <Link href="/dashboard?create=true" className="btn-primary font-bold px-8 py-3.5 rounded-xl shadow-sm cursor-pointer block">Get Started</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          {pages.map((page: any) => (
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
        <CreateLynxModal />
        <CreateLynxDrawer />
      </Suspense>
    </div>
  )
}
