export type UploadAssetKind = "image" | "document" | "audio"

type UploadConstraint = {
  maxBytes: number
  mimeTypes: string[]
}

export const UPLOAD_CONSTRAINTS: Record<UploadAssetKind, UploadConstraint> = {
  image: {
    maxBytes: 10 * 1024 * 1024,
    mimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ],
  },
  document: {
    maxBytes: 10 * 1024 * 1024,
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/rtf",
      "text/plain",
    ],
  },
  audio: {
    maxBytes: 20 * 1024 * 1024,
    mimeTypes: [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/mp4",
      "audio/x-m4a",
      "audio/aac",
      "audio/ogg",
      "audio/flac",
    ],
  },
}

export function formatMaxUploadSize(kind: UploadAssetKind) {
  const sizeInMb = UPLOAD_CONSTRAINTS[kind].maxBytes / (1024 * 1024)
  return `${sizeInMb}MB`
}

export function inferUploadAssetKind(mimeType: string): UploadAssetKind | null {
  for (const [kind, config] of Object.entries(UPLOAD_CONSTRAINTS) as Array<[UploadAssetKind, UploadConstraint]>) {
    if (config.mimeTypes.includes(mimeType)) {
      return kind
    }
  }

  return null
}

export function isSupportedUploadMimeType(kind: UploadAssetKind, mimeType: string) {
  return UPLOAD_CONSTRAINTS[kind].mimeTypes.includes(mimeType)
}

export function validateUploadFile(kind: UploadAssetKind, mimeType: string, size: number) {
  if (!isSupportedUploadMimeType(kind, mimeType)) {
    throw new Error(`Unsupported ${kind} file type: ${mimeType || "unknown"}`)
  }

  if (size > UPLOAD_CONSTRAINTS[kind].maxBytes) {
    throw new Error(`${capitalize(kind)} exceeds the ${formatMaxUploadSize(kind)} limit`)
  }
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
