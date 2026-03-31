import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { BlockType, Prisma } from "@prisma/client";
import { getUserPlanSnapshot, getFeatureAccessError } from "@/lib/subscription";
import { getFoodMenuFeatureViolations } from "@/lib/food-menu-entitlements";
import { normalizeDataUrlsToCloudinary } from "@/lib/cloudinary";

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
  const clientEmail: string | undefined = body.clientEmail;

  if (!Array.isArray(blocks)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (page.category === "FOOD_MENU") {
    const planSnapshot = await getUserPlanSnapshot(userId)
    const violations = getFoodMenuFeatureViolations(blocks)

    for (const feature of violations) {
      const featureError = getFeatureAccessError(planSnapshot, feature)
      if (featureError) {
        return NextResponse.json({ error: featureError.message, code: featureError.code, field: featureError.field, feature }, { status: 403 });
      }
    }
  }

  const normalizedBlocks = await Promise.all(
    blocks.map(async (block) => ({
      ...block,
      content: await normalizeDataUrlsToCloudinary(block.content, {
        userId,
        pageId: id,
        scope: "editor",
      }),
    }))
  )

  await prisma.$transaction(
    async (tx) => {
      if (typeof clientEmail === "string") {
        await tx.page.update({ where: { id }, data: { clientEmail } });
      }

      await tx.block.deleteMany({ where: { pageId: id } });

      if (normalizedBlocks.length > 0) {
        await tx.block.createMany({
          data: normalizedBlocks.map((block, index) => ({
            pageId: id,
            type: block.type as BlockType,
            content: block.content as Prisma.InputJsonValue,
            order: block.order ?? index,
          })),
        });
      }
    },
    { timeout: 30000 }
  );

  revalidatePath(`/dashboard/editor/${id}`);
  revalidatePath("/dashboard");
  revalidatePath(`/${page.handle}`);

  return NextResponse.json({ success: true });
}
