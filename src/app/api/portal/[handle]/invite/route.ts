import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";
import { EMAIL_COLORS } from "@/config/theme";
import { getBaseUrl } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { userId } = await auth();
  const { handle } = await params;
  const page = await prisma.page.findUnique({
    where: { handle },
    include: { user: true },
  });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if ((page.category as any) !== "PROJECT_PORTAL") return NextResponse.json({ error: "Not applicable" }, { status: 400 });
  if (!userId || userId !== page.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!page.clientEmail) return NextResponse.json({ error: "Missing client email" }, { status: 400 });

  const token = crypto.randomBytes(24).toString("hex");
  const pin = String(Math.floor(100000 + Math.random() * 900000));
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const pinHash = crypto.createHash("sha256").update(pin).digest("hex");
  const now = new Date();

  await prisma.page.update({
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

  const base = getBaseUrl();
  const result = await sendEmail({
    to: page.clientEmail,
    subject: `Project Portal Access: ${page.title || page.handle}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: ${EMAIL_COLORS.primary}; margin: 0 0 8px;">Your Project Portal Invitation</h2>
        <p style="margin: 0 0 12px;">Hello${page.clientName ? " " + page.clientName : ""},</p>
        <p style="margin: 0 0 12px;">${page.user?.name || page.user?.email || "Your freelancer"} has invited you to track progress for <strong>${page.title || page.handle}</strong>.</p>
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

  if (!result.ok) {
    return NextResponse.json({ error: "Email failed", detail: result.error || result.response }, { status: 500 });
  }
  return NextResponse.json({ success: true, accepted: result.accepted });
}
