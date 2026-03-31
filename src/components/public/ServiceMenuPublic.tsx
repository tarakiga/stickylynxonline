"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { currencySymbol } from "@/lib/utils";
import type { EditorPage } from "@/types/editor-page";
import { findEditorBlock } from "@/types/editor-page";
import type {
  AboutTrustContent,
  BookingContent,
  ContactType,
  FaqContent,
  FeaturedServicesContent,
  LocationContactContent,
  ServiceCategoriesContent,
  ServiceContact,
  ServiceHeroContent,
  TestimonialsContent,
} from "@/lib/service-menu";
import {
  AtSign,
  Camera,
  CalendarClock,
  Clock3,
  Globe,
  MapPin,
  MessageCircle,
  Phone,
  Star,
} from "lucide-react";

function ensureProtocol(url?: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/") || url.startsWith("data:")) return url;
  return `https://${url}`;
}

type ServiceMenuPage = EditorPage & {
  user?: {
    currencyCode?: string | null
    email?: string | null
  } | null
}

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function ContactIcon({ type }: { type: ContactType }) {
  if (type === "email") return <AtSign size={16} />;
  if (type === "whatsapp") return <MessageCircle size={16} />;
  if (type === "instagram") return <Camera size={16} />;
  if (type === "website") return <Globe size={16} />;
  return <Phone size={16} />;
}

export function ServiceMenuPublic({ page }: { page: ServiceMenuPage }) {
  const blocks = page.blocks || [];
  const hero = (findEditorBlock(blocks, "TEXT", "service_hero")?.content || {}) as Partial<ServiceHeroContent>;
  const about = (findEditorBlock(blocks, "TEXT", "about_trust")?.content || {}) as Partial<AboutTrustContent>;
  const services = (findEditorBlock(blocks, "GRID", "service_categories")?.content || {}) as Partial<ServiceCategoriesContent>;
  const featured = (findEditorBlock(blocks, "GRID", "featured_services")?.content || {}) as Partial<FeaturedServicesContent>;
  const booking = (findEditorBlock(blocks, "GRID", "booking")?.content || {}) as Partial<BookingContent>;
  const location = (findEditorBlock(blocks, "CONTACT", "location_contact")?.content || {}) as Partial<LocationContactContent>;
  const testimonials = (findEditorBlock(blocks, "GRID", "testimonials")?.content || {}) as Partial<TestimonialsContent>;
  const faq = (findEditorBlock(blocks, "GRID", "faq")?.content || {}) as Partial<FaqContent>;

  const userCurrency = page.user?.currencyCode || "USD";
  const symbol = currencySymbol(userCurrency);
  const allCategories = services.categories || [];
  const [query, setQuery] = React.useState("");
  const [showBookingModal, setShowBookingModal] = React.useState(false);
  const [bookingSent, setBookingSent] = React.useState(false);
  const [bookingLoading, setBookingLoading] = React.useState(false);
  const [bookingName, setBookingName] = React.useState("");
  const [bookingEmail, setBookingEmail] = React.useState("");
  const [bookingPhone, setBookingPhone] = React.useState("");
  const [bookingService, setBookingService] = React.useState("");
  const [bookingDate, setBookingDate] = React.useState("");
  const [bookingTime, setBookingTime] = React.useState("");
  const [bookingMessage, setBookingMessage] = React.useState("");

  const serviceOptions = allCategories.flatMap((category) =>
    (category.services || []).map((service) => ({
      id: service.id,
      label: `${service.name}${category.name ? ` • ${category.name}` : ""}`,
    }))
  );

  const filteredCategories = allCategories
    .map((category) => {
      const filteredServices = (category.services || []).filter((service) => {
        if (!query.trim()) return true;
        const needle = query.toLowerCase();
        return (
          (service.name || "").toLowerCase().includes(needle) ||
          (service.description || "").toLowerCase().includes(needle) ||
          (service.tags || []).join(",").toLowerCase().includes(needle)
        );
      });
      return { ...category, services: filteredServices };
    })
    .filter((category) => (category.services || []).length > 0 || !query.trim());

  const accordionItems = filteredCategories.map((category) => ({
    id: category.id,
    title: category.name || "Category",
    content: (
      <div className="space-y-3">
        {(category.services || []).map((service) => {
          const priceType = service.priceType || "fixed";
          const primaryPrice = typeof service.price === "number" ? `${symbol}${service.price.toLocaleString()}` : "Quote";
          const secondaryPrice =
            priceType === "range" && typeof service.maxPrice === "number"
              ? `${symbol}${service.maxPrice.toLocaleString()}`
              : null;

          return (
            <div key={service.id} className="rounded-2xl border border-divider bg-background p-4 space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-text-primary">{service.name}</h4>
                    {(service.tags || []).map((tag) => (
                      <Badge key={`${service.id}-${tag}`} variant="neutral" className="text-[10px] px-1.5 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {service.description ? <p className="text-sm text-text-secondary leading-relaxed">{service.description}</p> : null}
                </div>
                <div className="rounded-2xl border border-divider bg-surface px-4 py-3 min-w-[150px]">
                  <div className="text-lg font-black text-text-primary">
                    {priceType === "from" ? `From ${primaryPrice}` : priceType === "range" && secondaryPrice ? `${primaryPrice} – ${secondaryPrice}` : primaryPrice}
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-text-secondary">
                    <Clock3 size={12} />
                    {service.durationMinutes ? `${service.durationMinutes} mins` : "Flexible"}
                  </div>
                </div>
              </div>
              {(booking.bookingMode || "internal") !== "external" ? (
                <Button
                  variant="primary"
                  className="rounded-xl px-4 py-2 text-xs font-bold border-none cursor-pointer text-white"
                  onClick={() => {
                    setBookingService(service.id);
                    setShowBookingModal(true);
                  }}
                >
                  {hero.primaryCtaLabel || booking.internalButtonLabel || "Book now"}
                </Button>
              ) : null}
            </div>
          );
        })}
      </div>
    ),
  }));

  async function submitBooking() {
    if (!bookingName.trim() || !bookingEmail.trim()) return;
    setBookingLoading(true);
    try {
      const response = await fetch(`/api/bookings/${page.handle}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bookingName.trim(),
          email: bookingEmail.trim(),
          phone: bookingPhone.trim(),
          serviceId: bookingService,
          date: bookingDate,
          time: bookingTime,
          message: bookingMessage.trim(),
        }),
      });

      if (response.ok) {
        setBookingSent(true);
      } else {
        const payload = await response.json().catch(() => null);
        alert(payload?.error || "Unable to send booking request.");
      }
    } finally {
      setBookingLoading(false);
    }
  }

  return (
    <div className="max-w-screen-md mx-auto min-h-screen bg-background text-text-primary px-4 py-8 pb-24 space-y-6">
      <header className="space-y-4 text-center">
        {hero.heroImageUrl ? (
          <div className="w-full h-48 sm:h-64 rounded-[2rem] overflow-hidden border border-divider">
            <img src={ensureProtocol(hero.heroImageUrl)} alt={hero.businessName || page.title || page.handle} className="w-full h-full object-cover" />
          </div>
        ) : null}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/20 shadow-sm">
            <CalendarClock size={14} />
            Service Menu & Booking
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{hero.businessName || page.title || page.handle}</h1>
          {hero.headline ? <p className="text-lg font-semibold text-text-primary">{hero.headline}</p> : null}
          {hero.roleOrTagline ? <p className="text-text-secondary font-medium">{hero.roleOrTagline}</p> : null}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="primary" className="rounded-2xl px-6 py-2.5 text-sm font-bold shadow-sm border-none cursor-pointer" onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}>
            View services
          </Button>
          {(booking.bookingMode || "internal") !== "external" ? (
            <Button variant="secondary" className="rounded-2xl px-6 py-2.5 text-sm font-bold shadow-sm cursor-pointer" onClick={() => setShowBookingModal(true)}>
              {hero.primaryCtaLabel || booking.internalButtonLabel || "Book now"}
            </Button>
          ) : null}
        </div>
      </header>

      {(about.aboutText || about.speciality || about.serviceArea || about.qualifications?.length || about.certifications?.length || about.brandsUsed?.length) ? (
        <Card className="rounded-[2rem] border border-divider shadow-premium p-6 bg-surface space-y-4">
          <h2 className="text-xl font-bold">About & Trust</h2>
          {about.aboutText ? <p className="text-text-secondary leading-relaxed">{about.aboutText}</p> : null}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {about.speciality ? <MetricPill label="Speciality" value={about.speciality} /> : null}
            {about.serviceArea ? <MetricPill label="Service Area" value={about.serviceArea} /> : null}
            {about.yearsInBusiness ? <MetricPill label="Experience" value={about.yearsInBusiness} /> : null}
          </div>
          {about.qualifications?.length ? <TagList title="Qualifications" items={about.qualifications} /> : null}
          {about.certifications?.length ? <TagList title="Certifications" items={about.certifications} /> : null}
          {about.brandsUsed?.length ? <TagList title="Brands Used" items={about.brandsUsed} /> : null}
        </Card>
      ) : null}

      {(featured.items || []).length > 0 ? (
        <Card className="rounded-[2rem] border border-divider shadow-sm p-6 bg-surface">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{featured.title || "Popular packages"}</h2>
            <Badge variant="success">{(featured.items || []).length}</Badge>
          </div>
          <div className="space-y-3">
            {(featured.items || []).map((item) => (
              <div key={item.id} className="rounded-2xl border border-divider bg-background p-4 space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-bold text-text-primary">{item.name}</h3>
                    {item.description ? <p className="text-sm text-text-secondary mt-1">{item.description}</p> : null}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-text-primary">{symbol}{Number(item.price || 0).toLocaleString()}</div>
                    {item.totalDurationMinutes ? <div className="text-xs font-semibold text-text-secondary">{item.totalDurationMinutes} mins</div> : null}
                  </div>
                </div>
                {(item.includes || []).length ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(item.includes || []).map((entry) => (
                      <Badge key={`${item.id}-${entry}`} variant="neutral" className="text-[10px] px-1.5 py-0">
                        {entry}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="rounded-[2rem] border border-divider shadow-sm p-6 bg-surface space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Booking & Availability</h2>
            {booking.introText ? <p className="text-sm text-text-secondary mt-1">{booking.introText}</p> : null}
          </div>
          {booking.nextAvailableText ? <Badge variant="primary">{booking.nextAvailableText}</Badge> : null}
        </div>
        {booking.busyDays?.length ? (
          <div className="flex flex-wrap gap-2">
            {dayLabels.map((day, index) => (
              <Badge key={day} variant={booking.busyDays?.includes(index) ? "warning" : "neutral"}>
                {day}{booking.busyDays?.includes(index) ? " Busy" : ""}
              </Badge>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-3">
          {(booking.bookingMode || "internal") !== "external" ? (
            <Button variant="primary" className="rounded-2xl px-6 py-2.5 text-sm font-bold shadow-sm border-none cursor-pointer" onClick={() => setShowBookingModal(true)}>
              {booking.internalButtonLabel || "Book now"}
            </Button>
          ) : null}
          {(booking.bookingLinks || []).map((link) => (
            <a
              key={link.id}
              href={ensureProtocol(link.url)}
              target="_blank"
              rel="noopener noreferrer"
              className={link.emphasis === "primary" ? "btn-primary rounded-2xl px-6 py-2.5 text-sm font-bold border-none" : "inline-flex items-center justify-center rounded-2xl px-6 py-2.5 text-sm font-bold border border-divider bg-background text-text-primary"}
            >
              {link.label}
            </a>
          ))}
        </div>
        {booking.policies ? <p className="text-sm text-text-secondary leading-relaxed">{booking.policies}</p> : null}
      </Card>

      <Card id="services" className="rounded-[2rem] border border-divider shadow-sm p-6 bg-surface">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-xl font-bold">Services</h2>
          <div className="w-full sm:w-64">
            <Input placeholder="Search services…" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
        </div>
        <Accordion items={accordionItems} defaultOpenId={(services.defaultOpenCategoryIds || [])[0]} />
      </Card>

      {(location.locations || []).length || (location.contacts || []).length || location.serviceAreaText ? (
        <Card className="rounded-[2rem] border border-divider shadow-sm p-6 bg-surface space-y-4">
          <h2 className="text-xl font-bold">Location & Contact</h2>
          {location.serviceAreaText ? <p className="text-sm text-text-secondary">{location.serviceAreaText}</p> : null}
          {(location.locations || []).length ? (
            <div className="space-y-3">
              {(location.locations || []).map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-divider bg-background p-4">
                  <div className="inline-flex items-center gap-2 text-sm font-bold text-text-primary">
                    <MapPin size={14} />
                    {entry.name || "Location"}
                  </div>
                  <p className="text-sm text-text-secondary mt-2">{[entry.address, entry.city, entry.country].filter(Boolean).join(", ")}</p>
                </div>
              ))}
            </div>
          ) : null}
          {(location.contacts || []).length ? (
            <div className="flex flex-wrap gap-3">
              {(location.contacts || []).map((entry) => (
                <ContactButton key={entry.id} contact={entry} />
              ))}
            </div>
          ) : null}
        </Card>
      ) : null}

      {(testimonials.items || []).length > 0 ? (
        <Card className="rounded-[2rem] border border-divider shadow-sm p-6 bg-surface">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Reviews</h2>
            <Badge variant="success">{(testimonials.items || []).length}</Badge>
          </div>
          <div className="space-y-3">
            {(testimonials.items || []).map((item) => (
              <div key={item.id} className="rounded-2xl border border-divider bg-background p-4 space-y-2">
                <div className="flex items-center gap-1 text-warning">
                  {Array.from({ length: Math.max(1, Math.min(5, item.rating || 5)) }).map((_, index) => (
                    <Star key={`${item.id}-${index}`} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="text-text-primary font-medium leading-relaxed">&quot;{item.quote}&quot;</p>
                <p className="text-sm font-semibold text-text-secondary">{item.source}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {(faq.items || []).length > 0 ? (
        <Card className="rounded-[2rem] border border-divider shadow-sm p-6 bg-surface">
          <h2 className="text-xl font-bold mb-4">FAQ</h2>
          <Accordion
            items={(faq.items || []).map((item) => ({
              id: item.id,
              title: item.question,
              content: <p className="text-sm text-text-secondary leading-relaxed">{item.answer}</p>,
            }))}
          />
        </Card>
      ) : null}

      <footer className="text-center pt-4">
        <p className="text-xs text-text-secondary font-bold tracking-[0.2em] uppercase opacity-50">Powered by Stickylynx</p>
      </footer>

      <Modal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setBookingSent(false);
        }}
        title={bookingSent ? "Request Sent" : "Book an Appointment"}
        description={bookingSent ? booking.confirmationMessage || "Thanks for your request. We will confirm your appointment shortly." : "Choose a service and share your preferred slot."}
        icon={bookingSent ? "success" : "info"}
      >
        {!bookingSent ? (
          <div className="w-full space-y-3 !mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input labelInside="Full Name" value={bookingName} onChange={(event) => setBookingName(event.target.value)} />
              <Input labelInside="Email" type="email" value={bookingEmail} onChange={(event) => setBookingEmail(event.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input labelInside="Phone" value={bookingPhone} onChange={(event) => setBookingPhone(event.target.value)} />
              <select className="input-base px-4 py-3 bg-background" value={bookingService} onChange={(event) => setBookingService(event.target.value)}>
                <option value="">Select service</option>
                {serviceOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input labelInside="Preferred Date" type="date" value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} />
              <Input labelInside="Preferred Time" type="time" value={bookingTime} onChange={(event) => setBookingTime(event.target.value)} />
            </div>
            <Textarea rows={4} value={bookingMessage} onChange={(event) => setBookingMessage(event.target.value)} placeholder="Tell us anything we should know before confirming." />
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" onClick={() => setShowBookingModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={submitBooking} disabled={bookingLoading || !bookingName.trim() || !bookingEmail.trim()}>
                {bookingLoading ? "Sending…" : "Send Request"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full text-sm text-text-secondary !mt-4">
            <p>Your booking request has been delivered.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-divider bg-background px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">{label}</p>
      <p className="text-sm font-semibold text-text-primary mt-1">{value}</p>
    </div>
  );
}

function TagList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-text-primary">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={`${title}-${item}`} variant="neutral">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ContactButton({ contact }: { contact: ServiceContact }) {
  const href =
    contact.type === "email"
      ? `mailto:${contact.value}`
      : contact.type === "phone"
      ? `tel:${contact.value}`
      : contact.type === "whatsapp"
      ? `https://wa.me/${contact.value.replace(/\D/g, "")}`
      : ensureProtocol(contact.value);

  return (
    <a href={href} target={contact.type === "email" || contact.type === "phone" ? undefined : "_blank"} rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-divider bg-background px-4 py-2.5 text-sm font-semibold text-text-primary">
      <ContactIcon type={contact.type} />
      {contact.label || contact.value}
    </a>
  );
}
