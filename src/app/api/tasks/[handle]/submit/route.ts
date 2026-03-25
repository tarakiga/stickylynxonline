import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/utils";

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

  const timelineBlock = page.blocks.find((b) => b.type === "TIMELINE");
  if (!timelineBlock) return NextResponse.json({ error: "No timeline" }, { status: 404 });

  const content = timelineBlock.content as Record<string, any>;
  const milestones = (content.milestones || []) as any[];

  let taskToNotify: any = null;
  for (const m of milestones) {
    if (m.id !== stageId) continue;
    for (const t of m.tasks || []) {
      if (t.id === taskId) {
        t.status = "review";
        t.submission = submission;
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
    await sendEmail({
      to: page.clientEmail,
      subject: `Draft Ready for Review: ${taskToNotify.title}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #7c3aed;">Hello from ${page.title}!</h2>
          <p>The latest updates for <strong>${taskToNotify.title}</strong> are ready for your review.</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
             <p><strong>Submission Type:</strong> ${submission.type}</p>
             <p><strong>Message:</strong> Check the project portal for details.</p>
          </div>
          <p><a href="${getBaseUrl()}/${page.handle}" style="background: #7c3aed; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Launch Project Portal</a></p>
        </div>
      `
    });
  }

  return NextResponse.json({ success: true });
}
