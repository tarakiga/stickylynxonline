import crypto from "crypto"
import { inferUploadAssetKind, type UploadAssetKind, validateUploadFile } from "@/lib/upload-config"

type CloudinaryUploadContext = {
  userId?: string
  pageId?: string
  scope?: string
}

type CloudinaryUploadResult = {
  secureUrl: string
  publicId: string
  resourceType: string
  bytes: number
  format?: string
  originalFilename?: string
}

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME?.trim()
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY?.trim()
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET?.trim()
const CLOUDINARY_SIGNATURE_ALGORITHM = (process.env.CLOUDINARY_SIGNATURE_ALGORITHM || "sha256").trim().toLowerCase()

function ensureCloudinaryConfig() {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary environment variables are not configured")
  }
}

function sanitizeSegment(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "asset"
}

function getResourceType(kind: UploadAssetKind) {
  if (kind === "image") return "image"
  if (kind === "audio") return "video"
  return "raw"
}

function buildFolder({ userId, pageId, scope }: CloudinaryUploadContext, kind: UploadAssetKind) {
  const segments = ["stickylynx", sanitizeSegment(scope || "uploads"), sanitizeSegment(userId || "system")]

  if (pageId) {
    segments.push(sanitizeSegment(pageId))
  }

  segments.push(kind)
  return segments.join("/")
}

function buildPublicId(originalName?: string) {
  const extensionless = originalName ? originalName.replace(/\.[^.]+$/, "") : "asset"
  return `${Date.now()}-${crypto.randomUUID()}-${sanitizeSegment(extensionless)}`
}

function createSignature(params: Record<string, string | number | boolean>) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&")

  return crypto.createHash(CLOUDINARY_SIGNATURE_ALGORITHM).update(`${payload}${CLOUDINARY_API_SECRET}`).digest("hex")
}

async function uploadToCloudinary(
  fileValue: File | string,
  {
    kind,
    originalFilename,
    userId,
    pageId,
    scope,
  }: CloudinaryUploadContext & {
    kind: UploadAssetKind
    originalFilename?: string
  }
): Promise<CloudinaryUploadResult> {
  ensureCloudinaryConfig()

  const resourceType = getResourceType(kind)
  const folder = buildFolder({ userId, pageId, scope }, kind)
  const publicId = buildPublicId(originalFilename)
  const timestamp = Math.floor(Date.now() / 1000)

  const signedParams = {
    folder,
    public_id: publicId,
    timestamp,
  }

  const signature = createSignature(signedParams)
  const formData = new FormData()
  formData.append("file", fileValue)
  formData.append("api_key", CLOUDINARY_API_KEY as string)
  formData.append("timestamp", String(timestamp))
  formData.append("signature", signature)
  formData.append("folder", folder)
  formData.append("public_id", publicId)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
    method: "POST",
    body: formData,
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Cloudinary upload failed")
  }

  return {
    secureUrl: payload.secure_url,
    publicId: payload.public_id,
    resourceType: payload.resource_type,
    bytes: payload.bytes,
    format: payload.format,
    originalFilename: payload.original_filename,
  }
}

export async function uploadFileAssetToCloudinary(
  file: File,
  kind: UploadAssetKind,
  context: CloudinaryUploadContext = {}
) {
  validateUploadFile(kind, file.type, file.size)
  return uploadToCloudinary(file, {
    kind,
    originalFilename: file.name,
    ...context,
  })
}

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;,]+)(;base64)?,([\s\S]+)$/)
  if (!match) {
    throw new Error("Invalid data URL")
  }

  const mimeType = match[1]
  const isBase64 = Boolean(match[2])
  const data = match[3]
  const decoded = isBase64 ? Buffer.from(data, "base64") : Buffer.from(decodeURIComponent(data), "utf8")

  return {
    mimeType,
    size: decoded.length,
  }
}

export function isDataUrl(value: string) {
  return /^data:[^;,]+(?:;base64)?,/i.test(value)
}

export async function uploadDataUrlToCloudinary(
  dataUrl: string,
  context: CloudinaryUploadContext = {}
) {
  const { mimeType, size } = parseDataUrl(dataUrl)
  const kind = inferUploadAssetKind(mimeType)

  if (!kind) {
    throw new Error(`Unsupported upload type: ${mimeType}`)
  }

  validateUploadFile(kind, mimeType, size)

  return uploadToCloudinary(dataUrl, {
    kind,
    originalFilename: `${kind}-${Date.now()}`,
    ...context,
  })
}

export async function normalizeDataUrlsToCloudinary<T>(
  value: T,
  context: CloudinaryUploadContext = {}
): Promise<T> {
  const cache = new Map<string, string>()

  async function walk(input: unknown): Promise<unknown> {
    if (typeof input === "string") {
      if (!isDataUrl(input)) {
        return input
      }

      if (cache.has(input)) {
        return cache.get(input)
      }

      const uploaded = await uploadDataUrlToCloudinary(input, context)
      cache.set(input, uploaded.secureUrl)
      return uploaded.secureUrl
    }

    if (Array.isArray(input)) {
      return Promise.all(input.map((item) => walk(item)))
    }

    if (input && typeof input === "object") {
      const entries = await Promise.all(
        Object.entries(input).map(async ([key, nestedValue]) => [key, await walk(nestedValue)] as const)
      )

      return Object.fromEntries(entries)
    }

    return input
  }

  return (await walk(value)) as T
}
