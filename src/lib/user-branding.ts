import prisma from "@/lib/prisma"

type UserBrandingRecord = {
  name: string | null
  email: string | null
  brandProfile: unknown
}

let brandProfileColumnExists: boolean | null = null

export async function hasUserBrandProfileColumn() {
  if (brandProfileColumnExists !== null) {
    return brandProfileColumnExists
  }

  const rows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'User'
        AND column_name = 'brandProfile'
    ) AS "exists"
  `

  brandProfileColumnExists = Boolean(rows[0]?.exists)
  return brandProfileColumnExists
}

export async function getUserBrandingById(userId: string): Promise<UserBrandingRecord | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
    },
  })

  if (!user) {
    return null
  }

  if (!(await hasUserBrandProfileColumn())) {
    return {
      ...user,
      brandProfile: null,
    }
  }

  const rows = await prisma.$queryRaw<Array<{ brandProfile: unknown }>>`
    SELECT "brandProfile"
    FROM "User"
    WHERE "id" = ${userId}
    LIMIT 1
  `

  return {
    ...user,
    brandProfile: rows[0]?.brandProfile ?? null,
  }
}
