import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { getFeatureAccessError, getUserPlanSnapshot } from "@/lib/subscription"
import { normalizeBrandProfile } from "@/lib/branding"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const snapshot = await getUserPlanSnapshot(userId)
  const featureError = getFeatureAccessError(snapshot, "CUSTOM_BRANDING")

  if (featureError) {
    return NextResponse.json({ error: featureError.message, code: featureError.code }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  })

  const profile = normalizeBrandProfile(body.brandProfile, user?.name || user?.email || "")

  await prisma.user.update({
    where: { id: userId },
    data: {
      brandProfile: profile,
    },
  })

  return NextResponse.json({ success: true, brandProfile: profile })
}
