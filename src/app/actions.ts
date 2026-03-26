"use server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { PageCategory, BlockType, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";
import { EMAIL_COLORS } from "@/config/theme";
import { getBaseUrl } from "@/lib/utils";

export async function createLynxPage(data: {
  title: string;
  handle: string;
  category: string;
  clientEmail?: string;
  config?: Prisma.InputJsonValue;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const isValidHandle = /^[a-z0-9-]+$/.test(data.handle);
  if (!isValidHandle) {
    return { error: "Handle must contain only lowercase letters, numbers, and hyphens (no spaces)." };
  }

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
        theme: data.config ? (data.config as Prisma.InputJsonValue) : undefined
      }
    });

    // Seed default blocks if category is PROJECT_PORTAL
    if (category === "PROJECT_PORTAL") {
      const cfg = data.config as Record<string, unknown> | undefined;
      const clientName = typeof cfg?.clientName === "string" ? (cfg!.clientName as string) : "Your Client";
      
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

      await Promise.all(defaultBlocks.map((b) => 
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
      const cfg = data.config as Record<string, unknown> | undefined;
      const artistName = typeof cfg?.artistName === "string" ? (cfg!.artistName as string) : data.title;
      const genre = typeof cfg?.genre === "string" ? (cfg!.genre as string) : "";

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

    // Seed default blocks for Influencer Media Kit
    if (data.category === "INFLUENCER_MEDIA_KIT") {
      const mediaKitBlocks = [
        { type: "TEXT", content: { section: "creator_hero", name: data.title, handle: data.handle, niche: "", profileImage: "", logo: "", primaryCta: "Request a campaign" }, order: 0 },
        { type: "TEXT", content: { section: "creator_bio", text: "", pillars: [] }, order: 1 },
        { type: "GRID", content: { section: "audience", topAges: [], genderSplit: { male: 0, female: 0, other: 0 }, topCountries: [], interests: [] }, order: 2 },
        { type: "GRID", content: { section: "platform_metrics", platforms: [] }, order: 3 },
        { type: "GRID", content: { section: "collaborations", items: [] }, order: 4 },
        { type: "GRID", content: { section: "content_examples", items: [] }, order: 5 },
        { type: "GRID", content: { section: "services", services: [] }, order: 6 },
        { type: "GRID", content: { section: "testimonials", items: [] }, order: 7 },
        { type: "CONTACT", content: { email: "", phone: "", managementName: "", managementEmail: "", website: "", briefForm: { enabled: false } }, order: 8 },
      ];

      await Promise.all(mediaKitBlocks.map((b) =>
        tx.block.create({
          data: { pageId: page.id, type: b.type as BlockType, content: b.content, order: b.order }
        })
      ));
    }

    // Seed default blocks for Food Menu
    if (category === "FOOD_MENU") {
      const foodBlocks = [
        { type: "TEXT", content: { section: "brand_header", businessName: data.title || data.handle, tagline: "", cuisineType: "", shortDescription: "", heroImage: "", logoImage: "" }, order: 0 },
        { type: "GRID", content: { section: "service_info", serviceType: "all", description: "", emails: [], phones: [], socials: [], locations: [], orderingLinks: [], notes: "" }, order: 1 },
        { type: "GRID", content: { section: "menu_sections", defaultOpenSectionIds: [], collapsible: true, hasSidebar: false, hasSearch: true, maxDefaultOpen: 3, sections: [] }, order: 2 },
        { type: "GRID", content: { section: "extras", title: "Add-ons", description: "", items: [] }, order: 3 },
      ];
      await Promise.all(foodBlocks.map((b) =>
        tx.block.create({
          data: { pageId: page.id, type: b.type as BlockType, content: b.content, order: b.order }
        })
      ));
    }

    // Project Portal: generate client access + PIN and send invitation
    if (category === "PROJECT_PORTAL" && page.clientEmail) {
      const token = crypto.randomBytes(24).toString("hex");
      const pin = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const pinHash = crypto.createHash("sha256").update(pin).digest("hex");
      const now = new Date();
      await tx.page.update({
        where: { id: page.id },
        data: {
          clientAccessTokenHash: tokenHash,
          clientAccessCreatedAt: now,
          clientAccessRevoked: false,
          clientPinHash: pinHash,
          clientPinEnabled: true,
          clientPinCreatedAt: now,
        } as any
      });
      const base = getBaseUrl();
      const owner = await tx.user.findUnique({ where: { id: userId } });
      const result = await sendEmail({
        to: page.clientEmail,
        subject: `Project Portal Access: ${page.title || page.handle}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color: ${EMAIL_COLORS.primary}; margin: 0 0 8px;">Your Project Portal Invitation</h2>
            <p style="margin: 0 0 12px;">Hello${(data.config as any)?.clientName ? " " + (data.config as any)?.clientName : ""},</p>
            <p style="margin: 0 0 12px;">${owner?.name || owner?.email || "Your freelancer"} has invited you to track progress for <strong>${page.title || page.handle}</strong>.</p>
            <p style="margin: 16px 0;">
              <a href="${base}/api/portal/${page.handle}/auth?access=${token}" style="background: ${EMAIL_COLORS.primary}; color: ${EMAIL_COLORS.onPrimary}; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Open Project Portal
              </a>
            </p>
            <div style="background: ${EMAIL_COLORS.surfaceMuted}; padding: 12px; border-radius: 8px; margin: 12px 0;">
              <p style="margin: 0;"><strong>PIN:</strong> ${pin}</p>
              <p style="margin: 0; color:#64748b; font-size:12px;">You may be asked for this PIN if you access without the invitation link.</p>
            </div>
            <p style="color:#64748b; font-size:12px;">If you didn't expect this email, you can safely ignore it.</p>
          </div>
        `
      });
      const emailSent = !!result.ok;
      return page;
    }

    return page;
  });

  revalidatePath("/dashboard");
  return { pageId: newPage.id, emailSent: !!newPage.clientEmail };
}
