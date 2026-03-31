"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, Palette, Sparkles, Type } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Dropzone } from "@/components/ui/Dropzone"
import { Toaster, showToast } from "@/components/ui/Toast"
import { uploadAssetFile } from "@/lib/upload-client"
import {
  BRAND_THEME_PRESETS,
  BRAND_TYPOGRAPHY_PRESETS,
  DEFAULT_BRAND_PROFILE,
  BrandProfile,
  BrandTypographyPreset,
  getBrandCssVariables,
  getTypographyPreviewClasses,
} from "@/lib/branding"

type BrandingWorkspaceProps = {
  initialProfile: BrandProfile
  planLabel: string
  canUseCustomBranding: boolean
}

function ColorField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: string
  onChange: (next: string) => void
  disabled: boolean
}) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-semibold text-text-secondary">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border border-divider bg-background px-3 py-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          disabled={disabled}
          className="h-10 w-10 cursor-pointer rounded-xl border-none bg-transparent p-0 disabled:cursor-not-allowed"
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="border-none bg-transparent shadow-none"
          disabled={disabled}
        />
      </div>
    </div>
  )
}

function TypographyOption({
  label,
  description,
  active,
  onClick,
  disabled,
}: {
  label: string
  description: string
  active: boolean
  onClick: () => void
  disabled: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border px-4 py-4 text-left transition-all ${
        active
          ? "border-primary bg-primary/5 text-text-primary shadow-sm"
          : "border-divider bg-background text-text-secondary hover:border-primary/30"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-bold text-sm">{label}</span>
        {active ? <Badge variant="primary">Active</Badge> : null}
      </div>
      <p className="mt-2 text-xs leading-relaxed">{description}</p>
    </button>
  )
}

export function BrandingWorkspace({
  initialProfile,
  planLabel,
  canUseCustomBranding,
}: BrandingWorkspaceProps) {
  const router = useRouter()
  const [profile, setProfile] = React.useState<BrandProfile>(initialProfile)
  const [saving, setSaving] = React.useState(false)
  const [dirty, setDirty] = React.useState(false)
  const typographyPreview = getTypographyPreviewClasses(profile.typographyPreset)
  const previewStyle = getBrandCssVariables(profile)

  const getResolvedPresetValues = React.useCallback((preset: (typeof BRAND_THEME_PRESETS)[number]) => {
    return Object.keys(preset.values).length > 0
      ? preset.values
      : {
          primary: DEFAULT_BRAND_PROFILE.primary,
          secondary: DEFAULT_BRAND_PROFILE.secondary,
          accent: DEFAULT_BRAND_PROFILE.accent,
          background: DEFAULT_BRAND_PROFILE.background,
          surface: DEFAULT_BRAND_PROFILE.surface,
          textPrimary: DEFAULT_BRAND_PROFILE.textPrimary,
          textSecondary: DEFAULT_BRAND_PROFILE.textSecondary,
          divider: DEFAULT_BRAND_PROFILE.divider,
        }
  }, [])

  const activeThemePresetId = React.useMemo(() => {
    return (
      BRAND_THEME_PRESETS.find((preset) => {
        const values = getResolvedPresetValues(preset)

        return Object.entries(values).every(([key, value]) => {
          return profile[key as keyof BrandProfile] === value
        })
      })?.id || null
    )
  }, [getResolvedPresetValues, profile])

  function update<K extends keyof BrandProfile>(key: K, value: BrandProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }))
    setDirty(true)
  }

  const applyBrandVariablesToDocument = React.useCallback((nextProfile: BrandProfile) => {
    if (typeof document === "undefined") {
      return
    }

    const cssVariables = getBrandCssVariables(nextProfile)
    for (const [key, value] of Object.entries(cssVariables)) {
      document.documentElement.style.setProperty(key, value)
    }
  }, [])

  async function handleSave() {
    if (!canUseCustomBranding) {
      showToast("Custom Branding is available on Creator. Payments are not live yet, so higher tiers are still locked.", "warning")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/user/settings/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandProfile: profile }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        showToast(payload.error || "Failed to save branding", "error")
        return
      }

      const nextProfile = payload.brandProfile || profile
      setProfile(nextProfile)
      setDirty(false)
      applyBrandVariablesToDocument(nextProfile)
      router.refresh()
      showToast("Branding saved successfully", "success")
    } catch {
      showToast("Failed to save branding", "error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <Toaster />

      <Card className="bg-surface rounded-3xl overflow-hidden shadow-sm border border-divider p-0">
        <div className="p-6 md:p-8 border-b border-divider bg-background/50 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Brand System</h2>
            <p className="text-sm text-text-secondary mt-1">
              Manage reusable brand tokens defined by the design system: identity, color palette, typography, and preview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={canUseCustomBranding ? "success" : "info"}>{canUseCustomBranding ? `${planLabel} Enabled` : "Creator Required"}</Badge>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!dirty || saving || !canUseCustomBranding}
              className="px-8 py-3 rounded-xl shadow-sm cursor-pointer"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : "Save Branding"}
            </Button>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {!canUseCustomBranding ? (
            <div className="rounded-2xl border border-warning/20 bg-warning/5 px-5 py-4 text-sm text-text-primary">
              Custom Branding is reserved for Creator and Studio. The controls below follow the design system, but saving remains locked on Starter.
            </div>
          ) : null}

          <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-8">
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">Identity</h3>
                    <p className="text-sm text-text-secondary">Define the name, message, and core visual asset that represent your brand.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    labelInside="Brand Name"
                    value={profile.brandName}
                    onChange={(event) => update("brandName", event.target.value)}
                    disabled={!canUseCustomBranding}
                  />
                  <Input
                    labelInside="Tagline"
                    value={profile.tagline}
                    onChange={(event) => update("tagline", event.target.value)}
                    disabled={!canUseCustomBranding}
                  />
                </div>

                <Textarea
                  rows={4}
                  placeholder="Describe your brand voice, positioning, or promise."
                  value={profile.description}
                  onChange={(event) => update("description", event.target.value)}
                  disabled={!canUseCustomBranding}
                />

                <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-4">
                  <div>
                    <Dropzone
                      label="Brand Logo"
                      hint={canUseCustomBranding ? "PNG or JPG up to 10MB" : "Creator plan required to upload logos"}
                      accept="image/*"
                      disabled={!canUseCustomBranding}
                      onChange={async (file) => {
                        const uploaded = await uploadAssetFile(file, { kind: "image" })
                        update("logoImage", uploaded.secureUrl)
                      }}
                    />
                  </div>
                  <div className="rounded-3xl border border-divider bg-background p-4 flex items-center justify-center min-h-[180px]">
                    {profile.logoImage ? (
                      <img src={profile.logoImage} alt="Brand logo preview" className="max-h-28 max-w-full object-contain" />
                    ) : (
                      <div className="text-center text-text-secondary">
                        <p className="text-sm font-semibold">Logo Preview</p>
                        <p className="text-xs mt-1">Upload a brand mark to reuse across pages.</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Palette size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">Color Tokens</h3>
                    <p className="text-sm text-text-secondary">Stay aligned with the design system by editing named tokens instead of one-off page colors.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={activeThemePresetId ? "primary" : "neutral"}>
                    {activeThemePresetId ? `${BRAND_THEME_PRESETS.find((preset) => preset.id === activeThemePresetId)?.label} Active` : "Custom Mix Active"}
                  </Badge>
                  <p className="text-xs text-text-secondary">The active preset indicator updates when your current token values match a saved token set.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {BRAND_THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      disabled={!canUseCustomBranding}
                      onClick={() => {
                        const next = { ...profile, ...getResolvedPresetValues(preset) }
                        setProfile(next)
                        setDirty(true)
                      }}
                      className={`rounded-2xl border bg-background px-4 py-4 text-left transition-all disabled:cursor-not-allowed ${
                        activeThemePresetId === preset.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-divider hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold text-sm text-text-primary">{preset.label}</span>
                        <div className="flex items-center gap-2">
                          {activeThemePresetId === preset.id ? <Badge variant="primary">Active</Badge> : null}
                          <span className="flex gap-1">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: getResolvedPresetValues(preset).primary || profile.primary }} />
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: getResolvedPresetValues(preset).secondary || profile.secondary }} />
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: getResolvedPresetValues(preset).accent || profile.accent }} />
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary mt-2">{preset.description}</p>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorField label="Primary" value={profile.primary} onChange={(value) => update("primary", value)} disabled={!canUseCustomBranding} />
                  <ColorField label="Secondary" value={profile.secondary} onChange={(value) => update("secondary", value)} disabled={!canUseCustomBranding} />
                  <ColorField label="Accent" value={profile.accent} onChange={(value) => update("accent", value)} disabled={!canUseCustomBranding} />
                  <ColorField label="Background" value={profile.background} onChange={(value) => update("background", value)} disabled={!canUseCustomBranding} />
                  <ColorField label="Surface" value={profile.surface} onChange={(value) => update("surface", value)} disabled={!canUseCustomBranding} />
                  <ColorField label="Divider" value={profile.divider} onChange={(value) => update("divider", value)} disabled={!canUseCustomBranding} />
                  <ColorField label="Text Primary" value={profile.textPrimary} onChange={(value) => update("textPrimary", value)} disabled={!canUseCustomBranding} />
                  <ColorField label="Text Secondary" value={profile.textSecondary} onChange={(value) => update("textSecondary", value)} disabled={!canUseCustomBranding} />
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Type size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">Typography</h3>
                    <p className="text-sm text-text-secondary">Use approved presentation styles while staying on the Asap type family defined by the system.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {BRAND_TYPOGRAPHY_PRESETS.map((preset) => (
                    <TypographyOption
                      key={preset}
                      label={preset === "CLASSIC" ? "Classic" : preset === "EDITORIAL" ? "Editorial" : "Display"}
                      description={
                        preset === "CLASSIC"
                          ? "Balanced hierarchy for utility-first business pages."
                          : preset === "EDITORIAL"
                          ? "Sharper emphasis and elegant spacing for premium storytelling."
                          : "Bold uppercase display treatment for attention-heavy brands."
                      }
                      active={profile.typographyPreset === preset}
                      onClick={() => update("typographyPreset", preset as BrandTypographyPreset)}
                      disabled={!canUseCustomBranding}
                    />
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <div className="sticky top-6">
                <div style={previewStyle as React.CSSProperties} className="rounded-[28px] border border-divider bg-background p-4">
                  <div className="rounded-[28px] border border-divider bg-surface shadow-premium overflow-hidden">
                    <div className="border-b border-divider px-6 py-5 bg-background/80">
                      <p className={`text-[11px] font-bold text-primary mb-2 ${typographyPreview.badge}`}>Brand Preview</p>
                      <div className="flex items-center gap-3">
                        {profile.logoImage ? (
                          <img src={profile.logoImage} alt="Brand preview logo" className="h-12 w-12 rounded-2xl object-cover border border-divider bg-surface" />
                        ) : (
                          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
                            {(profile.brandName || "S").slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className={`text-xl text-text-primary ${typographyPreview.heading}`}>
                            {profile.brandName || "Your Brand"}
                          </h3>
                          <p className={`text-sm text-text-secondary ${typographyPreview.body}`}>
                            {profile.tagline || "A reusable identity system for every Lynx you publish."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="rounded-3xl bg-primary/8 border border-primary/15 p-5">
                        <p className={`text-xs font-bold text-primary mb-2 ${typographyPreview.badge}`}>Hero Callout</p>
                        <h4 className={`text-2xl text-text-primary ${typographyPreview.heading}`}>Bring every page under one cohesive brand.</h4>
                        <p className={`text-sm text-text-secondary mt-2 ${typographyPreview.body}`}>
                          {profile.description || "Use design-system tokens to keep your identity consistent across media kits, food menus, and project portals."}
                        </p>
                        <div className="flex items-center gap-3 mt-4">
                          <button type="button" className="btn-primary rounded-xl px-4 py-2 text-sm font-bold">
                            Primary Action
                          </button>
                          <button type="button" className="rounded-xl border border-divider bg-surface px-4 py-2 text-sm font-bold text-text-primary">
                            Secondary
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-divider bg-background p-4">
                          <p className={`text-[11px] text-text-secondary mb-2 ${typographyPreview.badge}`}>Palette</p>
                          <div className="flex gap-2">
                            {[profile.primary, profile.secondary, profile.accent, profile.surface].map((color) => (
                              <span key={color} className="h-9 flex-1 rounded-xl border border-divider" style={{ backgroundColor: color }} />
                            ))}
                          </div>
                        </div>
                        <div className="rounded-2xl border border-divider bg-background p-4">
                          <p className={`text-[11px] text-text-secondary mb-2 ${typographyPreview.badge}`}>Typography</p>
                          <p className={`text-lg text-text-primary ${typographyPreview.heading}`}>Aa</p>
                          <p className={`text-sm text-text-secondary mt-1 ${typographyPreview.body}`}>Asap system preset</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
