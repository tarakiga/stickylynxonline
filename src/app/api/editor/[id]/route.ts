import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { BlockType, Prisma } from "@prisma/client";
import { getUserPlanSnapshot, getFeatureAccessError } from "@/lib/subscription";
import { getFoodMenuFeatureViolations } from "@/lib/food-menu-entitlements";
import { normalizeDataUrlsToCloudinary } from "@/lib/cloudinary";
import { getTeamProjectHubSections } from "@/lib/team-project-hub";

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
  const page = await prisma.page.findUnique({
    where: { id },
    include: {
      blocks: { orderBy: { order: "asc" } },
      teamProjectMembers: true,
    },
  });
  if (!page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = page.userId === userId
  let managedStageIds = new Set<string>()

  if (!isOwner) {
    if (page.category !== "TEAM_PROJECT_HUB") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const authProfile = await currentUser()
    const email = authProfile?.emailAddresses[0]?.emailAddress?.toLowerCase() || null
    const member =
      page.teamProjectMembers.find((entry) => entry.userId && entry.userId === userId) ||
      page.teamProjectMembers.find((entry) => email && entry.email.toLowerCase() === email) ||
      null

    if (!member || member.status !== "ACTIVE") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const currentSections = getTeamProjectHubSections(page.blocks || [])
    managedStageIds = new Set(
      currentSections.timeline.stages
        .filter((stage) => stage.stageOwnerType === "member" && stage.stageOwnerMemberId === member.id)
        .map((stage) => stage.id)
    )

    if (!managedStageIds.size) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
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

  const finalBlocks = !isOwner && page.category === "TEAM_PROJECT_HUB"
    ? (() => {
        const existingSections = getTeamProjectHubSections(page.blocks || [])
        const incomingTimelineBlock = normalizedBlocks.find((block) => block.type === "TIMELINE")
        const incomingTimeline = (incomingTimelineBlock?.content || {}) as Record<string, unknown>
        const incomingStages = Array.isArray(incomingTimeline.stages) ? incomingTimeline.stages : []
        const mergedStages = existingSections.timeline.stages.map((existingStage) => {
          if (!managedStageIds.has(existingStage.id)) return existingStage
          const replacement = incomingStages.find((stage) => {
            if (!stage || typeof stage !== "object" || Array.isArray(stage)) return false
            return "id" in stage && stage.id === existingStage.id
          })
          return replacement && typeof replacement === "object" ? { ...existingStage, ...(replacement as Record<string, unknown>) } : existingStage
        })

        return (page.blocks || []).map((block, index) => ({
          type: block.type,
          order: block.order ?? index,
          content:
            block.type === "TIMELINE"
              ? ({
                  ...incomingTimeline,
                  section: "team_project_timeline",
                  currentStep: existingSections.timeline.currentStep,
                  stages: mergedStages,
                } as Record<string, unknown>)
              : ((block.content as Record<string, unknown> | null) || {}),
        }))
      })()
    : normalizedBlocks

  const writes: Prisma.PrismaPromise<unknown>[] = []

  if (typeof clientEmail === "string") {
    writes.push(prisma.page.update({ where: { id }, data: { clientEmail } }))
  }

  writes.push(prisma.block.deleteMany({ where: { pageId: id } }))

  if (finalBlocks.length > 0) {
    writes.push(
      prisma.block.createMany({
        data: finalBlocks.map((block, index) => ({
          pageId: id,
          type: block.type as BlockType,
          content: block.content as Prisma.InputJsonValue,
          order: block.order ?? index,
        })),
      })
    )
  }

  await prisma.$transaction(writes)

  revalidatePath(`/dashboard/editor/${id}`);
  revalidatePath("/dashboard");
  revalidatePath(`/${page.handle}`);

  return NextResponse.json({ success: true });
}
