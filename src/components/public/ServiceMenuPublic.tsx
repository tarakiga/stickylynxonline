"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { StepProgress } from "@/components/ui/Progress";
import { currencySymbol } from "@/lib/utils";
import type { EditorPage } from "@/types/editor-page";
import { findEditorBlock } from "@/types/editor-page";
import { overlaps, parseTimeToMinutes, type BookingStatus } from "@/lib/service-bookings";
import type {
  AboutTrustContent,
  BookingSchedule,
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
import { createDefaultBookingSchedule } from "@/lib/service-menu";
import {
  AtSign,
  Camera,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Globe,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
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

type PublicBookingSlot = {
  id: string
  status: BookingStatus
  serviceId: string
  bookingDate: string
  bookingTime: string
  bookingStartMinutes: number
  bookingEndMinutes: number
}

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function asArray<T = unknown>(value: unknown) {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toDateKey(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function startOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function addDays(value: Date, amount: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + amount);
  return next;
}

function addMonths(value: Date, amount: number) {
  return new Date(value.getFullYear(), value.getMonth() + amount, 1);
}

function formatMinutes(value: number) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHours = hours % 12 || 12;
  return `${normalizedHours}:${`${minutes}`.padStart(2, "0")} ${suffix}`;
}

function formatLongDate(value: Date) {
  return new Intl.DateTimeFormat(undefined, { weekday: "long", month: "short", day: "numeric" }).format(value);
}

function normalizeBookingSchedule(value: unknown, busyDays: number[]): BookingSchedule {
  const defaults = createDefaultBookingSchedule();
  const record = asRecord(value) || {};
  const weeklyAvailability = defaults.weeklyAvailability.map((defaultEntry) => {
    const source = asArray(record.weeklyAvailability).map((entry) => asRecord(entry)).find((entry) => entry && asNumber(entry.day, -1) === defaultEntry.day);
    return {
      day: defaultEntry.day,
      enabled: typeof source?.enabled === "boolean" ? source.enabled : !busyDays.includes(defaultEntry.day) && defaultEntry.enabled,
      start: asString(source?.start, defaultEntry.start),
      end: asString(source?.end, defaultEntry.end),
    };
  });

  return {
    slotIntervalMinutes: Math.max(5, asNumber(record.slotIntervalMinutes, defaults.slotIntervalMinutes)),
    maxAdvanceDays: Math.max(1, asNumber(record.maxAdvanceDays, defaults.maxAdvanceDays)),
    weeklyAvailability,
    dateOverrides: asArray(record.dateOverrides)
      .map((entry) => {
        const item = asRecord(entry) || {};
        const date = asString(item.date);
        if (!date) return null;
        return {
          id: asString(item.id, date),
          date,
          enabled: typeof item.enabled === "boolean" ? item.enabled : false,
          start: asString(item.start, "09:00"),
          end: asString(item.end, "17:00"),
          label: asString(item.label),
        };
      })
      .filter((entry): entry is BookingSchedule["dateOverrides"][number] => !!entry),
  };
}

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
  const allCategories = React.useMemo(() => services.categories || [], [services.categories]);
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
  const [calendarMonth, setCalendarMonth] = React.useState(startOfMonth(new Date()));
  const [bookingStep, setBookingStep] = React.useState(1);
  const [existingBookings, setExistingBookings] = React.useState<PublicBookingSlot[]>([]);
  const [existingBookingsLoading, setExistingBookingsLoading] = React.useState(false);

  const bookingSchedule = React.useMemo(
    () => normalizeBookingSchedule(booking.schedule, asArray(booking.busyDays).filter((day): day is number => typeof day === "number")),
    [booking.schedule, booking.busyDays]
  );

  const loadExistingBookings = React.useCallback(async () => {
    setExistingBookingsLoading(true);
    try {
      const response = await fetch(`/api/bookings/${page.handle}`, { cache: "no-store" });
      if (!response.ok) {
        setExistingBookings([]);
        return;
      }

      const payload = await response.json().catch(() => null);
      setExistingBookings(asArray<PublicBookingSlot>(payload?.bookings));
    } finally {
      setExistingBookingsLoading(false);
    }
  }, [page.handle]);

  React.useEffect(() => {
    void loadExistingBookings();
  }, [loadExistingBookings]);

  const selectedService = React.useMemo(
    () => allCategories.flatMap((category) => category.services || []).find((service) => service.id === bookingService) || null,
    [allCategories, bookingService]
  );

  const today = React.useMemo(() => startOfDay(new Date()), []);
  const lastBookableDate = React.useMemo(() => addDays(today, Math.max(0, bookingSchedule.maxAdvanceDays - 1)), [today, bookingSchedule.maxAdvanceDays]);

  const getScheduleForDate = React.useCallback((value: Date) => {
    const key = toDateKey(value);
    const override = bookingSchedule.dateOverrides.find((entry) => entry.date === key);
    if (override) {
      return override.enabled ? { enabled: true, start: override.start, end: override.end, label: override.label } : { enabled: false, start: "", end: "", label: override.label };
    }

    const weekly = bookingSchedule.weeklyAvailability.find((entry) => entry.day === value.getDay());
    return weekly ? { enabled: weekly.enabled, start: weekly.start, end: weekly.end, label: "" } : { enabled: false, start: "", end: "", label: "" };
  }, [bookingSchedule.dateOverrides, bookingSchedule.weeklyAvailability]);

  const getTimeSlotsForDate = React.useCallback((value: Date) => {
    const schedule = getScheduleForDate(value);
    if (!schedule.enabled) return [];

    const serviceDuration = selectedService?.durationMinutes || bookingSchedule.slotIntervalMinutes;
    const startMinutes = parseTimeToMinutes(schedule.start) ?? 0;
    const endMinutes = parseTimeToMinutes(schedule.end) ?? 0;
    const now = new Date();
    const result: Array<{ value: string; startMinutes: number; endMinutes: number; isBooked: boolean; bookingStatus?: BookingStatus }> = [];
    const dateKey = toDateKey(value);
    const bookingsForDate = existingBookings.filter((entry) => entry.bookingDate === dateKey);

    for (let current = startMinutes; current + serviceDuration <= endMinutes; current += bookingSchedule.slotIntervalMinutes) {
      const slot = formatMinutes(current);
      if (toDateKey(value) === toDateKey(now)) {
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        if (current <= currentMinutes + 29) continue;
      }

      const slotEnd = current + serviceDuration;
      const conflictingBooking = bookingsForDate.find((entry) =>
        overlaps(current, slotEnd, entry.bookingStartMinutes, entry.bookingEndMinutes)
      );

      result.push({
        value: slot,
        startMinutes: current,
        endMinutes: slotEnd,
        isBooked: !!conflictingBooking,
        bookingStatus: conflictingBooking?.status,
      });
    }

    return result;
  }, [bookingSchedule.slotIntervalMinutes, existingBookings, getScheduleForDate, selectedService?.durationMinutes]);

  const isDateSelectable = React.useCallback((value: Date) => {
    if (value < today || value > lastBookableDate) return false;
    return getTimeSlotsForDate(value).some((slot) => !slot.isBooked);
  }, [getTimeSlotsForDate, lastBookableDate, today]);

  const availableTimeSlots = React.useMemo(
    () => (bookingDate ? getTimeSlotsForDate(new Date(`${bookingDate}T00:00:00`)) : []),
    [bookingDate, getTimeSlotsForDate]
  );

  const selectedDateLabel = bookingDate ? formatLongDate(new Date(`${bookingDate}T00:00:00`)) : "Choose a day";

  React.useEffect(() => {
    if (!bookingDate) return;
    const currentDate = new Date(`${bookingDate}T00:00:00`);
    if (!isDateSelectable(currentDate)) {
      setBookingDate("");
      setBookingTime("");
      return;
    }

    const slots = getTimeSlotsForDate(currentDate);
    if (bookingTime && !slots.some((slot) => slot.value === bookingTime && !slot.isBooked)) {
      setBookingTime("");
    }
  }, [bookingDate, bookingTime, getTimeSlotsForDate, isDateSelectable]);

  React.useEffect(() => {
    if (!bookingService || !bookingDate) return;
    const slots = getTimeSlotsForDate(new Date(`${bookingDate}T00:00:00`));
    const firstAvailableSlot = slots.find((slot) => !slot.isBooked)?.value;
    if (!bookingTime && firstAvailableSlot) {
      setBookingTime(firstAvailableSlot);
    }
  }, [bookingDate, bookingService, bookingTime, getTimeSlotsForDate]);

  const canContinueFromStepOne = Boolean(bookingName.trim() && bookingEmail.trim() && bookingService);
  const canContinueFromStepTwo = Boolean(bookingDate && bookingTime);
  const canSubmitBooking = Boolean(bookingName.trim() && bookingEmail.trim() && bookingService && bookingDate && bookingTime);

  const serviceOptions = allCategories.flatMap((category) =>
    (category.services || []).map((service) => ({
      value: service.id,
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
                    setBookingSent(false);
                    setBookingStep(1);
                    setBookingService(service.id);
                    setCalendarMonth(startOfMonth(new Date()));
                    void loadExistingBookings();
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
    if (!bookingName.trim() || !bookingEmail.trim() || !bookingService || !bookingDate || !bookingTime) return;
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
        await loadExistingBookings();
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
            <Button variant="secondary" className="rounded-2xl px-6 py-2.5 text-sm font-bold shadow-sm cursor-pointer" onClick={() => { setBookingSent(false); setBookingStep(1); setCalendarMonth(startOfMonth(new Date())); void loadExistingBookings(); setShowBookingModal(true); }}>
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {bookingSchedule.weeklyAvailability.map((entry) => (
            <div key={entry.day} className="rounded-2xl border border-divider bg-background px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-text-primary">{dayLabels[entry.day]}</p>
                  <p className="text-xs text-text-secondary mt-1">
                    {entry.enabled ? `${formatMinutes(parseTimeToMinutes(entry.start) ?? 0)} – ${formatMinutes(parseTimeToMinutes(entry.end) ?? 0)}` : "Unavailable"}
                  </p>
                </div>
                <Badge variant={entry.enabled ? "success" : "warning"}>{entry.enabled ? "Open" : "Busy"}</Badge>
              </div>
            </div>
          ))}
        </div>
        {bookingSchedule.dateOverrides.length > 0 ? (
          <div className="rounded-2xl border border-divider bg-background p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-primary" />
              <p className="text-sm font-bold text-text-primary">Special Dates</p>
            </div>
            <div className="space-y-2">
              {bookingSchedule.dateOverrides.slice(0, 4).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl border border-divider/80 bg-surface px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{entry.label || entry.date}</p>
                    <p className="text-xs text-text-secondary">{entry.date}</p>
                  </div>
                  <Badge variant={entry.enabled ? "success" : "warning"}>
                    {entry.enabled ? `${formatMinutes(parseTimeToMinutes(entry.start) ?? 0)} – ${formatMinutes(parseTimeToMinutes(entry.end) ?? 0)}` : "Busy"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-3">
          {(booking.bookingMode || "internal") !== "external" ? (
            <Button variant="primary" className="rounded-2xl px-6 py-2.5 text-sm font-bold shadow-sm border-none cursor-pointer" onClick={() => { setBookingSent(false); setBookingStep(1); setCalendarMonth(startOfMonth(new Date())); void loadExistingBookings(); setShowBookingModal(true); }}>
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

      {showBookingModal ? (
        <div className="fixed inset-0 z-50 p-3 sm:p-6">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => { setShowBookingModal(false); setBookingSent(false); setBookingStep(1); }} />
          <div className="relative mx-auto flex h-full max-h-[calc(100vh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-divider bg-surface shadow-2xl sm:max-h-[calc(100vh-3rem)]">
            <button
              onClick={() => { setShowBookingModal(false); setBookingSent(false); setBookingStep(1); }}
              className="absolute right-4 top-4 z-10 rounded-full border border-divider bg-background px-3 py-2 text-xs font-bold text-text-secondary transition-colors hover:text-text-primary"
            >
              Close
            </button>
            {!bookingSent ? (
              <div className="grid h-full grid-cols-1 overflow-y-auto lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6 p-5 sm:p-8">
                  <div className="space-y-3 pr-12">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                      <ShieldCheck size={14} />
                      Secure Booking Request
                    </div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-text-primary sm:text-3xl">Book an Appointment</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
                        Move through a guided 3-step flow to share your details, choose an open slot, and review everything before sending.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[1.6rem] border border-divider bg-background px-3 py-4 sm:px-5">
                    <StepProgress
                      currentStep={bookingStep}
                      onStepClick={(index) => {
                        const nextStep = index + 1
                        if (nextStep === 1) setBookingStep(1)
                        if (nextStep === 2 && canContinueFromStepOne) setBookingStep(2)
                        if (nextStep === 3 && canContinueFromStepOne && canContinueFromStepTwo) setBookingStep(3)
                      }}
                      steps={[
                        { id: "details", label: "Details" },
                        { id: "schedule", label: "Schedule" },
                        { id: "review", label: "Review" },
                      ]}
                    />
                  </div>

                  {bookingStep === 1 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input labelInside="Full Name" value={bookingName} onChange={(event) => setBookingName(event.target.value)} />
                        <Input labelInside="Email" type="email" value={bookingEmail} onChange={(event) => setBookingEmail(event.target.value)} />
                        <Input labelInside="Phone" value={bookingPhone} onChange={(event) => setBookingPhone(event.target.value)} />
                        <Select
                          label="Service"
                          value={bookingService}
                          onChange={(event) => {
                            setBookingService(event.target.value);
                            setBookingDate("");
                            setBookingTime("");
                            setBookingStep(1);
                          }}
                          options={[
                            { label: "Select service", value: "" },
                            ...serviceOptions,
                          ]}
                        />
                      </div>
                      <div className="rounded-[1.6rem] border border-divider bg-background px-4 py-5 text-sm text-text-secondary">
                        Start with your contact details and choose the service you want before moving to live availability.
                      </div>
                    </div>
                  ) : null}

                  {bookingStep === 2 ? (
                    <div className="space-y-5">
                      <div className="rounded-[1.6rem] border border-divider bg-background p-4 sm:p-5 space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-text-secondary">Choose a Date</h3>
                            <p className="mt-1 text-sm font-semibold text-text-primary">{selectedDateLabel}</p>
                          </div>
                          <div className="inline-flex items-center gap-2 rounded-full border border-divider bg-surface px-2 py-1">
                            <button type="button" onClick={() => setCalendarMonth(addMonths(calendarMonth, -1))} className="rounded-full p-2 text-text-secondary transition-colors hover:bg-background hover:text-text-primary">
                              <ChevronLeft size={16} />
                            </button>
                            <span className="min-w-[112px] text-center text-sm font-bold text-text-primary">
                              {new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(calendarMonth)}
                            </span>
                            <button type="button" onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))} className="rounded-full p-2 text-text-secondary transition-colors hover:bg-background hover:text-text-primary">
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                        <BookingCalendar
                          month={calendarMonth}
                          selectedDate={bookingDate}
                          onSelectDate={(value) => {
                            setBookingDate(value);
                            setBookingTime("");
                          }}
                          isDateSelectable={isDateSelectable}
                          today={today}
                          lastBookableDate={lastBookableDate}
                        />
                      </div>

                      <div className="rounded-[1.6rem] border border-divider bg-background p-4 sm:p-5 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-text-secondary">Choose a Time</h3>
                            <p className="mt-1 text-sm text-text-secondary">Booked and confirmed slots stay blocked to prevent overlaps.</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {existingBookingsLoading ? <Loader2 size={14} className="animate-spin text-text-secondary" /> : null}
                            <Badge variant="info">{availableTimeSlots.filter((slot) => !slot.isBooked).length} open</Badge>
                          </div>
                        </div>
                        {availableTimeSlots.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {availableTimeSlots.map((slot) => (
                              <button
                                key={slot.value}
                                type="button"
                                onClick={() => !slot.isBooked && setBookingTime(slot.value)}
                                disabled={slot.isBooked}
                                className={`rounded-2xl border px-4 py-3 text-sm font-bold transition-all ${
                                  bookingTime === slot.value
                                    ? "border-primary bg-primary text-white shadow-sm"
                                    : slot.isBooked
                                    ? "border-divider bg-background text-text-secondary/60"
                                    : "border-divider bg-surface text-text-primary hover:border-primary/30 hover:bg-primary/5"
                                }`}
                              >
                                <span className="block">{slot.value}</span>
                                {slot.isBooked ? <span className="mt-1 block text-[10px] uppercase tracking-[0.16em]">Booked</span> : null}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-divider px-4 py-6 text-sm text-text-secondary">
                            Select a service and an available date to see bookable time slots.
                          </div>
                        )}
                      </div>

                      <Textarea rows={4} value={bookingMessage} onChange={(event) => setBookingMessage(event.target.value)} placeholder="Share any notes, accessibility needs, or preferences before the appointment." />
                    </div>
                  ) : null}

                  {bookingStep === 3 ? (
                    <div className="space-y-5">
                      <div className="rounded-[1.6rem] border border-divider bg-background p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-secondary">Your Selection</p>
                        <div className="mt-4 space-y-3">
                          <SummaryRow label="Full Name" value={bookingName || "Not provided"} />
                          <SummaryRow label="Email" value={bookingEmail || "Not provided"} />
                          <SummaryRow label="Phone" value={bookingPhone || "Not provided"} />
                          <SummaryRow label="Service" value={selectedService?.name || "Choose a service"} />
                          <SummaryRow label="Date" value={bookingDate ? formatLongDate(new Date(`${bookingDate}T00:00:00`)) : "Choose a date"} />
                          <SummaryRow label="Time" value={bookingTime || "Choose a time"} />
                        </div>
                      </div>
                      <div className="rounded-[1.6rem] border border-divider bg-background p-5">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={18} className="text-success" />
                          <p className="text-sm font-bold text-text-primary">What happens next</p>
                        </div>
                        <div className="mt-3 space-y-3 text-sm text-text-secondary">
                          <p>1. We receive your requested service, date, and time.</p>
                          <p>2. The team confirms the slot or proposes the nearest alternative.</p>
                          <p>3. You receive a reply using the details you entered above.</p>
                        </div>
                      </div>
                      <div className="rounded-[1.6rem] border border-divider bg-background p-5">
                        <p className="text-sm font-bold text-text-primary">Booking Policy</p>
                        <p className="mt-3 text-sm leading-relaxed text-text-secondary">{booking.policies || "Appointments are only locked in after the team confirms your request."}</p>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-3 border-t border-divider pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-relaxed text-text-secondary">
                      By sending this request, you&apos;re asking the team to confirm the selected slot. Final approval may depend on availability.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {bookingStep > 1 ? (
                        <Button variant="ghost" onClick={() => setBookingStep((current) => Math.max(1, current - 1))}>Back</Button>
                      ) : (
                        <Button variant="ghost" onClick={() => { setShowBookingModal(false); setBookingSent(false); setBookingStep(1); }}>Cancel</Button>
                      )}
                      {bookingStep === 1 ? (
                        <Button variant="primary" onClick={() => setBookingStep(2)} disabled={!canContinueFromStepOne}>
                          Continue
                        </Button>
                      ) : null}
                      {bookingStep === 2 ? (
                        <Button variant="primary" onClick={() => setBookingStep(3)} disabled={!canContinueFromStepTwo}>
                          Continue
                        </Button>
                      ) : null}
                      {bookingStep === 3 ? (
                        <Button variant="primary" onClick={submitBooking} disabled={bookingLoading || !canSubmitBooking}>
                          {bookingLoading ? "Sending…" : "Send Request"}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="border-t border-divider bg-background/70 p-5 sm:p-8 lg:border-l lg:border-t-0">
                  <div className="space-y-5">
                    <div className="rounded-[1.6rem] border border-divider bg-surface p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-secondary">Your Selection</p>
                      <div className="mt-4 space-y-3">
                        <SummaryRow label="Step" value={bookingStep === 1 ? "Details" : bookingStep === 2 ? "Schedule" : "Review"} />
                        <SummaryRow label="Service" value={selectedService?.name || "Choose a service"} />
                        <SummaryRow label="Date" value={bookingDate ? formatLongDate(new Date(`${bookingDate}T00:00:00`)) : "Choose a date"} />
                        <SummaryRow label="Time" value={bookingTime || "Choose a time"} />
                        <SummaryRow label="Duration" value={selectedService?.durationMinutes ? `${selectedService.durationMinutes} mins` : "Flexible"} />
                      </div>
                    </div>
                    <div className="rounded-[1.6rem] border border-divider bg-surface p-5">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-success" />
                        <p className="text-sm font-bold text-text-primary">What happens next</p>
                      </div>
                      <div className="mt-3 space-y-3 text-sm text-text-secondary">
                        <p>1. We receive your requested service, date, and time.</p>
                        <p>2. The team confirms the slot or proposes the nearest alternative.</p>
                        <p>3. You receive a reply using the details you entered above.</p>
                      </div>
                    </div>
                    {booking.policies ? (
                      <div className="rounded-[1.6rem] border border-divider bg-surface p-5">
                        <p className="text-sm font-bold text-text-primary">Booking Policy</p>
                        <p className="mt-3 text-sm leading-relaxed text-text-secondary">{booking.policies}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-6 py-14 text-center sm:px-10">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="mt-6 text-3xl font-black tracking-tight text-text-primary">Request Sent</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-text-secondary">
                  {booking.confirmationMessage || "Thanks for your request. We will confirm your appointment shortly."}
                </p>
                <div className="mt-8 flex gap-3">
                  <Button variant="ghost" onClick={() => { setShowBookingModal(false); setBookingStep(1); }}>Close</Button>
                  <Button variant="primary" onClick={() => { setBookingSent(false); setBookingStep(1); setBookingTime(""); setBookingDate(""); }}>
                    Book another slot
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-divider bg-background px-4 py-3">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-text-secondary">{label}</span>
      <span className="text-sm font-semibold text-right text-text-primary">{value}</span>
    </div>
  );
}

function BookingCalendar({
  month,
  selectedDate,
  onSelectDate,
  isDateSelectable,
  today,
  lastBookableDate,
}: {
  month: Date
  selectedDate: string
  onSelectDate: (value: string) => void
  isDateSelectable: (value: Date) => boolean
  today: Date
  lastBookableDate: Date
}) {
  const firstDay = startOfMonth(month);
  const calendarStart = addDays(firstDay, -firstDay.getDay());
  const days = Array.from({ length: 42 }, (_, index) => addDays(calendarStart, index));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-2">
        {dayLabels.map((label) => (
          <div key={label} className="px-1 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const key = toDateKey(day);
          const isSelected = selectedDate === key;
          const isCurrentMonth = day.getMonth() === month.getMonth();
          const selectable = isDateSelectable(day);
          const isBeforeWindow = day < today;
          const isAfterWindow = day > lastBookableDate;

          return (
            <button
              key={key}
              type="button"
              onClick={() => selectable && onSelectDate(key)}
              disabled={!selectable}
              className={`aspect-square rounded-2xl border text-sm font-bold transition-all ${
                isSelected
                  ? "border-primary bg-primary text-white shadow-sm"
                  : selectable
                  ? "border-divider bg-surface text-text-primary hover:border-primary/30 hover:bg-primary/5"
                  : "border-divider/70 bg-background text-text-secondary/50"
              } ${!isCurrentMonth ? "opacity-45" : ""}`}
            >
              <span className="block">{day.getDate()}</span>
              {(isBeforeWindow || isAfterWindow) && !isSelected ? <span className="sr-only">Unavailable</span> : null}
            </button>
          );
        })}
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
