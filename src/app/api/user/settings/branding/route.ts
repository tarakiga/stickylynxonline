import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { getFeatureAccessError, getUserPlanSnapshot } from "@/lib/subscription"
import { normalizeBrandProfile } from "@/lib/branding"
import { normalizeDataUrlsToCloudinary } from "@/lib/cloudinary"
import { getUserBrandingById, hasUserBrandProfileColumn } from "@/lib/user-branding"

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
  const user = await getUserBrandingById(userId)

  const profile = await normalizeDataUrlsToCloudinary(
    normalizeBrandProfile(body.brandProfile, user?.name || user?.email || ""),
    {
      userId,
      scope: "branding",
    }
  )

  if (!(await hasUserBrandProfileColumn())) {
    return NextResponse.json({ error: "Brand profile storage is not available until the latest database migration is applied" }, { status: 409 })
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      brandProfile: profile,
    } as Prisma.UserUpdateInput,
  })

  return NextResponse.json({ success: true, brandProfile: profile })
}
