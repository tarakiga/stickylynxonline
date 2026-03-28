import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { EMAIL_COLORS } from "@/config/theme";
import { getBaseUrl } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { sendPlanNotification } from "@/lib/notifications";
import { NotificationEventType, PageCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  const page = await prisma.page.findUnique({
    where: { handle },
    include: {
      user: true,
      blocks: { orderBy: { order: "asc" } },
    },
  });
  if (!page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (page.category === PageCategory.PROJECT_PORTAL) {
    const { userId } = await auth();
    const isOwner = !!userId && userId === page.userId;
    const c = await cookies();
    const cookieVal = c.get(`portal_access_${page.id}`)?.value || "";
    const hasClientCookie = !!cookieVal && (cookieVal === page.clientAccessTokenHash || cookieVal === page.clientPinHash);
    if (!isOwner && !hasClientCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = await request.json();
  const { taskId, stageId, action } = body;

  if (!taskId || !stageId || action !== "approve") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const timelineBlock = page.blocks.find((b) => b.type === "TIMELINE");
  if (!timelineBlock) {
    return NextResponse.json({ error: "No timeline" }, { status: 404 });
  }

  const content = timelineBlock.content as Record<string, unknown>;
  const milestones = (content.milestones || []) as Array<{
    id: string;
    tasks: Array<{ id: string; status: string; title?: string }>;
  }>;

  let found = false;
  for (const milestone of milestones) {
    if (milestone.id !== stageId) continue;
    for (const task of milestone.tasks || []) {
      if (task.id !== taskId) continue;
      task.status = "done";
      found = true;
      break;
    }
    if (found) break;
  }

  if (!found) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  await prisma.block.update({
    where: { id: timelineBlock.id },
    data: { content: { ...content, milestones } as never },
  });

  if (page.user?.email) {
    const task = milestones.flatMap((m) => m.tasks).find((t) => t.id === taskId);
    const base = getBaseUrl();
    await sendPlanNotification({
      userId: page.userId,
      pageId: page.id,
      type: NotificationEventType.PROJECT_PORTAL_APPROVAL,
      to: page.user.email,
      subject: `Task Approved: ${task?.title || "Project Update"}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: ${EMAIL_COLORS.primary};">Great news!</h2>
          <p>The client has approved your task: <strong>${task?.title}</strong> on the project <strong>${page.title}</strong>.</p>
          <p>Visit your <a href="${base}/dashboard" style="color: ${EMAIL_COLORS.primary}; text-decoration: underline;">dashboard</a> to view the next steps.</p>
        </div>
      `,
    });
  }

  return NextResponse.json({ success: true });
}
