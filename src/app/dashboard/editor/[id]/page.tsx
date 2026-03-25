import * as React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectPortalEditor } from "@/components/editor/ProjectPortalEditor";
import { EpkEditor } from "@/components/editor/EpkEditor";

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

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-12 w-full h-full min-h-screen relative">
      <div className="mb-8 flex items-center justify-between w-full max-w-5xl mx-auto px-4 mt-6">
        <div className="flex items-center gap-4">
           <Link href="/dashboard" className="p-2 hover:bg-divider rounded-full transition-colors text-text-secondary hover:text-text-primary shadow-sm cursor-pointer">
              <ArrowLeft size={20} />
           </Link>
           <div>
             <p className="text-text-secondary text-sm font-bold tracking-widest uppercase mb-0.5">{page.category.replace("_", " ")} WORKSPACE</p>
             <h1 className="text-2xl font-bold tracking-tight text-text-primary">Editing '{page.title || page.handle}'</h1>
           </div>
        </div>
      </div>
      
      <div className="flex-1 w-full px-4">
         {(page.category as string) === "PROJECT_PORTAL" ? (
             <ProjectPortalEditor page={page} />
         ) : (page.category as string) === "EPK" ? (
             <EpkEditor page={page} />
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
