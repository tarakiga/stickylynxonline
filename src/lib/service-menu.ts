export const SERVICE_MENU_CATEGORY = "SERVICE_MENU" as const

export const BOOKING_PLATFORM_OPTIONS = [
  { label: "Calendly", value: "calendly" },
  { label: "Fresha", value: "fresha" },
  { label: "Booksy", value: "booksy" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Custom", value: "custom" },
] as const

export const CONTACT_TYPE_OPTIONS = [
  { label: "Phone", value: "phone" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Email", value: "email" },
  { label: "Instagram", value: "instagram" },
  { label: "Website", value: "website" },
] as const

export type BookingPlatform = (typeof BOOKING_PLATFORM_OPTIONS)[number]["value"]
export type ContactType = (typeof CONTACT_TYPE_OPTIONS)[number]["value"]
export type PriceType = "fixed" | "from" | "range"
export type BookingMode = "internal" | "external" | "both"

export type ServiceHeroContent = {
  section: "service_hero"
  businessName: string
  headline: string
  roleOrTagline: string
  heroImageUrl: string
  primaryCtaLabel: string
}

export type AboutTrustContent = {
  section: "about_trust"
  aboutText: string
  speciality: string
  serviceArea: string
  yearsInBusiness: string
  qualifications: string[]
  certifications: string[]
  brandsUsed: string[]
}

export type ServiceMenuItem = {
  id: string
  name: string
  description: string
  durationMinutes: number | null
  price: number | null
  currency: string
  priceType: PriceType
  maxPrice: number | null
  tags: string[]
}

export type ServiceMenuCategorySection = {
  id: string
  name: string
  description: string
  services: ServiceMenuItem[]
}

export type ServiceCategoriesContent = {
  section: "service_categories"
  categories: ServiceMenuCategorySection[]
  collapsible: boolean
  defaultOpenCategoryIds: string[]
  hasSearch: boolean
}

export type FeaturedServicePackage = {
  id: string
  name: string
  description: string
  totalDurationMinutes: number | null
  price: number | null
  currency: string
  includes: string[]
}

export type FeaturedServicesContent = {
  section: "featured_services"
  title: string
  items: FeaturedServicePackage[]
}

export type BookingLink = {
  id: string
  label: string
  url: string
  type: BookingPlatform
  emphasis: "primary" | "secondary"
}

export type WeeklyAvailability = {
  day: number
  enabled: boolean
  start: string
  end: string
}

export type DateAvailabilityOverride = {
  id: string
  date: string
  enabled: boolean
  start: string
  end: string
  label: string
}

export type BookingSchedule = {
  slotIntervalMinutes: number
  maxAdvanceDays: number
  weeklyAvailability: WeeklyAvailability[]
  dateOverrides: DateAvailabilityOverride[]
}

export type BookingContent = {
  section: "booking"
  introText: string
  bookingMode: BookingMode
  internalButtonLabel: string
  confirmationMessage: string
  nextAvailableText: string
  busyDays: number[]
  bookingLinks: BookingLink[]
  policies: string
  schedule: BookingSchedule
}

export type ServiceLocation = {
  id: string
  name: string
  address: string
  city: string
  country: string
}

export type ServiceContact = {
  id: string
  type: ContactType
  label: string
  value: string
}

export type LocationContactContent = {
  section: "location_contact"
  locations: ServiceLocation[]
  contacts: ServiceContact[]
  serviceAreaText: string
}

export type TestimonialItem = {
  id: string
  quote: string
  source: string
  rating: number
}

export type TestimonialsContent = {
  section: "testimonials"
  items: TestimonialItem[]
}

export type FaqItem = {
  id: string
  question: string
  answer: string
}

export type FaqContent = {
  section: "faq"
  items: FaqItem[]
}

function uid(prefix: string, index: number) {
  return `${prefix}-${index + 1}`
}

export function createDefaultBookingSchedule(): BookingSchedule {
  return {
    slotIntervalMinutes: 30,
    maxAdvanceDays: 45,
    weeklyAvailability: [
      { day: 0, enabled: false, start: "09:00", end: "17:00" },
      { day: 1, enabled: true, start: "09:00", end: "17:00" },
      { day: 2, enabled: true, start: "09:00", end: "17:00" },
      { day: 3, enabled: true, start: "09:00", end: "17:00" },
      { day: 4, enabled: true, start: "09:00", end: "17:00" },
      { day: 5, enabled: true, start: "09:00", end: "17:00" },
      { day: 6, enabled: true, start: "10:00", end: "15:00" },
    ],
    dateOverrides: [],
  }
}

export function createDefaultServiceMenuBlocks({
  title,
  currency = "USD",
}: {
  title?: string
  currency?: string
}) {
  void currency

  return [
    {
      type: "TEXT",
      content: {
        section: "service_hero",
        businessName: title || "Service Menu",
        headline: "",
        roleOrTagline: "",
        heroImageUrl: "",
        primaryCtaLabel: "Book an appointment",
      } satisfies ServiceHeroContent,
      order: 0,
    },
    {
      type: "TEXT",
      content: {
        section: "about_trust",
        aboutText: "",
        speciality: "",
        serviceArea: "",
        yearsInBusiness: "",
        qualifications: [],
        certifications: [],
        brandsUsed: [],
      } satisfies AboutTrustContent,
      order: 1,
    },
    {
      type: "GRID",
      content: {
        section: "service_categories",
        categories: [
          {
            id: uid("cat", 0),
            name: "Core Services",
            description: "",
            services: [],
          },
        ],
        collapsible: true,
        defaultOpenCategoryIds: [uid("cat", 0)],
        hasSearch: true,
      } satisfies ServiceCategoriesContent,
      order: 2,
    },
    {
      type: "GRID",
      content: {
        section: "featured_services",
        title: "Popular packages",
        items: [],
      } satisfies FeaturedServicesContent,
      order: 3,
    },
    {
      type: "GRID",
      content: {
        section: "booking",
        introText: "Book online in a few taps or use one of the external booking options below.",
        bookingMode: "internal",
        internalButtonLabel: "Book now",
        confirmationMessage: "Thanks for your request. We will confirm your appointment shortly.",
        nextAvailableText: "Next available today",
        busyDays: [0],
        bookingLinks: [],
        policies: "",
        schedule: createDefaultBookingSchedule(),
      } satisfies BookingContent,
      order: 4,
    },
    {
      type: "CONTACT",
      content: {
        section: "location_contact",
        locations: [],
        contacts: [],
        serviceAreaText: "",
      } satisfies LocationContactContent,
      order: 5,
    },
    {
      type: "GRID",
      content: {
        section: "testimonials",
        items: [],
      } satisfies TestimonialsContent,
      order: 6,
    },
    {
      type: "GRID",
      content: {
        section: "faq",
        items: [],
      } satisfies FaqContent,
      order: 7,
    },
  ]
}
