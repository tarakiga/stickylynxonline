import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/utils";
import { EMAIL_COLORS } from "@/config/theme";
import { sendPlanNotification } from "@/lib/notifications";
import { NotificationEventType } from "@prisma/client";
import { normalizeDataUrlsToCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const page = await prisma.page.findUnique({
    where: { handle },
    include: { blocks: { orderBy: { order: "asc" } } },
  });

  if (!page || page.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { taskId, stageId, submission } = await request.json();
  const normalizedSubmission = await normalizeDataUrlsToCloudinary(submission, {
    userId,
    pageId: page.id,
    scope: "task-submissions",
  });

  const timelineBlock = page.blocks.find((b) => b.type === "TIMELINE");
  if (!timelineBlock) return NextResponse.json({ error: "No timeline" }, { status: 404 });

  type Submission = { type: string; value?: string };
  type TaskShape = { id: string; status: string; title?: string; submission?: Submission };
  type MilestoneShape = { id: string; tasks: TaskShape[] };
  const content = timelineBlock.content as { milestones: MilestoneShape[] };
  const milestones = (content.milestones || []) as MilestoneShape[];

  let taskToNotify: TaskShape | null = null;
  for (const m of milestones) {
    if (m.id !== stageId) continue;
    for (const t of m.tasks || []) {
      if (t.id === taskId) {
        t.status = "review";
        t.submission = normalizedSubmission;
        taskToNotify = t;
        break;
      }
    }
  }

  if (!taskToNotify) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  await prisma.block.update({
    where: { id: timelineBlock.id },
    data: { content: { ...content, milestones } as never },
  });

  // Notify Client
  if (page.clientEmail) {
    await sendPlanNotification({
      userId: page.userId,
      pageId: page.id,
      type: NotificationEventType.PROJECT_PORTAL_SUBMISSION,
      to: page.clientEmail,
      subject: `Draft Ready for Review: ${taskToNotify.title}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: ${EMAIL_COLORS.primary};">Hello from ${page.title}!</h2>
          <p>The latest updates for <strong>${taskToNotify.title}</strong> are ready for your review.</p>
          <div style="background: ${EMAIL_COLORS.surfaceMuted}; padding: 15px; border-radius: 8px; margin: 15px 0;">
             <p><strong>Submission Type:</strong> ${normalizedSubmission.type}</p>
             <p><strong>Message:</strong> Check the project portal for details.</p>
          </div>
          <p><a href="${getBaseUrl()}/${page.handle}" style="background: ${EMAIL_COLORS.primary}; color: ${EMAIL_COLORS.onPrimary}; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Launch Project Portal</a></p>
        </div>
      `
    });
  }

  return NextResponse.json({ success: true });
}
