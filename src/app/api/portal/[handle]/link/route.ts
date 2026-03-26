import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { getBaseUrl } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { userId } = await auth();
  const { handle } = await params;
  const page = await prisma.page.findUnique({ where: { handle }, include: { user: true } });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if ((page.category as any) !== "PROJECT_PORTAL") return NextResponse.json({ error: "Not applicable" }, { status: 400 });
  if (!userId || userId !== page.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = crypto.randomBytes(24).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const now = new Date();

  await prisma.page.update({
    where: { id: page.id },
    data: {
      clientAccessTokenHash: tokenHash,
      clientAccessCreatedAt: now,
      clientAccessRevoked: false,
    }
  });

  const base = getBaseUrl();
  const link = `${base}/api/portal/${page.handle}/auth?access=${token}`;
  return NextResponse.json({ link });
}
