"use server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { PageCategory, BlockType, Prisma, NotificationEventType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { EMAIL_COLORS } from "@/config/theme";
import { getBaseUrl } from "@/lib/utils";
import { ensureUserAccount, getPlanLimitError, getUserPlanSnapshot } from "@/lib/subscription";
import { sendPlanNotification } from "@/lib/notifications";
import { createDefaultPropertyListingBlocks } from "@/lib/property-listing";

type CreateLynxPageError = {
  code: string
  field?: string
  message: string
}

type CreateLynxPageResult =
  | { error: CreateLynxPageError }
  | { pageId: string; emailSent: boolean }

export async function createLynxPage(data: {
  title: string;
  handle: string;
  category: string;
  clientEmail?: string;
  config?: Prisma.InputJsonValue;
}): Promise<CreateLynxPageResult> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const authUser = await currentUser();
  const primaryEmail = authUser?.emailAddresses[0]?.emailAddress;
  if (!primaryEmail) {
    return {
      error: {
        code: "EMAIL_REQUIRED",
        field: "email",
        message: "We could not resolve your account email. Please refresh and try again.",
      },
    };
  }

  const isValidHandle = /^[a-z0-9-]+$/.test(data.handle);
  const configRecord =
    data.config && typeof data.config === "object" && !Array.isArray(data.config)
      ? (data.config as Record<string, unknown>)
      : undefined;

  if (!isValidHandle) {
    return {
      error: {
        code: "INVALID_HANDLE",
        field: "handle",
        message: "Handle must contain only lowercase letters, numbers, and hyphens (no spaces).",
      },
    };
  }

  await ensureUserAccount({
    userId,
    email: primaryEmail,
    name: `${authUser?.firstName || ""} ${authUser?.lastName || ""}`.trim() || null,
  });

  const existing = await prisma.page.findUnique({
    where: { handle: data.handle }
  });

  if (existing) {
    return {
      error: {
        code: "HANDLE_TAKEN",
        field: "handle",
        message: "This URL handle is already taken. Please choose another one.",
      },
    };
  }

  const category = data.category as PageCategory;
  const planSnapshot = await getUserPlanSnapshot(userId);
  const planLimitError = getPlanLimitError(planSnapshot, category);

  if (planLimitError) {
    return { error: planLimitError };
  }

  // Use a transaction to ensure page and blocks are created together
  let inviteToken: string | null = null;
  let invitePin: string | null = null;
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

    if (category === "PROPERTY_LISTING") {
      const cfg = data.config as Record<string, unknown> | undefined;
      const propertyBlocks = createDefaultPropertyListingBlocks({
        title: data.title,
        handle: data.handle,
        locationLabel: typeof cfg?.locationLabel === "string" ? cfg.locationLabel : undefined,
        area: typeof cfg?.area === "string" ? cfg.area : undefined,
        city: typeof cfg?.city === "string" ? cfg.city : undefined,
        country: typeof cfg?.country === "string" ? cfg.country : undefined,
        listingType: cfg?.listingType === "rent" ? "rent" : "sale",
        price: typeof cfg?.price === "number" || typeof cfg?.price === "string" ? cfg.price : null,
        currency: typeof cfg?.currency === "string" ? cfg.currency : undefined,
        beds: typeof cfg?.beds === "number" || typeof cfg?.beds === "string" ? cfg.beds : null,
        baths: typeof cfg?.baths === "number" || typeof cfg?.baths === "string" ? cfg.baths : null,
        propertyType: typeof cfg?.propertyType === "string" ? cfg.propertyType as never : undefined,
        agentName: typeof cfg?.agentName === "string" ? cfg.agentName : undefined,
        agentEmail: typeof cfg?.agentEmail === "string" ? cfg.agentEmail : undefined,
      })

      await Promise.all(propertyBlocks.map((block) =>
        tx.block.create({
          data: {
            pageId: page.id,
            type: block.type as BlockType,
            content: block.content,
            order: block.order,
          }
        })
      ))
    }

    // Project Portal: generate client access + PIN (email sent after transaction)
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
        }
      });
      inviteToken = token;
      invitePin = pin;
      return page;
    }

    return page;
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/editor/${newPage.id}`);
  revalidatePath(`/${newPage.handle}`);
  let emailSent = false;
  if ((newPage.category as string) === "PROJECT_PORTAL" && newPage.clientEmail && inviteToken && invitePin) {
    const base = getBaseUrl();
    const owner = await prisma.user.findUnique({ where: { id: newPage.userId } });
    const result = await sendPlanNotification({
      userId: newPage.userId,
      pageId: newPage.id,
      type: NotificationEventType.PROJECT_PORTAL_INVITE,
      to: newPage.clientEmail,
      subject: `Project Portal Access: ${newPage.title || newPage.handle}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: ${EMAIL_COLORS.primary}; margin: 0 0 8px;">Your Project Portal Invitation</h2>
          <p style="margin: 0 0 12px;">Hello${typeof configRecord?.clientName === "string" ? ` ${configRecord.clientName}` : ""},</p>
          <p style="margin: 0 0 12px;">${owner?.name || owner?.email || "Your freelancer"} has invited you to track progress for <strong>${newPage.title || newPage.handle}</strong>.</p>
          <p style="margin: 16px 0;">
            <a href="${base}/${newPage.handle}?access=${inviteToken}" style="background: ${EMAIL_COLORS.primary}; color: ${EMAIL_COLORS.onPrimary}; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Open Project Portal
            </a>
          </p>
          <div style="background: ${EMAIL_COLORS.surfaceMuted}; padding: 12px; border-radius: 8px; margin: 12px 0;">
            <p style="margin: 0;"><strong>PIN:</strong> ${invitePin}</p>
            <p style="margin: 0; color:#64748b; font-size:12px;">You may be asked for this PIN if you access without the invitation link.</p>
          </div>
          <p style="color:#64748b; font-size:12px;">If you didn't expect this email, you can safely ignore it.</p>
        </div>
      `
    });
    emailSent = !!result.ok;
  }
  return { pageId: newPage.id, emailSent };
}
