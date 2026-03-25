"use server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { PageCategory, BlockType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createLynxPage(data: {
  title: string;
  handle: string;
  category: string;
  clientEmail?: string;
  config?: any;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const existing = await prisma.page.findUnique({
    where: { handle: data.handle }
  });

  if (existing) {
    return { error: "This URL handle is already taken. Please choose another one." };
  }

  const category = data.category as PageCategory;

  // Use a transaction to ensure page and blocks are created together
  const newPage = await prisma.$transaction(async (tx) => {
    const page = await tx.page.create({
      data: {
        userId,
        title: data.title,
        handle: data.handle,
        category,
        clientEmail: data.clientEmail,
        theme: data.config ? data.config : undefined
      }
    });

    // Seed default blocks if category is PROJECT_PORTAL
    if (category === "PROJECT_PORTAL") {
      const clientName = data.config?.clientName || "Your Client";
      
      const defaultBlocks = [
        { type: "PROJECT_HEADER", content: { title: data.title, clientName }, order: 0 },
        { type: "STATUS_SUMMARY", content: { text: "Preparing initial project roadmap and discovery phases." }, order: 1 },
        { type: "TIMELINE", content: { currentStep: 1, milestones: [
           { id: "1", label: "Discovery" },
           { id: "2", label: "Wireframes" },
           { id: "3", label: "Visual" },
           { id: "4", label: "Development" },
           { id: "5", label: "Launch" }
        ]}, order: 2 },
        { type: "DELIVERABLES", content: { items: [] }, order: 3 },
        { type: "FEEDBACK_LIST", content: { items: [] }, order: 4 },
        { type: "COMMENT_THREAD", content: { messages: [] }, order: 5 }
      ];

      await Promise.all(defaultBlocks.map((b, i) => 
        tx.block.create({
          data: {
            pageId: page.id,
            type: b.type as BlockType,
            content: b.content,
            order: b.order
          }
        })
      ));
    }

    // Seed default blocks for EPK
    if (category === "EPK") {
      const artistName = data.config?.artistName || data.title;
      const genre = data.config?.genre || "";

      const epkBlocks = [
        { type: "TEXT", content: { section: "hero", artistName, tagline: "", genre, profileImage: "", coverImage: "" }, order: 0 },
        { type: "LINK", content: { items: [] }, order: 1 },
        { type: "AUDIO", content: { items: [] }, order: 2 },
        { type: "VIDEO", content: { items: [] }, order: 3 },
        { type: "IMAGE", content: { items: [] }, order: 4 },
        { type: "TEXT", content: { section: "bio", text: "", pressKitUrl: "" }, order: 5 },
        { type: "CONTACT", content: { email: "", phone: "", managementName: "", managementEmail: "", socials: {} }, order: 6 },
      ];

      await Promise.all(epkBlocks.map((b) =>
        tx.block.create({
          data: { pageId: page.id, type: b.type as BlockType, content: b.content, order: b.order }
        })
      ));
    }

    return page;
  });

  revalidatePath("/dashboard");
  return { pageId: newPage.id };
}
