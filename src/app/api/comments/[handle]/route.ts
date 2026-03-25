import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { EMAIL_COLORS } from "@/config/theme";
import { getBaseUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  const page = await prisma.page.findUnique({
    where: { handle },
    include: { user: true, blocks: { orderBy: { order: "asc" } } },
  });
  if (!page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { taskId, stageId, text, author } = body;

  if (!taskId || !stageId || !text?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const timelineBlock = page.blocks.find((b) => b.type === "TIMELINE");
  if (!timelineBlock) {
    return NextResponse.json({ error: "No timeline" }, { status: 404 });
  }

  const content = timelineBlock.content as Record<string, unknown>;
  const milestones = (content.milestones || []) as Array<{
    id: string;
    tasks: Array<{
      id: string;
      comments: Array<{ id: string; taskId: string; author: string; text: string; timestamp: string }>;
    }>;
  }>;

  let found = false;
  for (const milestone of milestones) {
    if (milestone.id !== stageId) continue;
    for (const task of milestone.tasks || []) {
      if (task.id !== taskId) continue;
      if (!task.comments) task.comments = [];
      task.comments.push({
        id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        taskId,
        author: (author || "Client").trim().substring(0, 50),
        text: text.trim().substring(0, 2000),
        timestamp: new Date().toLocaleString(),
      });
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
    await sendEmail({
      to: page.user.email,
      subject: `New Feedback on ${page.title || "Project"}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: ${EMAIL_COLORS.primary};">New Client Feedback</h2>
          <p><strong>${author || "The Client"}</strong> left a comment on your project: <strong>${page.title}</strong>.</p>
          <div style="background: ${EMAIL_COLORS.surfaceMuted}; padding: 15px; border-radius: 8px; margin: 15px 0;">
            "${text}"
          </div>
          <p>Login to your <a href="${getBaseUrl()}/dashboard">dashboard</a> to reply.</p>
        </div>
      `,
    });
  }

  return NextResponse.json({ success: true });
}
