import * as React from "react"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { Avatar } from "@/components/ui/Avatar"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  Globe,
  House,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  Wallet,
} from "lucide-react"
import {
  buildPropertyContactHref,
  formatPropertyPrice,
  formatPropertyPriceMeta,
  getStatusLabel,
  type PropertyAvailabilityStatus,
  type PropertyContact,
  type PropertyPricingContent,
  type PropertyStatus,
} from "@/lib/property-listing"

type PropertyStatusBadgeProps = {
  status: PropertyStatus | PropertyAvailabilityStatus
  className?: string
}

type PropertyFactBarItem = {
  label: string
  value: string
}

type PropertyFactBarProps = {
  price: number | null | undefined
  currency: string
  pricing: Pick<PropertyPricingContent, "listingType" | "period">
  beds?: number | null
  baths?: number | null
  areaSqm?: number | null
  locationLabel?: string
  className?: string
}

type PropertySpecItem = {
  label: string
  value: string
}

type PropertySpecListProps = {
  items: PropertySpecItem[]
  className?: string
}

type PropertyMapCardProps = {
  area: string
  city: string
  country: string
  addressLine1?: string
  addressLine2?: string
  nearbyPlaces?: string[]
  className?: string
}

type PropertyAgentCardProps = {
  agentName: string
  role?: string
  agencyName?: string
  bio?: string
  agentPhotoUrl?: string
  contacts: PropertyContact[]
  className?: string
}

type PropertyTemplatePreviewProps = {
  title: string
  status: PropertyStatus | PropertyAvailabilityStatus
  propertyType: string
  price: number | null | undefined
  currency: string
  pricing: Pick<PropertyPricingContent, "listingType" | "period">
  beds?: number | null
  baths?: number | null
  areaSqm?: number | null
  locationLabel: string
  highlights?: string[]
  className?: string
  embedded?: boolean
}

function getBadgeVariant(status: PropertyStatus | PropertyAvailabilityStatus) {
  if (status === "sold") return "error" as const
  if (status === "under_offer") return "warning" as const
  if (status === "coming_soon") return "info" as const
  return "primary" as const
}

export function PropertyStatusBadge({ status, className }: PropertyStatusBadgeProps) {
  return (
    <Badge variant={getBadgeVariant(status)} className={cn("rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em]", className)}>
      {getStatusLabel(status)}
    </Badge>
  )
}

export function PropertyFactBar({
  price,
  currency,
  pricing,
  beds,
  baths,
  areaSqm,
  locationLabel,
  className,
}: PropertyFactBarProps) {
  const items: Array<PropertyFactBarItem & { icon: React.ReactNode }> = [
    {
      label: formatPropertyPriceMeta(pricing),
      value: formatPropertyPrice(price, currency),
      icon: <Wallet size={16} />,
    },
    ...(beds ? [{ label: "Bedrooms", value: `${beds}`, icon: <BedDouble size={16} /> }] : []),
    ...(baths ? [{ label: "Bathrooms", value: `${baths}`, icon: <Bath size={16} /> }] : []),
    ...(areaSqm ? [{ label: "Area", value: `${areaSqm} sqm`, icon: <Ruler size={16} /> }] : []),
    ...(locationLabel ? [{ label: "Location", value: locationLabel, icon: <MapPin size={16} /> }] : []),
  ]

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-5", className)}>
      {items.map((item) => (
        <div key={`${item.label}-${item.value}`} className="rounded-2xl border border-divider bg-surface/85 px-4 py-3 shadow-sm backdrop-blur">
          <div className="mb-2 flex items-center gap-2 text-text-secondary">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">{item.icon}</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em]">{item.label}</span>
          </div>
          <p className="text-sm font-semibold text-text-primary">{item.value}</p>
        </div>
      ))}
    </div>
  )
}

export function PropertySpecList({ items, className }: PropertySpecListProps) {
  const visibleItems = items.filter((item) => item.value.trim().length > 0)
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {visibleItems.map((item) => (
        <div key={item.label} className="rounded-2xl border border-divider bg-background px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">{item.label}</p>
          <p className="mt-1 text-sm font-semibold text-text-primary">{item.value}</p>
        </div>
      ))}
    </div>
  )
}

export function PropertyMapCard({
  area,
  city,
  country,
  addressLine1,
  addressLine2,
  nearbyPlaces = [],
  className,
}: PropertyMapCardProps) {
  const address = [addressLine1, addressLine2, area, city, country].filter(Boolean).join(", ")

  return (
    <Card className={cn("overflow-hidden rounded-[2rem] border border-divider p-0 shadow-sm", className)}>
      <div className="border-b border-divider bg-gradient-to-br from-primary/10 via-transparent to-accent/10 px-6 py-5">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-primary shadow-sm">
            <MapPin size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary">Location</p>
            <h3 className="text-lg font-bold text-text-primary">{[area, city].filter(Boolean).join(", ") || country}</h3>
          </div>
        </div>
        <p className="max-w-2xl text-sm text-text-secondary">{address || "Add the property address or area details from the editor."}</p>
      </div>
      <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="flex min-h-[220px] items-center justify-center rounded-[1.75rem] border border-dashed border-primary/20 bg-background">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Globe size={22} />
            </div>
            <p className="text-sm font-semibold text-text-primary">Map-ready location card</p>
            <p className="mt-1 text-xs text-text-secondary">Use this space for a static map image or future embedded map integration.</p>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary">Nearby Places</p>
          {nearbyPlaces.length > 0 ? (
            nearbyPlaces.map((place) => (
              <div key={place} className="flex items-center gap-3 rounded-2xl border border-divider bg-background px-4 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 size={16} />
                </span>
                <span className="text-sm font-medium text-text-primary">{place}</span>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-divider bg-background px-4 py-5 text-sm text-text-secondary">
              Add schools, retail, transit, and landmarks to strengthen the location story.
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export function PropertyAgentCard({
  agentName,
  role,
  agencyName,
  bio,
  agentPhotoUrl,
  contacts,
  className,
}: PropertyAgentCardProps) {
  const visibleContacts = contacts.filter((contact) => contact.value.trim().length > 0)
  const primaryContact =
    visibleContacts.find((contact) => contact.type === "phone") ||
    visibleContacts.find((contact) => contact.type === "whatsapp") ||
    visibleContacts.find((contact) => contact.type === "email") ||
    visibleContacts[0]
  const secondaryContact = visibleContacts.find((contact) => contact.id !== primaryContact?.id)

  return (
    <Card className={cn("overflow-hidden rounded-[2rem] border border-divider p-0 shadow-premium", className)}>
      <div className="border-b border-divider bg-[radial-gradient(circle_at_top_right,rgba(109,40,217,0.18),transparent_38%),linear-gradient(135deg,rgba(17,24,39,0.97),rgba(31,41,55,0.94))] px-6 py-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-2 shadow-sm backdrop-blur">
            <Avatar src={agentPhotoUrl || undefined} name={agentName || "Agent"} size={88} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">Listing Advisor</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-white">{agentName || "Property Consultant"}</h3>
            {(role || agencyName) ? <p className="mt-2 text-sm font-medium text-white/75">{[role, agencyName].filter(Boolean).join(" • ")}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {role ? <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">{role}</span> : null}
              {agencyName ? <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">{agencyName}</span> : null}
              <span className="rounded-full border border-primary/20 bg-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white">
                Available for inquiries
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-5 px-6 py-6">
        {bio ? (
          <div className="rounded-[1.6rem] border border-divider bg-background px-5 py-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">Professional Summary</p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{bio}</p>
          </div>
        ) : null}
        <div className="grid gap-3">
          {primaryContact ? (
            <a
              href={buildPropertyContactHref(primaryContact)}
              target={primaryContact.type === "website" ? "_blank" : undefined}
              rel={primaryContact.type === "website" ? "noreferrer" : undefined}
              className="flex items-center justify-between gap-3 rounded-[1.5rem] bg-primary px-5 py-4 text-white shadow-premium transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                  {primaryContact.type === "phone" ? <Phone size={18} /> : primaryContact.type === "whatsapp" ? <MessageCircle size={18} /> : primaryContact.type === "email" ? <Mail size={18} /> : <Globe size={18} />}
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">Preferred Contact</p>
                  <p className="text-sm font-semibold">{primaryContact.label || primaryContact.value}</p>
                </div>
              </div>
              <ArrowRight size={18} />
            </a>
          ) : null}
          {secondaryContact ? (
            <a
              href={buildPropertyContactHref(secondaryContact)}
              target={secondaryContact.type === "website" ? "_blank" : undefined}
              rel={secondaryContact.type === "website" ? "noreferrer" : undefined}
              className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-divider bg-background px-5 py-4 text-text-primary transition-colors hover:border-primary/30 hover:text-primary"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  {secondaryContact.type === "phone" ? <Phone size={18} /> : secondaryContact.type === "whatsapp" ? <MessageCircle size={18} /> : secondaryContact.type === "email" ? <Mail size={18} /> : <Globe size={18} />}
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">Alternate Contact</p>
                  <p className="text-sm font-semibold">{secondaryContact.label || secondaryContact.value}</p>
                </div>
              </div>
              <ArrowRight size={18} />
            </a>
          ) : null}
        </div>
        {visibleContacts.length > 0 ? (
          <div className="grid gap-3">
            {visibleContacts.map((contact) => (
              <a
                key={contact.id}
                href={buildPropertyContactHref(contact)}
                target={contact.type === "website" ? "_blank" : undefined}
                rel={contact.type === "website" ? "noreferrer" : undefined}
                className="flex items-center gap-3 rounded-2xl border border-divider bg-surface px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:border-primary/30 hover:text-primary"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  {contact.type === "phone" ? <Phone size={16} /> : contact.type === "whatsapp" ? <MessageCircle size={16} /> : contact.type === "email" ? <Mail size={16} /> : contact.type === "website" ? <Globe size={16} /> : <House size={16} />}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">{contact.type}</p>
                  <p className="truncate">{contact.label || contact.value}</p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-divider bg-background px-4 py-5 text-sm text-text-secondary">
            Contact details will appear here once the listing agent info is added in the editor.
          </div>
        )}
      </div>
    </Card>
  )
}

export function PropertyTemplatePreview({
  title,
  status,
  propertyType,
  price,
  currency,
  pricing,
  beds,
  baths,
  areaSqm,
  locationLabel,
  highlights = [],
  className,
  embedded = false,
}: PropertyTemplatePreviewProps) {
  return (
    <div
      className={cn(
        embedded
          ? "h-full overflow-hidden rounded-[1.2rem] border border-white/60 bg-surface/90 shadow-sm"
          : "overflow-hidden rounded-[1.6rem] border border-divider bg-surface shadow-sm transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-premium",
        className
      )}
    >
      <div className={cn(
        "relative overflow-hidden border-b border-divider bg-[radial-gradient(circle_at_top_right,rgba(109,40,217,0.18),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(255,51,102,0.12),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(249,250,251,0.92))] px-5 py-5",
        embedded && "px-4 py-4"
      )}>
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="relative space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-text-secondary">{propertyType.replace(/_/g, " ")}</p>
              <h3 className="mt-1 text-lg font-bold leading-tight text-text-primary">{title}</h3>
            </div>
            <PropertyStatusBadge status={status} />
          </div>
          <div className="rounded-[1.4rem] border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">Listing Preview</p>
                <p className="mt-1 text-xl font-bold text-text-primary">{formatPropertyPrice(price, currency)}</p>
              </div>
              <div className="rounded-2xl bg-primary/10 px-3 py-2 text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">{formatPropertyPriceMeta(pricing)}</p>
                <p className="text-xs font-semibold text-text-primary">{locationLabel}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <PreviewMetric label="Beds" value={beds ? `${beds}` : "—"} icon={<BedDouble size={14} />} />
              <PreviewMetric label="Baths" value={baths ? `${baths}` : "—"} icon={<Bath size={14} />} />
              <PreviewMetric label="Area" value={areaSqm ? `${areaSqm} sqm` : "—"} icon={<Ruler size={14} />} />
            </div>
          </div>
        </div>
      </div>
      <div className={cn("space-y-4 px-5 py-5", embedded && "px-4 py-4")}>
        <div className="flex flex-wrap gap-2">
          {highlights.slice(0, 3).map((highlight) => (
            <span key={highlight} className="rounded-full border border-divider bg-background px-3 py-1 text-[11px] font-semibold text-text-secondary">
              {highlight}
            </span>
          ))}
        </div>
        <p className="text-sm leading-6 text-text-secondary">
          Premium property storytelling with hero facts, gallery, specs, location, documents, and agent contact built into the page flow.
        </p>
      </div>
    </div>
  )
}

function PreviewMetric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-divider bg-background px-3 py-3">
      <div className="mb-2 flex items-center gap-2 text-text-secondary">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-[0.14em]">{label}</span>
      </div>
      <p className="text-sm font-semibold text-text-primary">{value}</p>
    </div>
  )
}
