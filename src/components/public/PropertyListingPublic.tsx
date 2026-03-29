import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { PropertyGalleryCarousel } from "@/components/public/PropertyGalleryCarousel"
import {
  PropertyAgentCard,
  PropertyFactBar,
  PropertyMapCard,
  PropertySpecList,
  PropertyStatusBadge,
} from "@/components/ui/PropertyListingKit"
import {
  buildPropertyContactHref,
  formatPropertyPrice,
  getPropertyListingSections,
  type PropertyDocumentItem,
} from "@/lib/property-listing"
import { ExternalLink, FileText, ImageIcon } from "lucide-react"

function ensureProtocol(url?: string) {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/") || url.startsWith("data:")) return url
  return `https://${url}`
}

type PropertyListingPublicPage = {
  title: string | null
  handle: string
  blocks: Array<{
    type: string
    content: unknown
  }>
}

export function PropertyListingPublic({ page }: { page: PropertyListingPublicPage }) {
  const normalizedBlocks = (page.blocks || []).map((block) => ({
    type: block.type,
    content: typeof block.content === "object" && block.content && !Array.isArray(block.content) ? (block.content as Record<string, unknown>) : {},
  }))
  const sections = getPropertyListingSections(normalizedBlocks)
  const galleryImages = sections.gallery.images
    .filter((image) => image.url.trim().length > 0)
    .map((image) => ({ ...image, url: ensureProtocol(image.url) }))
  const documentItems = sections.documents.items.filter((item) => item.url.trim().length > 0)
  const primaryContact = sections.agent.contacts.find((contact) => contact.type === "phone" || contact.type === "whatsapp" || contact.type === "email")
  const specItems = [
    { label: "Property Type", value: sections.details.propertyType.replace(/_/g, " ") },
    { label: "Bedrooms", value: sections.details.beds ? `${sections.details.beds}` : "" },
    { label: "Bathrooms", value: sections.details.baths ? `${sections.details.baths}` : "" },
    { label: "Toilets", value: sections.details.toilets ? `${sections.details.toilets}` : "" },
    { label: "Covered Area", value: sections.details.coveredAreaSqm ? `${sections.details.coveredAreaSqm} sqm` : "" },
    { label: "Land Area", value: sections.details.landAreaSqm ? `${sections.details.landAreaSqm} sqm` : "" },
    { label: "Floor", value: sections.details.floor || "" },
    { label: "Year Built", value: sections.details.yearBuilt || "" },
    { label: "Furnishing", value: sections.details.furnishing.replace(/_/g, " ") },
    { label: "Tenure", value: sections.details.tenure || "" },
  ]

  return (
    <div className="min-h-screen bg-background px-4 py-8 text-text-primary sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-divider bg-surface shadow-premium">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
            <div className="relative min-h-[340px] border-b border-divider bg-[radial-gradient(circle_at_top_right,rgba(109,40,217,0.18),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(255,51,102,0.12),transparent_30%),linear-gradient(135deg,rgba(17,24,39,0.94),rgba(31,41,55,0.92))] lg:min-h-[520px] lg:border-b-0 lg:border-r">
              {sections.hero.heroImageUrl ? (
                <div
                  className="absolute inset-0 h-full w-full bg-cover bg-center opacity-75"
                  style={{ backgroundImage: `url("${ensureProtocol(sections.hero.heroImageUrl).replace(/"/g, '\\"')}")` }}
                  role="img"
                  aria-label={sections.hero.title || page.title || page.handle}
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/35 to-slate-900/15" />
              <div className="relative flex h-full flex-col justify-end gap-5 p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-3">
                  <PropertyStatusBadge status={sections.hero.status} />
                  {sections.pricing.availabilityStatus !== "available" ? (
                    <Badge variant="warning" className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em]">
                      {sections.pricing.availabilityStatus.replace(/_/g, " ")}
                    </Badge>
                  ) : null}
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/70">{sections.hero.propertyType.replace(/_/g, " ")}</p>
                  <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                    {sections.hero.title || page.title || page.handle}
                  </h1>
                  {sections.hero.tagline ? <p className="mt-3 max-w-2xl text-base text-white/80 sm:text-lg">{sections.hero.tagline}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sections.hero.highlightBadges.map((badge) => (
                    <span key={badge} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary">Listing Snapshot</p>
                  <p className="mt-2 text-3xl font-black tracking-tight text-text-primary">
                    {formatPropertyPrice(sections.pricing.price, sections.pricing.currency)}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {sections.pricing.listingType === "rent" ? `Rental • ${sections.pricing.period.replace("_", " ")}` : "Sale listing"}
                  </p>
                </div>
                <PropertyFactBar
                  price={sections.pricing.price}
                  currency={sections.pricing.currency}
                  pricing={sections.pricing}
                  beds={sections.hero.beds}
                  baths={sections.hero.baths}
                  areaSqm={sections.hero.areaSqm}
                  locationLabel={sections.hero.locationLabel}
                  className="xl:grid-cols-2"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                {primaryContact ? (
                  <a
                    href={buildPropertyContactHref(primaryContact)}
                    target={primaryContact.type === "website" ? "_blank" : undefined}
                    rel={primaryContact.type === "website" ? "noreferrer" : undefined}
                    className="btn-primary inline-flex min-h-12 items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold"
                  >
                    Request Viewing
                  </a>
                ) : null}
                {sections.agent.contacts.map((contact) => (
                  <a
                    key={contact.id}
                    href={buildPropertyContactHref(contact)}
                    target={contact.type === "website" ? "_blank" : undefined}
                    rel={contact.type === "website" ? "noreferrer" : undefined}
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-divider bg-background px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    {contact.label || contact.value}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {galleryImages.length > 0 ? <PropertyGalleryCarousel title={sections.hero.title || page.title || page.handle} images={galleryImages} /> : null}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
          <div className="space-y-8">
            <Card className="rounded-[2rem] border border-divider p-6 shadow-sm sm:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary">Overview</p>
              <h2 className="mt-2 text-2xl font-bold text-text-primary">Why this property stands out</h2>
              <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-text-secondary">{sections.overview.overviewText}</p>
              {sections.overview.highlights.length > 0 ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {sections.overview.highlights.map((highlight) => (
                    <div key={highlight} className="rounded-2xl border border-divider bg-background px-4 py-3 text-sm font-semibold text-text-primary">
                      {highlight}
                    </div>
                  ))}
                </div>
              ) : null}
            </Card>

            <Card className="rounded-[2rem] border border-divider p-6 shadow-sm sm:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary">Details & Specs</p>
              <h2 className="mt-2 text-2xl font-bold text-text-primary">Everything buyers need at a glance</h2>
              <PropertySpecList className="mt-6" items={specItems} />
              {sections.details.buildingFeatures.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {sections.details.buildingFeatures.map((feature) => (
                    <span key={feature} className="rounded-full border border-divider bg-background px-3 py-1.5 text-xs font-semibold text-text-secondary">
                      {feature}
                    </span>
                  ))}
                </div>
              ) : null}
            </Card>

            <PropertyMapCard
              area={sections.location.area}
              city={sections.location.city}
              country={sections.location.country}
              addressLine1={sections.location.addressLine1}
              addressLine2={sections.location.addressLine2}
              nearbyPlaces={sections.location.nearbyPlaces}
            />

            {documentItems.length > 0 ? (
              <Card className="rounded-[2rem] border border-divider p-6 shadow-sm sm:p-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary">Floor Plans & Documents</p>
                <h2 className="mt-2 text-2xl font-bold text-text-primary">Ready-to-share assets</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {documentItems.map((item) => (
                    <DocumentCard key={item.id} item={item} />
                  ))}
                </div>
              </Card>
            ) : null}
          </div>

          <div className="space-y-8">
            <Card className="rounded-[2rem] border border-divider p-6 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary">Pricing & Availability</p>
              <h2 className="mt-2 text-2xl font-bold text-text-primary">Terms</h2>
              <div className="mt-5 rounded-[1.6rem] border border-divider bg-background p-5">
                <p className="text-3xl font-black tracking-tight text-text-primary">
                  {formatPropertyPrice(sections.pricing.price, sections.pricing.currency)}
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  {sections.pricing.listingType === "rent" ? `Billed per ${sections.pricing.period.replace("_", " ")}` : "One-time asking price"}
                </p>
                {sections.pricing.notes ? <p className="mt-4 text-sm leading-6 text-text-secondary">{sections.pricing.notes}</p> : null}
              </div>
              {sections.pricing.serviceChargeAmount ? (
                <div className="mt-4 rounded-2xl border border-divider bg-background px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">Service Charge</p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">
                    {formatPropertyPrice(sections.pricing.serviceChargeAmount, sections.pricing.currency)} / {sections.pricing.serviceChargePeriod}
                  </p>
                  {sections.pricing.serviceChargeDescription ? <p className="mt-2 text-sm text-text-secondary">{sections.pricing.serviceChargeDescription}</p> : null}
                </div>
              ) : null}
            </Card>

            <PropertyAgentCard
              agentName={sections.agent.agentName}
              role={sections.agent.role}
              agencyName={sections.agent.agencyName}
              bio={sections.agent.bio}
              agentPhotoUrl={sections.agent.agentPhotoUrl}
              contacts={sections.agent.contacts}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function DocumentCard({ item }: { item: PropertyDocumentItem }) {
  return (
    <a
      href={ensureProtocol(item.url)}
      target="_blank"
      rel="noreferrer"
      className="group rounded-[1.6rem] border border-divider bg-background p-5 transition-colors hover:border-primary/30"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {item.type === "floorplan" ? <ImageIcon size={20} /> : <FileText size={20} />}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">{item.type.replace(/_/g, " ")}</p>
      <h3 className="mt-2 text-lg font-bold text-text-primary">{item.title}</h3>
      <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
        View document <ExternalLink size={14} />
      </p>
    </a>
  )
}
