import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { uploadFileAssetToCloudinary } from "@/lib/cloudinary"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const pageId = String(formData.get("pageId") || "")
    const kind = String(formData.get("kind") || "")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (kind !== "image" && kind !== "document" && kind !== "audio") {
      return NextResponse.json({ error: "Invalid upload type" }, { status: 400 })
    }

    if (pageId) {
      const page = await prisma.page.findUnique({
        where: { id: pageId },
        select: { id: true, userId: true },
      })

      if (!page || page.userId !== userId) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 })
      }
    }

    const uploaded = await uploadFileAssetToCloudinary(file, kind, {
      userId,
      pageId: pageId || undefined,
      scope: pageId ? "pages" : "account",
    })

    return NextResponse.json(uploaded)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
