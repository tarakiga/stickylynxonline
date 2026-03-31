import type { UploadAssetKind } from "@/lib/upload-config"

type UploadAssetResponse = {
  secureUrl: string
  publicId: string
  resourceType: string
  bytes: number
  format?: string
  originalFilename?: string
}

export async function uploadAssetFile(
  file: File,
  options: {
    kind: UploadAssetKind
    pageId?: string
  }
): Promise<UploadAssetResponse> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("kind", options.kind)

  if (options.pageId) {
    formData.append("pageId", options.pageId)
  }

  const response = await fetch("/api/uploads", {
    method: "POST",
    body: formData,
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.error || "Upload failed")
  }

  return payload
}
