export const PROPERTY_LISTING_CATEGORY = "PROPERTY_LISTING" as const

export const PROPERTY_STATUS_OPTIONS = [
  { label: "For Sale", value: "for_sale" },
  { label: "For Rent", value: "for_rent" },
  { label: "Sold", value: "sold" },
  { label: "Under Offer", value: "under_offer" },
  { label: "Coming Soon", value: "coming_soon" },
] as const

export const PROPERTY_TYPE_OPTIONS = [
  { label: "Apartment", value: "apartment" },
  { label: "Duplex", value: "duplex" },
  { label: "House", value: "house" },
  { label: "Villa", value: "villa" },
  { label: "Studio", value: "studio" },
  { label: "Land", value: "land" },
  { label: "Office", value: "office" },
  { label: "Retail", value: "retail" },
  { label: "Other", value: "other" },
] as const

export const PROPERTY_FURNISHING_OPTIONS = [
  { label: "Unfurnished", value: "unfurnished" },
  { label: "Semi-Furnished", value: "semi" },
  { label: "Fully Furnished", value: "fully" },
  { label: "Other", value: "other" },
] as const

export const PROPERTY_PERIOD_OPTIONS = [
  { label: "One Time", value: "one_time" },
  { label: "Per Month", value: "month" },
  { label: "Per Year", value: "year" },
] as const

export type PropertyStatus = (typeof PROPERTY_STATUS_OPTIONS)[number]["value"]
export type PropertyPresetType = (typeof PROPERTY_TYPE_OPTIONS)[number]["value"]
export type PropertyType = PropertyPresetType | (string & {})
export type PropertyFurnishing = (typeof PROPERTY_FURNISHING_OPTIONS)[number]["value"]
export type PropertyPeriod = (typeof PROPERTY_PERIOD_OPTIONS)[number]["value"]
export type PropertyListingType = "sale" | "rent"
export type PropertyAvailabilityStatus = "available" | "under_offer" | "sold" | "coming_soon"

export function isPropertyTypePreset(value: string): value is PropertyPresetType {
  return PROPERTY_TYPE_OPTIONS.some((option) => option.value === value)
}

export type PropertyGalleryImage = {
  id: string
  url: string
  label: string
}

export type PropertyDocumentItem = {
  id: string
  title: string
  type: "floorplan" | "brochure" | "spec_sheet" | "other"
  url: string
}

export type PropertyContact = {
  id: string
  type: "phone" | "email" | "whatsapp" | "website"
  label: string
  value: string
}

export type PropertyHeroContent = {
  section: "property_hero"
  title: string
  tagline: string
  status: PropertyStatus
  propertyType: PropertyType
  beds: number | null
  baths: number | null
  areaSqm: number | null
  locationLabel: string
  heroImageUrl: string
  highlightBadges: string[]
}

export type PropertyGalleryContent = {
  section: "photo_gallery"
  images: PropertyGalleryImage[]
}

export type PropertyOverviewContent = {
  section: "overview_features"
  overviewText: string
  highlights: string[]
}

export type PropertyDetailsContent = {
  section: "property_details"
  propertyType: PropertyType
  beds: number | null
  baths: number | null
  toilets: number | null
  coveredAreaSqm: number | null
  landAreaSqm: number | null
  floor: string
  yearBuilt: string
  furnishing: PropertyFurnishing
  tenure: string
  buildingFeatures: string[]
}

export type PropertyLocationContent = {
  section: "location_map"
  addressLine1: string
  addressLine2: string
  area: string
  city: string
  country: string
  nearbyPlaces: string[]
}

export type PropertyPricingContent = {
  section: "pricing_availability"
  listingType: PropertyListingType
  price: number | null
  currency: string
  period: PropertyPeriod
  serviceChargeAmount: number | null
  serviceChargePeriod: Exclude<PropertyPeriod, "one_time">
  serviceChargeDescription: string
  availabilityStatus: PropertyAvailabilityStatus
  notes: string
}

export type PropertyDocumentsContent = {
  section: "floorplans_documents"
  items: PropertyDocumentItem[]
}

export type PropertyAgentContent = {
  section: "agent_contact"
  agentName: string
  agentPhotoUrl: string
  role: string
  agencyName: string
  bio: string
  contacts: PropertyContact[]
}

export type PropertyListingSections = {
  hero: PropertyHeroContent
  gallery: PropertyGalleryContent
  overview: PropertyOverviewContent
  details: PropertyDetailsContent
  location: PropertyLocationContent
  pricing: PropertyPricingContent
  documents: PropertyDocumentsContent
  agent: PropertyAgentContent
}

type PropertySeedConfig = {
  title?: string
  handle?: string
  locationLabel?: string
  area?: string
  city?: string
  country?: string
  listingType?: PropertyListingType
  price?: number | string | null
  currency?: string
  beds?: number | string | null
  baths?: number | string | null
  propertyType?: string
  agentName?: string
  agentEmail?: string
}

type EditorBlock = {
  type: string
  content: Record<string, unknown>
  order: number
}

function uid(prefix: string, index: number) {
  return `${prefix}-${index + 1}`
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const normalized = Number(value.replace(/,/g, "").trim())
    if (Number.isFinite(normalized)) return normalized
  }
  return null
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item || "").trim()).filter(Boolean)
}

function toGalleryImages(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .map((item, index) => {
      const record = typeof item === "object" && item ? (item as Record<string, unknown>) : {}
      return {
        id: String(record.id || uid("gallery", index)),
        url: String(record.url || "").trim(),
        label: String(record.label || "").trim(),
      }
    })
    .filter((item) => item.url)
}

function toDocuments(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .map((item, index) => {
      const record = typeof item === "object" && item ? (item as Record<string, unknown>) : {}
      const type = String(record.type || "other")
      return {
        id: String(record.id || uid("doc", index)),
        title: String(record.title || "").trim(),
        type: (type === "floorplan" || type === "brochure" || type === "spec_sheet" ? type : "other") as PropertyDocumentItem["type"],
        url: String(record.url || "").trim(),
      }
    })
    .filter((item) => item.title || item.url)
}

function toContacts(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .map((item, index) => {
      const record = typeof item === "object" && item ? (item as Record<string, unknown>) : {}
      const type = String(record.type || "phone")
      return {
        id: String(record.id || uid("contact", index)),
        type: (type === "phone" || type === "email" || type === "whatsapp" || type === "website" ? type : "phone") as PropertyContact["type"],
        label: String(record.label || "").trim(),
        value: String(record.value || "").trim(),
      }
    })
    .filter((item) => item.value)
}

export function getStatusLabel(status: PropertyStatus | PropertyAvailabilityStatus) {
  const match = PROPERTY_STATUS_OPTIONS.find((option) => option.value === status)
  if (match) return match.label
  if (status === "available") return "Available"
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

export function formatPropertyPrice(price: number | null | undefined, currency: string) {
  if (price === null || price === undefined || Number.isNaN(price)) return "Price on request"
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: price % 1 === 0 ? 0 : 2,
    }).format(price)
  } catch {
    return `${currency} ${price.toLocaleString("en-US")}`
  }
}

export function formatPropertyPriceMeta(pricing: Pick<PropertyPricingContent, "listingType" | "period">) {
  if (pricing.listingType === "sale") return "One-time purchase"
  if (pricing.period === "month") return "Per month"
  if (pricing.period === "year") return "Per year"
  return "Flexible term"
}

export function buildPropertyContactHref(contact: Pick<PropertyContact, "type" | "value">) {
  const value = contact.value.trim()
  if (!value) return "#"
  if (contact.type === "email") return `mailto:${value}`
  if (contact.type === "phone") return `tel:${value}`
  if (contact.type === "whatsapp") {
    const digits = value.replace(/[^\d+]/g, "")
    return digits ? `https://wa.me/${digits.replace(/^\+/, "")}` : "#"
  }
  if (/^https?:\/\//i.test(value)) return value
  return `https://${value}`
}

export function createDefaultPropertyListingBlocks(config: PropertySeedConfig = {}) {
  const listingType = config.listingType === "rent" ? "rent" : "sale"
  const status: PropertyStatus = listingType === "rent" ? "for_rent" : "for_sale"
  const availabilityStatus: PropertyAvailabilityStatus = "available"
  const propertyType = config.propertyType || "apartment"
  const beds = toNumber(config.beds)
  const baths = toNumber(config.baths)
  const price = toNumber(config.price)
  const area = config.area?.trim() || "Lekki Phase 1"
  const city = config.city?.trim() || "Lagos"
  const country = config.country?.trim() || "Nigeria"
  const locationLabel = config.locationLabel?.trim() || `${area}, ${city}`
  const title =
    config.title?.trim() ||
    `${beds || 3}-Bed ${propertyType === "apartment" ? "Apartment" : "Property"} in ${area}`
  const agentName = config.agentName?.trim() || "Listing Agent"
  const agentEmail = config.agentEmail?.trim() || ""

  return [
    {
      type: "TEXT",
      order: 0,
      content: {
        section: "property_hero",
        title,
        tagline: listingType === "rent" ? "Move-in ready with premium estate amenities." : "Prime address with strong value appreciation potential.",
        status,
        propertyType,
        beds,
        baths,
        areaSqm: 185,
        locationLabel,
        heroImageUrl: "",
        highlightBadges: ["24/7 Security", "Parking", "Serviced"],
      } satisfies PropertyHeroContent,
    },
    {
      type: "IMAGE",
      order: 1,
      content: {
        section: "photo_gallery",
        images: [],
      } satisfies PropertyGalleryContent,
    },
    {
      type: "TEXT",
      order: 2,
      content: {
        section: "overview_features",
        overviewText:
          "Showcase the property's story, who it suits best, and why the location matters. Use this area to frame the opportunity before prospects dive into the technical details.",
        highlights: [
          "En-suite bedrooms",
          "Visitor parking",
          "Secure gated access",
          "Flexible inspection scheduling",
        ],
      } satisfies PropertyOverviewContent,
    },
    {
      type: "GRID",
      order: 3,
      content: {
        section: "property_details",
        propertyType,
        beds,
        baths,
        toilets: baths,
        coveredAreaSqm: 185,
        landAreaSqm: null,
        floor: "",
        yearBuilt: "",
        furnishing: "semi",
        tenure: "Freehold",
        buildingFeatures: ["Pool", "Gym", "CCTV", "Elevator"],
      } satisfies PropertyDetailsContent,
    },
    {
      type: "GRID",
      order: 4,
      content: {
        section: "location_map",
        addressLine1: "",
        addressLine2: "",
        area,
        city,
        country,
        nearbyPlaces: ["Top schools", "Retail hub", "Transit link"],
      } satisfies PropertyLocationContent,
    },
    {
      type: "GRID",
      order: 5,
      content: {
        section: "pricing_availability",
        listingType,
        price,
        currency: config.currency?.trim() || "USD",
        period: listingType === "rent" ? "year" : "one_time",
        serviceChargeAmount: null,
        serviceChargePeriod: "year",
        serviceChargeDescription: "",
        availabilityStatus,
        notes: listingType === "rent" ? "Available for immediate inspection." : "Title documents available on request.",
      } satisfies PropertyPricingContent,
    },
    {
      type: "GRID",
      order: 6,
      content: {
        section: "floorplans_documents",
        items: [],
      } satisfies PropertyDocumentsContent,
    },
    {
      type: "CONTACT",
      order: 7,
      content: {
        section: "agent_contact",
        agentName,
        agentPhotoUrl: "",
        role: "Property Consultant",
        agencyName: "",
        bio: "Add the agent bio, response promise, and preferred contact route for a higher-converting listing page.",
        contacts: agentEmail
          ? [
              {
                id: "contact-1",
                type: "email",
                label: "Email",
                value: agentEmail,
              },
            ]
          : [],
      } satisfies PropertyAgentContent,
    },
  ] satisfies EditorBlock[]
}

export function getPropertyListingSections(blocks: Array<{ type: string; content: Record<string, unknown> }>): PropertyListingSections {
  const defaults = createDefaultPropertyListingBlocks()

  const heroSource = blocks.find((block) => block.type === "TEXT" && block.content?.section === "property_hero")?.content || defaults[0].content
  const gallerySource = blocks.find((block) => block.type === "IMAGE" && block.content?.section === "photo_gallery")?.content || defaults[1].content
  const overviewSource = blocks.find((block) => block.type === "TEXT" && block.content?.section === "overview_features")?.content || defaults[2].content
  const detailsSource = blocks.find((block) => block.type === "GRID" && block.content?.section === "property_details")?.content || defaults[3].content
  const locationSource = blocks.find((block) => block.type === "GRID" && block.content?.section === "location_map")?.content || defaults[4].content
  const pricingSource = blocks.find((block) => block.type === "GRID" && block.content?.section === "pricing_availability")?.content || defaults[5].content
  const documentsSource = blocks.find((block) => block.type === "GRID" && block.content?.section === "floorplans_documents")?.content || defaults[6].content
  const agentSource = blocks.find((block) => block.type === "CONTACT" && block.content?.section === "agent_contact")?.content || defaults[7].content

  return {
    hero: {
      section: "property_hero",
      title: String(heroSource.title || ""),
      tagline: String(heroSource.tagline || ""),
      status: (heroSource.status as PropertyStatus) || "for_sale",
      propertyType: String(heroSource.propertyType || "").trim() || "apartment",
      beds: toNumber(heroSource.beds as string | number | null | undefined),
      baths: toNumber(heroSource.baths as string | number | null | undefined),
      areaSqm: toNumber(heroSource.areaSqm as string | number | null | undefined),
      locationLabel: String(heroSource.locationLabel || ""),
      heroImageUrl: String(heroSource.heroImageUrl || ""),
      highlightBadges: toStringArray(heroSource.highlightBadges),
    },
    gallery: {
      section: "photo_gallery",
      images: toGalleryImages(gallerySource.images),
    },
    overview: {
      section: "overview_features",
      overviewText: String(overviewSource.overviewText || ""),
      highlights: toStringArray(overviewSource.highlights),
    },
    details: {
      section: "property_details",
      propertyType: String(detailsSource.propertyType || "").trim() || "apartment",
      beds: toNumber(detailsSource.beds as string | number | null | undefined),
      baths: toNumber(detailsSource.baths as string | number | null | undefined),
      toilets: toNumber(detailsSource.toilets as string | number | null | undefined),
      coveredAreaSqm: toNumber(detailsSource.coveredAreaSqm as string | number | null | undefined),
      landAreaSqm: toNumber(detailsSource.landAreaSqm as string | number | null | undefined),
      floor: String(detailsSource.floor || ""),
      yearBuilt: String(detailsSource.yearBuilt || ""),
      furnishing: (detailsSource.furnishing as PropertyFurnishing) || "semi",
      tenure: String(detailsSource.tenure || ""),
      buildingFeatures: toStringArray(detailsSource.buildingFeatures),
    },
    location: {
      section: "location_map",
      addressLine1: String(locationSource.addressLine1 || ""),
      addressLine2: String(locationSource.addressLine2 || ""),
      area: String(locationSource.area || ""),
      city: String(locationSource.city || ""),
      country: String(locationSource.country || ""),
      nearbyPlaces: toStringArray(locationSource.nearbyPlaces),
    },
    pricing: {
      section: "pricing_availability",
      listingType: pricingSource.listingType === "rent" ? "rent" : "sale",
      price: toNumber(pricingSource.price as string | number | null | undefined),
      currency: String(pricingSource.currency || "USD"),
      period: pricingSource.period === "month" || pricingSource.period === "year" ? pricingSource.period : "one_time",
      serviceChargeAmount: toNumber(pricingSource.serviceChargeAmount as string | number | null | undefined),
      serviceChargePeriod: pricingSource.serviceChargePeriod === "month" ? "month" : "year",
      serviceChargeDescription: String(pricingSource.serviceChargeDescription || ""),
      availabilityStatus:
        pricingSource.availabilityStatus === "under_offer" ||
        pricingSource.availabilityStatus === "sold" ||
        pricingSource.availabilityStatus === "coming_soon"
          ? pricingSource.availabilityStatus
          : "available",
      notes: String(pricingSource.notes || ""),
    },
    documents: {
      section: "floorplans_documents",
      items: toDocuments(documentsSource.items),
    },
    agent: {
      section: "agent_contact",
      agentName: String(agentSource.agentName || ""),
      agentPhotoUrl: String(agentSource.agentPhotoUrl || ""),
      role: String(agentSource.role || ""),
      agencyName: String(agentSource.agencyName || ""),
      bio: String(agentSource.bio || ""),
      contacts: toContacts(agentSource.contacts),
    },
  }
}
