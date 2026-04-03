import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { EMAIL_COLORS } from "@/config/theme";
import { getBaseUrl } from "@/lib/utils";
import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { sendPlanNotification } from "@/lib/notifications";
import { NotificationEventType, PageCategory } from "@prisma/client";
import { canCommentOnTeamHubTask, canManageTeamHubStage, getTeamHubStageById, getTeamHubTaskById, resolveTeamHubViewer } from "@/lib/team-project-hub-access";
import { getTeamProjectHubSections } from "@/lib/team-project-hub";

export const dynamic = "force-dynamic";

type CommentRequestBody = {
  taskId?: string
  stageId?: string
  text?: string
  author?: string
  requestChanges?: boolean
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const authState = await auth();
  const authProfile = await currentUser();
  const email = authProfile?.emailAddresses[0]?.emailAddress || null;

  const page = await prisma.page.findUnique({
    where: { handle },
    include: { user: true, blocks: { orderBy: { order: "asc" } }, teamProjectMembers: true },
  });
  if (!page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (page.category === PageCategory.PROJECT_PORTAL) {
    const { userId } = authState;
    const isOwner = !!userId && userId === page.userId;
    const c = await cookies();
    const cookieVal = c.get(`portal_access_${page.id}`)?.value || "";
    const hasClientCookie = !!cookieVal && (cookieVal === page.clientAccessTokenHash || cookieVal === page.clientPinHash);
    if (!isOwner && !hasClientCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = (await request.json()) as CommentRequestBody;
  const { taskId, stageId, text, author, requestChanges } = body;

  if (!taskId || !stageId || !text?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const timelineBlock = page.blocks.find((b: (typeof page.blocks)[number]) => b.type === "TIMELINE");
  if (!timelineBlock) {
    return NextResponse.json({ error: "No timeline" }, { status: 404 });
  }

  if (page.category === PageCategory.TEAM_PROJECT_HUB) {
    const viewer = await resolveTeamHubViewer({
      page,
      userId: authState.userId,
      email,
    });
    const stage = getTeamHubStageById(page, stageId);
    const task = getTeamHubTaskById(stage, taskId);

    if (!stage || !task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (!viewer.canAccess || !canCommentOnTeamHubTask({ viewer, stage, task })) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const managerAction = canManageTeamHubStage({ viewer, stage });
    if (requestChanges && !managerAction) {
      return NextResponse.json({ error: "Only the stage manager can request changes" }, { status: 403 });
    }

    const comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      taskId,
      authorUserId: authState.userId,
      authorName: viewer.isOwner
        ? page.user?.name || page.user?.email || "Creator"
        : viewer.member?.name || viewer.member?.email || "Team Member",
      authorRole: viewer.isOwner ? "creator" : managerAction ? "stage_manager" : task.assigneeMemberId === viewer.member?.id ? "assignee" : "member",
      body: text.trim().substring(0, 2000),
      createdAt: new Date().toISOString(),
      isCorrectionRequest: Boolean(requestChanges),
    };

    const sections = getTeamProjectHubSections(page.blocks || []);
    const stages = sections.timeline.stages.map((entry) =>
      entry.id === stageId
        ? {
            ...entry,
            tasks: entry.tasks.map((candidate) =>
              candidate.id === taskId
                ? {
                    ...candidate,
                    status: requestChanges ? "changes_requested" : candidate.status,
                    changesRequestedAt: requestChanges ? new Date().toISOString() : candidate.changesRequestedAt,
                    comments: [...candidate.comments, comment],
                  }
                : candidate
            ),
          }
        : entry
    );

    await prisma.block.update({
      where: { id: timelineBlock.id },
      data: {
        content: {
          section: "team_project_timeline",
          currentStep: sections.timeline.currentStep,
          stages,
        } as never,
      },
    });

    if (managerAction) {
      const assigneeEmail =
        page.teamProjectMembers.find((entry: (typeof page.teamProjectMembers)[number]) => entry.id === task.assigneeMemberId)?.email ||
        task.assigneeEmail ||
        null;

      if (assigneeEmail) {
        await sendPlanNotification({
          userId: page.userId,
          pageId: page.id,
          type: requestChanges ? NotificationEventType.TEAM_PROJECT_HUB_CHANGES_REQUESTED : NotificationEventType.TEAM_PROJECT_HUB_COMMENT,
          to: assigneeEmail,
          subject: requestChanges ? `Changes requested: ${task.title}` : `New task comment: ${task.title}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2 style="color: ${EMAIL_COLORS.primary};">${requestChanges ? "Changes Requested" : "New Task Comment"}</h2>
              <p>${comment.authorName} left feedback on <strong>${task.title}</strong> in <strong>${stage.label}</strong>.</p>
              <div style="background: ${EMAIL_COLORS.surfaceMuted}; padding: 15px; border-radius: 8px; margin: 15px 0;">
                ${comment.body}
              </div>
              <p><a href="${getBaseUrl()}/${page.handle}" style="color: ${EMAIL_COLORS.primary}; text-decoration: underline;">Open Team Project Hub</a></p>
            </div>
          `,
        });
      }
    }

    const updatedTask = stages
      .find((entry) => entry.id === stageId)
      ?.tasks.find((entry) => entry.id === taskId);

    return NextResponse.json({
      success: true,
      task: updatedTask,
    });
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
    await sendPlanNotification({
      userId: page.userId,
      pageId: page.id,
      type: NotificationEventType.PROJECT_PORTAL_COMMENT,
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
