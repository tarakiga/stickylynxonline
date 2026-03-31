const fs = require("fs")
const path = require("path")
const crypto = require("crypto")
const { PrismaClient } = require("@prisma/client")
const pg = require("pg")
const { PrismaPg } = require("@prisma/adapter-pg")

loadEnvFile(path.resolve(process.cwd(), ".env"))

const prisma = createPrismaClient()
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME?.trim()
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY?.trim()
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET?.trim()
const CLOUDINARY_SIGNATURE_ALGORITHM = (process.env.CLOUDINARY_SIGNATURE_ALGORITHM || "sha256").trim().toLowerCase()
const DRY_RUN = !process.argv.includes("--write")

function createPrismaClient() {
  const raw = process.env.DATABASE_URL
  if (!raw) {
    throw new Error("Missing DATABASE_URL for Prisma connection")
  }

  let connectionString = raw

  try {
    const parsed = new URL(raw)
    const host = (parsed.hostname || "").toLowerCase()
    const sslmode = (parsed.searchParams.get("sslmode") || "").toLowerCase()

    if (sslmode && /^(prefer|require|verify-ca)$/.test(sslmode)) {
      if (host && host !== "localhost" && host !== "127.0.0.1") {
        parsed.searchParams.set("sslmode", "verify-full")
        connectionString = parsed.toString()
      }
    }
  } catch {}

  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const uploadConstraints = {
  image: {
    maxBytes: 10 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
    resourceType: "image",
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
    resourceType: "raw",
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
    resourceType: "video",
  },
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, "utf8")
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue
    const separatorIndex = line.indexOf("=")
    if (separatorIndex === -1) continue
    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1")
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

function sanitizeSegment(value) {
  return String(value).trim().replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "asset"
}

function isDataUrl(value) {
  return typeof value === "string" && /^data:[^;,]+(?:;base64)?,/i.test(value)
}

function inferKind(mimeType) {
  for (const [kind, config] of Object.entries(uploadConstraints)) {
    if (config.mimeTypes.includes(mimeType)) {
      return kind
    }
  }
  return null
}

function parseDataUrl(dataUrl) {
  const match = dataUrl.match(/^data:([^;,]+)(;base64)?,([\s\S]+)$/)
  if (!match) throw new Error("Invalid data URL")
  const mimeType = match[1]
  const isBase64 = Boolean(match[2])
  const data = match[3]
  const buffer = isBase64 ? Buffer.from(data, "base64") : Buffer.from(decodeURIComponent(data), "utf8")
  return { mimeType, size: buffer.length }
}

function validate(kind, mimeType, size) {
  const config = uploadConstraints[kind]
  if (!config) throw new Error(`Unsupported upload kind for ${mimeType}`)
  if (!config.mimeTypes.includes(mimeType)) throw new Error(`Unsupported upload type: ${mimeType}`)
  if (size > config.maxBytes) throw new Error(`${kind} file exceeds size limit`)
}

function createSignature(params) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&")
  return crypto.createHash(CLOUDINARY_SIGNATURE_ALGORITHM).update(`${payload}${CLOUDINARY_API_SECRET}`).digest("hex")
}

async function uploadDataUrl(dataUrl, { userId, pageId, scope }) {
  const { mimeType, size } = parseDataUrl(dataUrl)
  const kind = inferKind(mimeType)
  validate(kind, mimeType, size)

  const folder = ["stickylynx", sanitizeSegment(scope || "migration"), sanitizeSegment(userId || "system")]
  if (pageId) folder.push(sanitizeSegment(pageId))
  folder.push(kind)

  const publicId = `${Date.now()}-${crypto.randomUUID()}`
  const resourceType = uploadConstraints[kind].resourceType
  const timestamp = Math.floor(Date.now() / 1000)
  const params = {
    folder: folder.join("/"),
    public_id: publicId,
    timestamp,
  }

  const signature = createSignature(params)
  const formData = new FormData()
  formData.append("file", dataUrl)
  formData.append("api_key", CLOUDINARY_API_KEY)
  formData.append("timestamp", String(timestamp))
  formData.append("signature", signature)
  formData.append("folder", params.folder)
  formData.append("public_id", publicId)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
    method: "POST",
    body: formData,
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Cloudinary upload failed")
  }

  return payload.secure_url
}

async function normalize(value, context, cache) {
  if (typeof value === "string") {
    if (!isDataUrl(value)) return { value, changed: false }
    if (cache.has(value)) return { value: cache.get(value), changed: true }
    if (DRY_RUN) {
      cache.set(value, value)
      return { value, changed: true }
    }
    const nextValue = await uploadDataUrl(value, context)
    cache.set(value, nextValue)
    return { value: nextValue, changed: true }
  }

  if (Array.isArray(value)) {
    let changed = false
    const nextValue = []
    for (const item of value) {
      const result = await normalize(item, context, cache)
      nextValue.push(result.value)
      changed = changed || result.changed
    }
    return { value: nextValue, changed }
  }

  if (value && typeof value === "object") {
    let changed = false
    const nextValue = {}
    for (const [key, nestedValue] of Object.entries(value)) {
      const result = await normalize(nestedValue, context, cache)
      nextValue[key] = result.value
      changed = changed || result.changed
    }
    return { value: nextValue, changed }
  }

  return { value, changed: false }
}

async function migrateUsers() {
  let cursor
  let updated = 0
  let scanned = 0

  while (true) {
    const users = await prisma.user.findMany({
      take: 50,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
      select: { id: true, brandProfile: true },
    })

    if (users.length === 0) break

    for (const user of users) {
      scanned += 1
      if (!user.brandProfile) continue
      const cache = new Map()
      const result = await normalize(user.brandProfile, { userId: user.id, scope: "branding-migration" }, cache)
      if (!result.changed) continue
      updated += 1
      if (!DRY_RUN) {
        await prisma.user.update({
          where: { id: user.id },
          data: { brandProfile: result.value },
        })
      }
    }

    cursor = users[users.length - 1].id
  }

  return { scanned, updated }
}

async function migrateBlocks() {
  let cursor
  let updated = 0
  let scanned = 0

  while (true) {
    const blocks = await prisma.block.findMany({
      take: 50,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
      select: { id: true, pageId: true, content: true, page: { select: { userId: true } } },
    })

    if (blocks.length === 0) break

    for (const block of blocks) {
      scanned += 1
      const cache = new Map()
      const result = await normalize(block.content, {
        userId: block.page.userId,
        pageId: block.pageId,
        scope: "block-migration",
      }, cache)

      if (!result.changed) continue
      updated += 1
      if (!DRY_RUN) {
        await prisma.block.update({
          where: { id: block.id },
          data: { content: result.value },
        })
      }
    }

    cursor = blocks[blocks.length - 1].id
  }

  return { scanned, updated }
}

async function main() {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary environment variables are not configured")
  }

  console.log(DRY_RUN ? "Running Cloudinary migration in dry-run mode" : "Running Cloudinary migration in write mode")

  const userSummary = await migrateUsers()
  const blockSummary = await migrateBlocks()

  console.log(JSON.stringify({ dryRun: DRY_RUN, users: userSummary, blocks: blockSummary }, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
