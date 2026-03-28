import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { EMAIL_COLORS } from "@/config/theme";
import { getBaseUrl } from "@/lib/utils";
import { sendPlanNotification } from "@/lib/notifications";
import { NotificationEventType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const { name, email, brand, budget, timeline, message } = await request.json();

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Missing name or email" }, { status: 400 });
  }

  const page = await prisma.page.findUnique({
    where: { handle },
    include: { user: true, blocks: { orderBy: { order: "asc" } } },
  });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const contactBlock = page.blocks.find((b) => b.type === "CONTACT");
  const contact = (contactBlock?.content || {}) as Record<string, unknown>;
  const to = (contact.email as string) || page.user?.email;
  if (!to) return NextResponse.json({ error: "No contact email configured" }, { status: 400 });

  const base = getBaseUrl();
  await sendPlanNotification({
    userId: page.userId,
    pageId: page.id,
    type: NotificationEventType.MEDIA_KIT_REQUEST,
    to,
    subject: `Campaign Request from ${name}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: ${EMAIL_COLORS.primary};">New Campaign Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${brand ? `<p><strong>Brand:</strong> ${brand}</p>` : ""}
        ${budget ? `<p><strong>Budget:</strong> ${budget}</p>` : ""}
        ${timeline ? `<p><strong>Timeline:</strong> ${timeline}</p>` : ""}
        ${message ? `<div style="background:${EMAIL_COLORS.surfaceMuted}; padding: 12px; border-radius: 8px; margin: 12px 0;">${message}</div>` : ""}
        <p><a href="${base}/${page.handle}" style="color:${EMAIL_COLORS.primary}; text-decoration:underline;">View Media Kit</a></p>
      </div>
    `,
  });

  return NextResponse.json({ success: true });
}
