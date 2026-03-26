import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const code = String(body.code || "").toUpperCase();
  if (!code || code.length < 3 || code.length > 4) {
    return NextResponse.json({ error: "Invalid currency code" }, { status: 400 });
  }
  await prisma.user.update({ where: { id: userId }, data: { currencyCode: code } });
  return NextResponse.json({ success: true, code });
}
