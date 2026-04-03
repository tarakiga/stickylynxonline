import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { PageCategory, TeamProjectMemberStatus } from "@prisma/client"
import type { TeamProjectMemberRole } from "@prisma/client"

type InputMember = {
  id?: string
  pageId?: string
  name?: string
  email?: string
  internalLabel?: string | null
  status?: string
  role?: string
}

type NormalizedMemberInput = {
  id: string
  name: string
  email: string
  internalLabel: string | null
  status: TeamProjectMemberStatus
  role: TeamProjectMemberRole
}

export const dynamic = "force-dynamic"

function normalizeStatus(value: string | undefined): TeamProjectMemberStatus {
  if (value === "SUSPENDED") return TeamProjectMemberStatus.SUSPENDED
  if (value === "REMOVED") return TeamProjectMemberStatus.REMOVED
  return TeamProjectMemberStatus.ACTIVE
}

function normalizeRole(value: string | undefined): TeamProjectMemberRole {
  if (value === "ADMIN") return "ADMIN"
  return "CONTRIBUTOR"
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ field: "auth", message: "Unauthorized" }, { status: 401 })
  }

  const page = await prisma.page.findUnique({
    where: { handle },
    include: { teamProjectMembers: { orderBy: [{ createdAt: "asc" }] } },
  })

  if (!page || page.userId !== userId) {
    return NextResponse.json({ field: "page", message: "Not found" }, { status: 404 })
  }

  if (page.category !== PageCategory.TEAM_PROJECT_HUB) {
    return NextResponse.json({ field: "category", message: "Not applicable" }, { status: 400 })
  }

  return NextResponse.json({ items: page.teamProjectMembers })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ field: "auth", message: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const items = Array.isArray(body?.items) ? (body.items as InputMember[]) : null
  const pageId = typeof body?.pageId === "string" ? body.pageId : ""

  const page =
    await prisma.page.findUnique({
      where: { handle },
      include: { teamProjectMembers: true },
    }) ||
    (pageId
      ? await prisma.page.findUnique({
          where: { id: pageId },
          include: { teamProjectMembers: true },
        })
      : null)

  if (!page) {
    return NextResponse.json({ field: "page", message: "Not found" }, { status: 404 })
  }

  if (page.userId !== userId) {
    return NextResponse.json({ field: "page", message: "Forbidden" }, { status: 403 })
  }

  if (page.category !== PageCategory.TEAM_PROJECT_HUB) {
    return NextResponse.json({ field: "category", message: "Not applicable" }, { status: 400 })
  }

  if (!items) {
    return NextResponse.json({ field: "items", message: "Invalid payload" }, { status: 400 })
  }

  const normalized: NormalizedMemberInput[] = items
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : "",
      name: String(item.name || "").trim(),
      email: String(item.email || "").trim().toLowerCase(),
      internalLabel: typeof item.internalLabel === "string" ? item.internalLabel.trim() : null,
      status: normalizeStatus(typeof item.status === "string" ? item.status : undefined),
      role: normalizeRole(typeof item.role === "string" ? item.role : undefined),
    }))
    .filter((item) => item.name && item.email)

  const emails = normalized.map((item) => item.email)
  const users = emails.length
    ? await prisma.user.findMany({
        where: { email: { in: emails } },
        select: { id: true, email: true },
      })
    : []

  const userByEmail = new Map(users.map((entry: (typeof users)[number]) => [entry.email.toLowerCase(), entry.id] as const))
  const existingById = new Map(page.teamProjectMembers.map((entry: (typeof page.teamProjectMembers)[number]) => [entry.id, entry] as const))
  const existingByEmail = new Map(page.teamProjectMembers.map((entry: (typeof page.teamProjectMembers)[number]) => [entry.email.toLowerCase(), entry] as const))

  const retainedIds = new Set<string>()
  const writes = normalized.map((item) => {
    const existing = (item.id && existingById.get(item.id)) || existingByEmail.get(item.email)

    if (existing) {
      retainedIds.add(existing.id)
      return prisma.teamProjectMember.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          email: item.email,
          internalLabel: item.internalLabel,
          status: item.status,
          role: item.role,
          userId: userByEmail.get(item.email) || existing.userId || null,
        },
      })
    }

    return prisma.teamProjectMember.create({
      data: {
        pageId: page.id,
        name: item.name,
        email: item.email,
        internalLabel: item.internalLabel,
        status: item.status,
        role: item.role,
        userId: userByEmail.get(item.email) || null,
      },
    })
  })

  for (const existing of page.teamProjectMembers) {
    if (retainedIds.has(existing.id)) continue

    writes.push(
      prisma.teamProjectMember.update({
        where: { id: existing.id },
        data: { status: TeamProjectMemberStatus.REMOVED },
      })
    )
  }

  if (writes.length > 0) {
    await prisma.$transaction(writes)
  }

  const updatedMembers = await prisma.teamProjectMember.findMany({
    where: { pageId: page.id },
    orderBy: [{ createdAt: "asc" }],
  })

  return NextResponse.json({ success: true, items: updatedMembers })
}
