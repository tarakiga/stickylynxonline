export const BRAND_TYPOGRAPHY_PRESETS = ["CLASSIC", "EDITORIAL", "DISPLAY"] as const

export type BrandTypographyPreset = (typeof BRAND_TYPOGRAPHY_PRESETS)[number]

export type BrandProfile = {
  brandName: string
  tagline: string
  description: string
  logoImage: string
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  textPrimary: string
  textSecondary: string
  divider: string
  typographyPreset: BrandTypographyPreset
}

export const DEFAULT_BRAND_PROFILE: BrandProfile = {
  brandName: "",
  tagline: "",
  description: "",
  logoImage: "",
  primary: "#6D28D9",
  secondary: "#10B981",
  accent: "#FF3366",
  background: "#F9FAFB",
  surface: "#FFFFFF",
  textPrimary: "#111827",
  textSecondary: "#4B5563",
  divider: "#E5E7EB",
  typographyPreset: "CLASSIC",
}

export const BRAND_THEME_PRESETS: ReadonlyArray<{
  id: string
  label: string
  description: string
  values: Partial<BrandProfile>
}> = [
  {
    id: "SIGNATURE",
    label: "Signature",
    description: "Matches the core Stickylynx design system tokens.",
    values: {},
  },
  {
    id: "EMERALD",
    label: "Emerald",
    description: "Fresh and vibrant with a refined editorial feel.",
    values: {
      primary: "#0F766E",
      secondary: "#10B981",
      accent: "#F97316",
      background: "#F5FFFC",
      surface: "#FFFFFF",
      textPrimary: "#0F172A",
      textSecondary: "#475569",
      divider: "#CCFBF1",
    },
  },
  {
    id: "MIDNIGHT",
    label: "Midnight",
    description: "High-contrast dark luxury palette for bold brands.",
    values: {
      primary: "#7C3AED",
      secondary: "#38BDF8",
      accent: "#F43F5E",
      background: "#0F172A",
      surface: "#111827",
      textPrimary: "#F8FAFC",
      textSecondary: "#CBD5E1",
      divider: "#334155",
    },
  },
]

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback
}

function normalizeHexColor(value: unknown, fallback: string) {
  const raw = asString(value).trim()
  if (!raw) return fallback

  const normalized = raw.startsWith("#") ? raw : `#${raw}`
  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
    return normalized.toUpperCase()
  }

  return fallback
}

function normalizeTypographyPreset(value: unknown): BrandTypographyPreset {
  if (value === "EDITORIAL" || value === "DISPLAY" || value === "CLASSIC") {
    return value
  }

  return DEFAULT_BRAND_PROFILE.typographyPreset
}

function parseHex(color: string) {
  const normalized = normalizeHexColor(color, "#000000").slice(1)
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  }
}

function channelToHex(value: number) {
  return Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0").toUpperCase()
}

function mix(color: string, target: string, amount: number) {
  const sourceRgb = parseHex(color)
  const targetRgb = parseHex(target)

  return `#${channelToHex(sourceRgb.r + (targetRgb.r - sourceRgb.r) * amount)}${channelToHex(sourceRgb.g + (targetRgb.g - sourceRgb.g) * amount)}${channelToHex(sourceRgb.b + (targetRgb.b - sourceRgb.b) * amount)}`
}

export function normalizeBrandProfile(value: unknown, fallbackBrandName = ""): BrandProfile {
  const record = asRecord(value) || {}

  return {
    brandName: asString(record.brandName, fallbackBrandName),
    tagline: asString(record.tagline),
    description: asString(record.description),
    logoImage: asString(record.logoImage),
    primary: normalizeHexColor(record.primary, DEFAULT_BRAND_PROFILE.primary),
    secondary: normalizeHexColor(record.secondary, DEFAULT_BRAND_PROFILE.secondary),
    accent: normalizeHexColor(record.accent, DEFAULT_BRAND_PROFILE.accent),
    background: normalizeHexColor(record.background, DEFAULT_BRAND_PROFILE.background),
    surface: normalizeHexColor(record.surface, DEFAULT_BRAND_PROFILE.surface),
    textPrimary: normalizeHexColor(record.textPrimary, DEFAULT_BRAND_PROFILE.textPrimary),
    textSecondary: normalizeHexColor(record.textSecondary, DEFAULT_BRAND_PROFILE.textSecondary),
    divider: normalizeHexColor(record.divider, DEFAULT_BRAND_PROFILE.divider),
    typographyPreset: normalizeTypographyPreset(record.typographyPreset),
  }
}

export function getBrandCssVariables(profile: BrandProfile) {
  return {
    "--color-primary": profile.primary,
    "--color-primary-hover": mix(profile.primary, "#000000", 0.12),
    "--color-primary-light": mix(profile.primary, "#FFFFFF", 0.88),
    "--color-secondary": profile.secondary,
    "--color-accent": profile.accent,
    "--color-background": profile.background,
    "--color-surface": profile.surface,
    "--color-text-primary": profile.textPrimary,
    "--color-text-secondary": profile.textSecondary,
    "--color-divider": profile.divider,
    "--color-on-primary": mix(profile.primary, "#FFFFFF", 0.92),
  } as Record<string, string>
}

export function getTypographyPreviewClasses(preset: BrandTypographyPreset) {
  if (preset === "EDITORIAL") {
    return {
      heading: "tracking-tight font-extrabold",
      body: "leading-relaxed",
      badge: "tracking-[0.18em] uppercase",
    }
  }

  if (preset === "DISPLAY") {
    return {
      heading: "tracking-[-0.03em] font-black uppercase",
      body: "leading-relaxed",
      badge: "tracking-[0.22em] uppercase",
    }
  }

  return {
    heading: "tracking-tight font-bold",
    body: "leading-relaxed",
    badge: "tracking-[0.18em] uppercase",
  }
}
