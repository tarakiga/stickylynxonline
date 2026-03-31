"use client"

import * as React from "react"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Dropzone } from "@/components/ui/Dropzone"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"
import { showToast } from "@/components/ui/Toast"
import { uploadAssetFile } from "@/lib/upload-client"
import {
  PROPERTY_FURNISHING_OPTIONS,
  PROPERTY_PERIOD_OPTIONS,
  PROPERTY_STATUS_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  createDefaultPropertyListingBlocks,
  getPropertyListingSections,
  isPropertyTypePreset,
  type PropertyDocumentItem,
} from "@/lib/property-listing"

const MAX_EDITOR_SAVE_BYTES = 45 * 1024 * 1024

function getDataSizeInBytes(value: string) {
  return new Blob([value]).size
}

function splitPillEntries(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizePillValues(values: string[]) {
  const seen = new Set<string>()

  return values
    .map((item) => item.trim())
    .filter((item) => {
      const key = item.toLowerCase()
      if (!item || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

function fileNameToLabel(fileName: string) {
  return fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim()
}

function inferDocumentType(fileName: string): PropertyDocumentItem["type"] {
  const normalized = fileName.toLowerCase()
  if (normalized.includes("floor")) return "floorplan"
  if (normalized.includes("brochure")) return "brochure"
  if (normalized.includes("spec")) return "spec_sheet"
  return "other"
}

function PillInput({
  label,
  hint,
  placeholder,
  values,
  onChange,
}: {
  label: string
  hint: string
  placeholder: string
  values: string[]
  onChange: (values: string[]) => void
}) {
  const [draft, setDraft] = React.useState("")

  const commitDraft = React.useCallback(() => {
    const nextItems = splitPillEntries(draft)
    if (nextItems.length === 0) {
      setDraft("")
      return
    }

    onChange(normalizePillValues([...values, ...nextItems]))
    setDraft("")
  }, [draft, onChange, values])

  const removeItem = React.useCallback(
    (item: string) => {
      onChange(values.filter((value) => value !== item))
    },
    [onChange, values]
  )

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <span className="text-sm font-semibold text-text-secondary">{label}</span>
        <p className="text-xs text-text-secondary">{hint}</p>
      </div>
      <div className="min-h-[3.5rem] rounded-2xl border border-divider bg-background px-3 py-3 shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-light">
        <div className="flex flex-wrap gap-2">
          {values.map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              {item}
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="inline-flex h-4 w-4 items-center justify-center rounded-full border-none p-0 text-primary transition-colors hover:text-error"
                aria-label={`Remove ${item}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitDraft}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault()
                commitDraft()
              }
            }}
            onPaste={(event) => {
              const pastedText = event.clipboardData.getData("text")
              if (!/[\n,]/.test(pastedText)) return
              event.preventDefault()
              onChange(normalizePillValues([...values, ...splitPillEntries(`${draft},${pastedText}`)]))
              setDraft("")
            }}
            placeholder={values.length === 0 ? placeholder : "Add another and press Enter"}
            className="min-w-[180px] flex-1 border-none bg-transparent px-1 py-1 text-sm text-text-primary outline-none placeholder:text-text-secondary/50"
          />
        </div>
      </div>
    </div>
  )
}

type PropertyListingEditorPage = {
  id: string
  title: string | null
  handle: string
  blocks: Array<{
    type: string
    content: unknown
  }>
}

export function PropertyListingEditor({ page, defaultCurrency }: { page: PropertyListingEditorPage; defaultCurrency: string }) {
  const router = useRouter()
  const normalizedBlocks = React.useMemo(
    () =>
      (page.blocks || []).map((block) => ({
        type: block.type,
        content: typeof block.content === "object" && block.content && !Array.isArray(block.content) ? (block.content as Record<string, unknown>) : {},
      })),
    [page.blocks]
  )
  const sections = React.useMemo(() => getPropertyListingSections(normalizedBlocks), [normalizedBlocks])
  const defaultBlocks = React.useMemo(
    () =>
      createDefaultPropertyListingBlocks({
        title: page.title || page.handle,
        handle: page.handle,
        currency: defaultCurrency,
      }),
    [defaultCurrency, page.handle, page.title]
  )

  const [hero, setHero] = React.useState(sections.hero)
  const [overview, setOverview] = React.useState(sections.overview)
  const [details, setDetails] = React.useState(sections.details)
  const [location, setLocation] = React.useState(sections.location)
  const [pricing, setPricing] = React.useState(sections.pricing)
  const [agent, setAgent] = React.useState(sections.agent)
  const [galleryImages, setGalleryImages] = React.useState(sections.gallery.images)
  const [highlightPills, setHighlightPills] = React.useState(sections.overview.highlights)
  const [featurePills, setFeaturePills] = React.useState(sections.details.buildingFeatures)
  const [nearbyPills, setNearbyPills] = React.useState(sections.location.nearbyPlaces)
  const [badgePills, setBadgePills] = React.useState(sections.hero.highlightBadges)
  const [documents, setDocuments] = React.useState(sections.documents.items)
  const [phone, setPhone] = React.useState(sections.agent.contacts.find((contact) => contact.type === "phone")?.value || "")
  const [email, setEmail] = React.useState(sections.agent.contacts.find((contact) => contact.type === "email")?.value || "")
  const [whatsapp, setWhatsapp] = React.useState(sections.agent.contacts.find((contact) => contact.type === "whatsapp")?.value || "")
  const [website, setWebsite] = React.useState(sections.agent.contacts.find((contact) => contact.type === "website")?.value || "")
  const [saving, setSaving] = React.useState(false)
  const [dirty, setDirty] = React.useState(false)
  const [processingHeroImage, setProcessingHeroImage] = React.useState(false)
  const [processingGallery, setProcessingGallery] = React.useState(false)
  const [processingDocuments, setProcessingDocuments] = React.useState(false)
  const [processingAgentPhoto, setProcessingAgentPhoto] = React.useState(false)
  const accountCurrency = defaultCurrency || "USD"
  const initialPropertyType = React.useMemo(() => {
    const nextValue = sections.details.propertyType?.trim() || sections.hero.propertyType?.trim() || "apartment"
    return nextValue
  }, [sections.details.propertyType, sections.hero.propertyType])
  const [propertyTypeSelection, setPropertyTypeSelection] = React.useState<string>(
    isPropertyTypePreset(initialPropertyType) ? initialPropertyType : "other"
  )
  const [customPropertyType, setCustomPropertyType] = React.useState(
    isPropertyTypePreset(initialPropertyType) || initialPropertyType === "other" ? "" : initialPropertyType
  )

  const markDirty = React.useCallback(() => setDirty(true), [])
  const handleViewPublic = React.useCallback(() => window.open(`/${page.handle}`, "_blank"), [page.handle])

  React.useEffect(() => {
    setPricing((prev) => (prev.currency === accountCurrency ? prev : { ...prev, currency: accountCurrency }))
  }, [accountCurrency])

  const updateHero = React.useCallback(
    <K extends keyof typeof hero>(key: K, value: (typeof hero)[K]) => {
      setHero((prev) => ({ ...prev, [key]: value }))
      markDirty()
    },
    [markDirty]
  )

  const updateOverview = React.useCallback(
    <K extends keyof typeof overview>(key: K, value: (typeof overview)[K]) => {
      setOverview((prev) => ({ ...prev, [key]: value }))
      markDirty()
    },
    [markDirty]
  )

  const updateDetails = React.useCallback(
    <K extends keyof typeof details>(key: K, value: (typeof details)[K]) => {
      setDetails((prev) => ({ ...prev, [key]: value }))
      markDirty()
    },
    [markDirty]
  )

  const updateLocation = React.useCallback(
    <K extends keyof typeof location>(key: K, value: (typeof location)[K]) => {
      setLocation((prev) => ({ ...prev, [key]: value }))
      markDirty()
    },
    [markDirty]
  )

  const updatePricing = React.useCallback(
    <K extends keyof typeof pricing>(key: K, value: (typeof pricing)[K]) => {
      setPricing((prev) => ({ ...prev, [key]: value }))
      markDirty()
    },
    [markDirty]
  )

  const updateAgent = React.useCallback(
    <K extends keyof typeof agent>(key: K, value: (typeof agent)[K]) => {
      setAgent((prev) => ({ ...prev, [key]: value }))
      markDirty()
    },
    [markDirty]
  )

  const syncPropertyType = React.useCallback(
    (value: string) => {
      updateHero("propertyType", value)
      updateDetails("propertyType", value)
    },
    [updateDetails, updateHero]
  )

  async function handleSave() {
    setSaving(true)

    try {
      const resolvedPropertyType = propertyTypeSelection === "other" ? customPropertyType.trim() : propertyTypeSelection

      if (!resolvedPropertyType) {
        showToast("Choose a preset property type or enter a custom one.", "error")
        return
      }

      const contacts = [
        phone ? { id: "contact-phone", type: "phone", label: "Call Agent", value: phone } : null,
        email ? { id: "contact-email", type: "email", label: "Email Agent", value: email } : null,
        whatsapp ? { id: "contact-whatsapp", type: "whatsapp", label: "WhatsApp", value: whatsapp } : null,
        website ? { id: "contact-website", type: "website", label: "Agency Website", value: website } : null,
      ].filter(Boolean)

      const payload = [
        {
          type: "TEXT",
          order: 0,
          content: {
            ...hero,
            title: hero.title || defaultBlocks[0].content.title,
            propertyType: resolvedPropertyType,
            highlightBadges: normalizePillValues(badgePills),
          },
        },
        {
          type: "IMAGE",
          order: 1,
          content: {
            section: "photo_gallery",
            images: galleryImages,
          },
        },
        {
          type: "TEXT",
          order: 2,
          content: {
            ...overview,
            highlights: normalizePillValues(highlightPills),
          },
        },
        {
          type: "GRID",
          order: 3,
          content: {
            ...details,
            propertyType: resolvedPropertyType,
            buildingFeatures: normalizePillValues(featurePills),
          },
        },
        {
          type: "GRID",
          order: 4,
          content: {
            ...location,
            nearbyPlaces: normalizePillValues(nearbyPills),
          },
        },
        {
          type: "GRID",
          order: 5,
          content: {
            ...pricing,
            currency: accountCurrency,
          },
        },
        {
          type: "GRID",
          order: 6,
          content: {
            section: "floorplans_documents",
            items: documents,
          },
        },
        {
          type: "CONTACT",
          order: 7,
          content: {
            ...agent,
            contacts,
          },
        },
      ]

      const requestBody = JSON.stringify({ blocks: payload })

      if (getDataSizeInBytes(requestBody) > MAX_EDITOR_SAVE_BYTES) {
        showToast("This listing is too large to save in one request. Reduce gallery or document uploads and try again.", "error")
        return
      }

      const res = await fetch(`/api/editor/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        showToast(data?.error || "Failed to save property listing", "error")
        return
      }

      setDirty(false)
      showToast("Property listing saved", "success")
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleGalleryUpload(files: File[]) {
    if (files.length === 0) return

    setProcessingGallery(true)
    try {
      const nextImages = await Promise.all(
        files.map(async (file, index) => ({
          id: `gallery-upload-${Date.now()}-${index}`,
          label: fileNameToLabel(file.name),
          url: (await uploadAssetFile(file, { kind: "image", pageId: page.id })).secureUrl,
        }))
      )

      setGalleryImages((prev) => [...prev, ...nextImages])
      markDirty()
    } catch {
      showToast("We could not process one or more gallery images.", "error")
    } finally {
      setProcessingGallery(false)
    }
  }

  async function handleDocumentUpload(files: File[]) {
    if (files.length === 0) return

    setProcessingDocuments(true)
    try {
      const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        showToast("Each document must be 5MB or smaller to keep saves reliable.", "error")
        return
      }

      const nextDocuments = await Promise.all(
        files.map(async (file, index) => ({
          id: `doc-upload-${Date.now()}-${index}`,
          title: fileNameToLabel(file.name),
          type: inferDocumentType(file.name),
          url: (await uploadAssetFile(file, { kind: "document", pageId: page.id })).secureUrl,
        }))
      )

      setDocuments((prev) => [...prev, ...nextDocuments])
      markDirty()
    } catch {
      showToast("We could not process one or more documents.", "error")
    } finally {
      setProcessingDocuments(false)
    }
  }

  const actionButtons = (
    <>
      <Button variant="secondary" onClick={handleViewPublic} className="cursor-pointer rounded-xl px-4 py-2 text-xs shadow-sm">
        Preview
      </Button>
      <Button variant="primary" onClick={handleSave} disabled={saving || !dirty} className="cursor-pointer rounded-xl px-5 py-2 text-sm shadow-premium">
        {saving ? "Saving…" : "Save Changes"}
      </Button>
    </>
  )

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-primary/20 bg-primary/5 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Badge variant="primary">Property Listing</Badge>
          <span>Edit Mode</span>
          {dirty ? <span className="text-warning">· Unsaved changes</span> : null}
        </div>
        <div className="flex gap-2">
          {actionButtons}
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-8">
          <Card className="space-y-6 rounded-[2rem] border border-divider p-6 shadow-sm">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary">Hero / Key Facts</p>
              <h2 className="mt-2 text-2xl font-bold text-text-primary">Lead with the listing story</h2>
              <p className="mt-2 max-w-3xl text-sm text-text-secondary">Keep the hero area focused on the first impression: title, location, image, status, and quick trust signals.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input labelInside="Property Title" value={hero.title} onChange={(event) => updateHero("title", event.target.value)} />
              <Input labelInside="Location Label" value={hero.locationLabel} onChange={(event) => updateHero("locationLabel", event.target.value)} />
              <div className="md:col-span-2">
                <Textarea rows={3} label="Tagline" value={hero.tagline} onChange={(event) => updateHero("tagline", event.target.value)} />
              </div>
              <Select
                label="Status"
                options={PROPERTY_STATUS_OPTIONS.map((option) => ({ label: option.label, value: option.value }))}
                value={hero.status}
                onChange={(event) => updateHero("status", event.target.value as typeof hero.status)}
              />
              <Select
                label="Property Type"
                options={PROPERTY_TYPE_OPTIONS.map((option) => ({ label: option.label, value: option.value }))}
                value={propertyTypeSelection}
                onChange={(event) => {
                  const nextValue = event.target.value
                  setPropertyTypeSelection(nextValue)
                  if (nextValue !== "other") {
                    syncPropertyType(nextValue)
                  } else {
                    syncPropertyType(customPropertyType.trim())
                    markDirty()
                  }
                }}
              />
              {propertyTypeSelection === "other" ? (
                <Input
                  labelInside="Custom Property Type"
                  value={customPropertyType}
                  placeholder="e.g. Penthouse, Maisonette, Co-working Hub"
                  onChange={(event) => {
                    const nextValue = event.target.value
                    setCustomPropertyType(nextValue)
                    syncPropertyType(nextValue)
                  }}
                />
              ) : null}
              <Input
                labelInside="Bedrooms"
                type="number"
                min={0}
                value={hero.beds ?? ""}
                onChange={(event) => {
                  const nextValue = event.target.value ? Number(event.target.value) : null
                  updateHero("beds", nextValue)
                  updateDetails("beds", nextValue)
                }}
              />
              <Input
                labelInside="Bathrooms"
                type="number"
                min={0}
                value={hero.baths ?? ""}
                onChange={(event) => {
                  const nextValue = event.target.value ? Number(event.target.value) : null
                  updateHero("baths", nextValue)
                  updateDetails("baths", nextValue)
                }}
              />
              <Input
                labelInside="Area (sqm)"
                type="number"
                min={0}
                value={hero.areaSqm ?? ""}
                onChange={(event) => updateHero("areaSqm", event.target.value ? Number(event.target.value) : null)}
              />
              <div className="md:col-span-2">
                <Dropzone
                  label="Hero Image"
                  hint={processingHeroImage ? "Optimizing image..." : "Upload a crisp landscape image. JPG or PNG works best."}
                  accept="image/*"
                  disabled={processingHeroImage}
                  onChange={async (file) => {
                    setProcessingHeroImage(true)
                    try {
                      const uploaded = await uploadAssetFile(file, { kind: "image", pageId: page.id })
                      updateHero("heroImageUrl", uploaded.secureUrl)
                    } catch {
                      showToast("We could not process that image. Try another file.", "error")
                    } finally {
                      setProcessingHeroImage(false)
                    }
                  }}
                />
                {hero.heroImageUrl ? (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-divider bg-background">
                    <div
                      className="h-56 w-full bg-cover bg-center"
                      style={{ backgroundImage: `url("${hero.heroImageUrl.replace(/"/g, '\\"')}")` }}
                      role="img"
                      aria-label="Hero image preview"
                    />
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                      <p className="text-xs font-medium text-text-secondary">The uploaded image appears in the public hero section.</p>
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => updateHero("heroImageUrl", "")}
                        className="cursor-pointer rounded-xl px-3 py-2 text-xs shadow-sm"
                      >
                        Remove Image
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="md:col-span-2">
                <PillInput
                  label="Hero Badges"
                  hint="Add short trust signals buyers can scan instantly. Press Enter, comma, or paste a list."
                  placeholder="24/7 Security, Waterfront, Smart Home"
                  values={badgePills}
                  onChange={(values) => {
                    setBadgePills(values)
                    markDirty()
                  }}
                />
              </div>
            </div>
          </Card>

          <Card className="space-y-6 rounded-[2rem] border border-divider p-6 shadow-sm">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary">Overview & Location</p>
              <h2 className="mt-2 text-2xl font-bold text-text-primary">Structure the value proposition</h2>
              <p className="mt-2 max-w-3xl text-sm text-text-secondary">Separate the property story from the neighborhood context so buyers understand both the home and the lifestyle around it.</p>
            </div>
            <div className="grid gap-4">
              <Textarea
                rows={6}
                label="Overview"
                value={overview.overviewText}
                onChange={(event) => updateOverview("overviewText", event.target.value)}
              />
              <PillInput
                label="Key Highlights"
                hint="Use 3–6 scannable value points that sell the property itself."
                placeholder="Sea view, En-suite bedrooms, Visitor parking"
                values={highlightPills}
                onChange={(values) => {
                  setHighlightPills(values)
                  markDirty()
                }}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Input labelInside="Address Line 1" value={location.addressLine1} onChange={(event) => updateLocation("addressLine1", event.target.value)} />
                <Input labelInside="Address Line 2" value={location.addressLine2} onChange={(event) => updateLocation("addressLine2", event.target.value)} />
                <Input labelInside="Area" value={location.area} onChange={(event) => updateLocation("area", event.target.value)} />
                <Input labelInside="City" value={location.city} onChange={(event) => updateLocation("city", event.target.value)} />
                <Input labelInside="Country" value={location.country} onChange={(event) => updateLocation("country", event.target.value)} />
              </div>
              <PillInput
                label="Nearby Places"
                hint="Add landmarks, schools, transport links, or lifestyle anchors buyers care about."
                placeholder="Top school, Retail mall, Transit station"
                values={nearbyPills}
                onChange={(values) => {
                  setNearbyPills(values)
                  markDirty()
                }}
              />
            </div>
          </Card>

          <Card className="space-y-6 rounded-[2rem] border border-divider p-6 shadow-sm">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary">Details & Pricing</p>
              <h2 className="mt-2 text-2xl font-bold text-text-primary">Match the page to the property data</h2>
              <p className="mt-2 max-w-3xl text-sm text-text-secondary">Keep technical facts, pricing, and amenities together so editors can complete the listing without jumping between sections.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                labelInside="Covered Area (sqm)"
                type="number"
                min={0}
                value={details.coveredAreaSqm ?? ""}
                onChange={(event) => updateDetails("coveredAreaSqm", event.target.value ? Number(event.target.value) : null)}
              />
              <Input
                labelInside="Land Area (sqm)"
                type="number"
                min={0}
                value={details.landAreaSqm ?? ""}
                onChange={(event) => updateDetails("landAreaSqm", event.target.value ? Number(event.target.value) : null)}
              />
              <Input
                labelInside="Toilets"
                type="number"
                min={0}
                value={details.toilets ?? ""}
                onChange={(event) => updateDetails("toilets", event.target.value ? Number(event.target.value) : null)}
              />
              <Input labelInside="Floor / Level" value={details.floor} onChange={(event) => updateDetails("floor", event.target.value)} />
              <Input labelInside="Year Built" value={details.yearBuilt} onChange={(event) => updateDetails("yearBuilt", event.target.value)} />
              <Input labelInside="Tenure" value={details.tenure} onChange={(event) => updateDetails("tenure", event.target.value)} />
              <Select
                label="Furnishing"
                options={PROPERTY_FURNISHING_OPTIONS.map((option) => ({ label: option.label, value: option.value }))}
                value={details.furnishing}
                onChange={(event) => updateDetails("furnishing", event.target.value as typeof details.furnishing)}
              />
              <Select
                label="Listing Type"
                options={[
                  { label: "For Sale", value: "sale" },
                  { label: "For Rent", value: "rent" },
                ]}
                value={pricing.listingType}
                onChange={(event) => updatePricing("listingType", event.target.value as typeof pricing.listingType)}
              />
              <Input
                labelInside="Price"
                type="number"
                min={0}
                value={pricing.price ?? ""}
                onChange={(event) => updatePricing("price", event.target.value ? Number(event.target.value) : null)}
              />
              <div className="md:col-span-2">
                <div className="rounded-2xl border border-divider bg-background px-4 py-4 shadow-sm">
                  <p className="text-sm font-semibold text-text-secondary">Currency</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-lg font-bold text-text-primary">{accountCurrency}</p>
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                      From Settings
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-text-secondary">Manage your default currency in Settings. Property listings inherit it automatically.</p>
                </div>
              </div>
              <Select
                label="Period"
                options={PROPERTY_PERIOD_OPTIONS.map((option) => ({ label: option.label, value: option.value }))}
                value={pricing.period}
                onChange={(event) => updatePricing("period", event.target.value as typeof pricing.period)}
              />
              <Select
                label="Availability"
                options={[
                  { label: "Available", value: "available" },
                  { label: "Under Offer", value: "under_offer" },
                  { label: "Sold", value: "sold" },
                  { label: "Coming Soon", value: "coming_soon" },
                ]}
                value={pricing.availabilityStatus}
                onChange={(event) => updatePricing("availabilityStatus", event.target.value as typeof pricing.availabilityStatus)}
              />
              <Input
                labelInside="Service Charge Amount"
                type="number"
                min={0}
                value={pricing.serviceChargeAmount ?? ""}
                onChange={(event) => updatePricing("serviceChargeAmount", event.target.value ? Number(event.target.value) : null)}
              />
              <Select
                label="Service Charge Period"
                options={[
                  { label: "Per Month", value: "month" },
                  { label: "Per Year", value: "year" },
                ]}
                value={pricing.serviceChargePeriod}
                onChange={(event) => updatePricing("serviceChargePeriod", event.target.value as typeof pricing.serviceChargePeriod)}
              />
              <div className="md:col-span-2">
                <Textarea
                  rows={3}
                  label="Pricing Notes"
                  value={pricing.notes}
                  onChange={(event) => updatePricing("notes", event.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Textarea
                  rows={3}
                  label="Service Charge Description"
                  value={pricing.serviceChargeDescription}
                  onChange={(event) => updatePricing("serviceChargeDescription", event.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <PillInput
                  label="Building Features"
                  hint="List amenities one by one so they stay easy to scan on the public page."
                  placeholder="Pool, Gym, CCTV, Elevator"
                  values={featurePills}
                  onChange={(values) => {
                    setFeaturePills(values)
                    markDirty()
                  }}
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="space-y-6 rounded-[2rem] border border-divider p-6 shadow-sm">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary">Gallery & Documents</p>
              <h2 className="mt-2 text-2xl font-bold text-text-primary">Load visual assets before publishing</h2>
              <p className="mt-2 max-w-3xl text-sm text-text-secondary">Upload assets directly instead of pasting links. This shortens setup time and reduces formatting mistakes.</p>
            </div>
            <div className="space-y-4">
              <Dropzone
                label="Gallery Images"
                hint={processingGallery ? "Optimizing uploaded images..." : "Upload multiple JPG or PNG images for the property gallery."}
                accept="image/*"
                multiple
                disabled={processingGallery}
                onMultiple={handleGalleryUpload}
                onChange={async (file) => {
                  await handleGalleryUpload([file])
                }}
              />
              {galleryImages.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {galleryImages.map((image) => (
                    <div key={image.id} className="overflow-hidden rounded-2xl border border-divider bg-background shadow-sm">
                      <div
                        className="h-40 w-full bg-cover bg-center"
                        style={{ backgroundImage: `url("${image.url.replace(/"/g, '\\"')}")` }}
                        role="img"
                        aria-label={image.label || "Gallery image preview"}
                      />
                      <div className="space-y-3 p-4">
                        <Input
                          labelInside="Image Label"
                          value={image.label}
                          placeholder="e.g. Living Room"
                          onChange={(event) => {
                            const nextValue = event.target.value
                            setGalleryImages((prev) => prev.map((item) => (item.id === image.id ? { ...item, label: nextValue } : item)))
                            markDirty()
                          }}
                        />
                        <div className="flex justify-end">
                          <Button
                            variant="secondary"
                            type="button"
                            onClick={() => {
                              setGalleryImages((prev) => prev.filter((item) => item.id !== image.id))
                              markDirty()
                            }}
                            className="cursor-pointer rounded-xl px-3 py-2 text-xs shadow-sm"
                          >
                            Remove Image
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="space-y-4">
              <Dropzone
                label="Documents"
                hint={processingDocuments ? "Preparing uploaded files..." : "Upload PDFs, docs, spreadsheets, or presentations up to 10MB each."}
                multiple
                disabled={processingDocuments}
                onMultiple={handleDocumentUpload}
                onChange={async (file) => {
                  await handleDocumentUpload([file])
                }}
              />
              {documents.length > 0 ? (
                <div className="space-y-4">
                  {documents.map((document) => (
                    <div key={document.id} className="rounded-2xl border border-divider bg-background p-4 shadow-sm">
                      <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_auto] md:items-end">
                        <Input
                          labelInside="Document Title"
                          value={document.title}
                          placeholder="e.g. Ground Floor Plan"
                          onChange={(event) => {
                            const nextValue = event.target.value
                            setDocuments((prev) => prev.map((item) => (item.id === document.id ? { ...item, title: nextValue } : item)))
                            markDirty()
                          }}
                        />
                        <Select
                          label="Document Type"
                          options={[
                            { label: "Floorplan", value: "floorplan" },
                            { label: "Brochure", value: "brochure" },
                            { label: "Spec Sheet", value: "spec_sheet" },
                            { label: "Other", value: "other" },
                          ]}
                          value={document.type}
                          onChange={(event) => {
                            const nextValue = event.target.value as PropertyDocumentItem["type"]
                            setDocuments((prev) => prev.map((item) => (item.id === document.id ? { ...item, type: nextValue } : item)))
                            markDirty()
                          }}
                        />
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={() => {
                            setDocuments((prev) => prev.filter((item) => item.id !== document.id))
                            markDirty()
                          }}
                          className="cursor-pointer rounded-xl px-3 py-2 text-xs shadow-sm"
                        >
                          Remove File
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="space-y-6 rounded-[2rem] border border-divider p-6 shadow-sm">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary">Agent Contact</p>
              <h2 className="mt-2 text-2xl font-bold text-text-primary">Keep response channels clear</h2>
            </div>
            <div className="grid gap-4">
              <Input labelInside="Agent Name" value={agent.agentName} onChange={(event) => updateAgent("agentName", event.target.value)} />
              <Input labelInside="Role" value={agent.role} onChange={(event) => updateAgent("role", event.target.value)} />
              <Input labelInside="Agency Name" value={agent.agencyName} onChange={(event) => updateAgent("agencyName", event.target.value)} />
              <div className="space-y-4">
                <Dropzone
                  label="Agent Photo"
                  hint={processingAgentPhoto ? "Optimizing agent photo..." : "Upload a headshot so the contact card feels credible and personal."}
                  accept="image/*"
                  disabled={processingAgentPhoto}
                  onChange={async (file) => {
                    setProcessingAgentPhoto(true)
                    try {
                      const uploaded = await uploadAssetFile(file, { kind: "image", pageId: page.id })
                      updateAgent("agentPhotoUrl", uploaded.secureUrl)
                    } catch {
                      showToast("We could not process that agent photo. Try another file.", "error")
                    } finally {
                      setProcessingAgentPhoto(false)
                    }
                  }}
                />
                {agent.agentPhotoUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-divider bg-background">
                    <div
                      className="h-44 w-full bg-cover bg-center"
                      style={{ backgroundImage: `url("${agent.agentPhotoUrl.replace(/"/g, '\\"')}")` }}
                      role="img"
                      aria-label="Agent photo preview"
                    />
                    <div className="flex justify-end px-4 py-3">
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => updateAgent("agentPhotoUrl", "")}
                        className="cursor-pointer rounded-xl px-3 py-2 text-xs shadow-sm"
                      >
                        Remove Photo
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
              <Textarea rows={5} label="Agent Bio" value={agent.bio} onChange={(event) => updateAgent("bio", event.target.value)} />
              <Input
                labelInside="Phone"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value)
                  markDirty()
                }}
              />
              <Input
                labelInside="Email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  markDirty()
                }}
              />
              <Input
                labelInside="WhatsApp"
                value={whatsapp}
                onChange={(event) => {
                  setWhatsapp(event.target.value)
                  markDirty()
                }}
              />
              <Input
                labelInside="Website"
                value={website}
                onChange={(event) => {
                  setWebsite(event.target.value)
                  markDirty()
                }}
              />
            </div>
          </Card>
        </div>
      </div>
      <div className="sticky bottom-4 z-20">
        <div className="ml-auto flex w-full max-w-md items-center justify-end gap-3 rounded-[1.6rem] border border-primary/20 bg-surface/95 p-3 shadow-premium backdrop-blur">
          <div className="mr-auto px-2 text-xs font-semibold text-text-secondary">
            {dirty ? "Unsaved changes" : "All changes saved"}
          </div>
          {actionButtons}
        </div>
      </div>
    </div>
  )
}
