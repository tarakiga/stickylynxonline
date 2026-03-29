import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { PageCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { userId } = await auth();
  const { handle } = await params;
  const body = await request.json() as { enabled?: boolean };
  const page = await prisma.page.findUnique({ where: { handle } });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (page.category !== PageCategory.PROJECT_PORTAL) return NextResponse.json({ error: "Not applicable" }, { status: 400 });
  if (!userId || userId !== page.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const enabled = !!body.enabled;
  await prisma.page.update({
    where: { id: page.id },
    data: { clientPinEnabled: enabled }
  });
  return NextResponse.json({ success: true });
}
