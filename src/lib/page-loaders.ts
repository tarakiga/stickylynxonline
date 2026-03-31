import prisma from "@/lib/prisma"

type PageRecord = {
  id: string
  userId: string
  handle: string
  title: string | null
  description: string | null
  isPublic: boolean
  category: string
  theme: unknown
  clientEmail: string | null
  clientName: string | null
  clientAccessTokenHash: string | null
  clientAccessCreatedAt: Date | null
  clientAccessRevoked: boolean
  clientAccessExpiresAt: Date | null
  clientPinHash: string | null
  clientPinEnabled: boolean
  lastClientAccessAt: Date | null
  clientPinCreatedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

type BlockRecord = {
  id: string
  pageId: string
  type: string
  content: unknown
  order: number
  createdAt: Date
  updatedAt: Date
}

type UserRecord = {
  id: string
  name: string | null
  email: string
  brandProfile: unknown
  currencyCode: string
}

function isUnknownPageCategoryError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false
  }

  const code = "code" in error ? error.code : undefined
  const message = "message" in error ? error.message : undefined

  return code === "P2023" && typeof message === "string" && message.includes("PageCategory")
}

async function getBlocksByPageId(pageId: string) {
  return prisma.$queryRaw<BlockRecord[]>`
    SELECT
      "id",
      "pageId",
      "type"::text AS "type",
      "content",
      "order",
      "createdAt",
      "updatedAt"
    FROM "Block"
    WHERE "pageId" = ${pageId}
    ORDER BY "order" ASC
  `
}

export async function getPageWithBlocksById(id: string) {
  try {
    return await prisma.page.findUnique({
      where: { id },
      include: { blocks: { orderBy: { order: "asc" } } },
    })
  } catch (error) {
    if (!isUnknownPageCategoryError(error)) {
      throw error
    }

    const pages = await prisma.$queryRaw<PageRecord[]>`
      SELECT
        "id",
        "userId",
        "handle",
        "title",
        "description",
        "isPublic",
        "category"::text AS "category",
        "theme",
        "clientEmail",
        "clientName",
        "clientAccessTokenHash",
        "clientAccessCreatedAt",
        "clientAccessRevoked",
        "clientAccessExpiresAt",
        "clientPinHash",
        "clientPinEnabled",
        "lastClientAccessAt",
        "clientPinCreatedAt",
        "createdAt",
        "updatedAt"
      FROM "Page"
      WHERE "id" = ${id}
      LIMIT 1
    `

    const page = pages[0]
    if (!page) {
      return null
    }

    const blocks = await getBlocksByPageId(page.id)
    return { ...page, blocks }
  }
}

export async function getPageWithBlocksAndUserByHandle(handle: string) {
  try {
    return await prisma.page.findUnique({
      where: { handle },
      include: { user: true, blocks: { orderBy: { order: "asc" } } },
    })
  } catch (error) {
    if (!isUnknownPageCategoryError(error)) {
      throw error
    }

    const pages = await prisma.$queryRaw<PageRecord[]>`
      SELECT
        "id",
        "userId",
        "handle",
        "title",
        "description",
        "isPublic",
        "category"::text AS "category",
        "theme",
        "clientEmail",
        "clientName",
        "clientAccessTokenHash",
        "clientAccessCreatedAt",
        "clientAccessRevoked",
        "clientAccessExpiresAt",
        "clientPinHash",
        "clientPinEnabled",
        "lastClientAccessAt",
        "clientPinCreatedAt",
        "createdAt",
        "updatedAt"
      FROM "Page"
      WHERE "handle" = ${handle}
      LIMIT 1
    `

    const page = pages[0]
    if (!page) {
      return null
    }

    const [blocks, users] = await Promise.all([
      getBlocksByPageId(page.id),
      prisma.$queryRaw<UserRecord[]>`
        SELECT
          "id",
          "name",
          "email",
          "brandProfile",
          "currencyCode"
        FROM "User"
        WHERE "id" = ${page.userId}
        LIMIT 1
      `,
    ])

    return {
      ...page,
      blocks,
      user: users[0] || null,
    }
  }
}
