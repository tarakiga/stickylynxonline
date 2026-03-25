import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page || page.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const blocks: { type: string; content: Record<string, unknown>; order: number }[] =
    body.blocks;

  if (!Array.isArray(blocks)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Transaction: delete old blocks, insert new ones
  await prisma.$transaction([
    prisma.block.deleteMany({ where: { pageId: id } }),
    ...blocks.map((block, index) =>
      prisma.block.create({
        data: {
          pageId: id,
          type: block.type as never,
          content: block.content as never,
          order: block.order ?? index,
        },
      })
    ),
  ]);

  return NextResponse.json({ success: true });
}
