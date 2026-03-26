import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { userId } = await auth();
  const { handle } = await params;
  const page = await prisma.page.findUnique({ where: { handle } });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if ((page.category as any) !== "PROJECT_PORTAL") return NextResponse.json({ error: "Not applicable" }, { status: 400 });
  if (!userId || userId !== page.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const pin = String(Math.floor(100000 + Math.random() * 900000));
  const pinHash = crypto.createHash("sha256").update(pin).digest("hex");
  const now = new Date();
  await prisma.page.update({
    where: { id: page.id },
    data: { clientPinHash: pinHash, clientPinEnabled: true, clientPinCreatedAt: now }
  });
  return NextResponse.json({ pin });
}
