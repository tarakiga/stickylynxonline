"use client";

import * as React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Dropzone } from "@/components/ui/Dropzone";
import { LocationSearch } from "@/components/ui/LocationSearch";
import { uploadAssetFile } from "@/lib/upload-client";
import { currencySymbol } from "@/lib/utils";
import type { EditorPage } from "@/types/editor-page";
import { findEditorBlock } from "@/types/editor-page";
import {
  BOOKING_PLATFORM_OPTIONS,
  CONTACT_TYPE_OPTIONS,
  type AboutTrustContent,
  type BookingContent,
  type BookingLink,
  type BookingMode,
  type ContactType,
  type FaqContent,
  type FaqItem,
  type FeaturedServicePackage,
  type FeaturedServicesContent,
  type LocationContactContent,
  type PriceType,
  type ServiceContact,
  type ServiceHeroContent,
  type ServiceLocation,
  type ServiceMenuCategorySection,
  type ServiceCategoriesContent,
  type TestimonialsContent,
  type TestimonialItem,
} from "@/lib/service-menu";
import { Eye, Loader2, Plus, Save, Trash2 } from "lucide-react";

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asStringArray(value: unknown) {
  return asArray(value).filter((item): item is string => typeof item === "string");
}

const priceTypeOptions = [
  { label: "Fixed", value: "fixed" },
  { label: "From", value: "from" },
  { label: "Range", value: "range" },
];

const bookingModeOptions = [
  { label: "Internal only", value: "internal" },
  { label: "External only", value: "external" },
  { label: "Both", value: "both" },
];

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type ServiceMenuPage = EditorPage & {
  blocks?: Array<{ type: string; content?: unknown; order?: number }>
};

export function ServiceMenuEditor({
  page,
  defaultCurrency = "USD",
}: {
  page: ServiceMenuPage
  defaultCurrency?: string
}) {
  const blocks = page.blocks || [];
  const heroBlock = findEditorBlock(blocks, "TEXT", "service_hero");
  const aboutBlock = findEditorBlock(blocks, "TEXT", "about_trust");
  const servicesBlock = findEditorBlock(blocks, "GRID", "service_categories");
  const featuredBlock = findEditorBlock(blocks, "GRID", "featured_services");
  const bookingBlock = findEditorBlock(blocks, "GRID", "booking");
  const locationBlock = findEditorBlock(blocks, "CONTACT", "location_contact");
  const testimonialsBlock = findEditorBlock(blocks, "GRID", "testimonials");
  const faqBlock = findEditorBlock(blocks, "GRID", "faq");

  const hero = (heroBlock?.content || {}) as Partial<ServiceHeroContent>;
  const about = (aboutBlock?.content || {}) as Partial<AboutTrustContent>;
  const serviceContent = (servicesBlock?.content || {}) as Partial<ServiceCategoriesContent>;
  const featured = (featuredBlock?.content || {}) as Partial<FeaturedServicesContent>;
  const booking = (bookingBlock?.content || {}) as Partial<BookingContent>;
  const location = (locationBlock?.content || {}) as Partial<LocationContactContent>;
  const testimonials = (testimonialsBlock?.content || {}) as Partial<TestimonialsContent>;
  const faq = (faqBlock?.content || {}) as Partial<FaqContent>;

  const [businessName, setBusinessName] = React.useState(asString(hero.businessName, page.title || page.handle));
  const [headline, setHeadline] = React.useState(asString(hero.headline));
  const [roleOrTagline, setRoleOrTagline] = React.useState(asString(hero.roleOrTagline));
  const [heroImageUrl, setHeroImageUrl] = React.useState(asString(hero.heroImageUrl));
  const [primaryCtaLabel, setPrimaryCtaLabel] = React.useState(asString(hero.primaryCtaLabel, "Book an appointment"));

  const [aboutText, setAboutText] = React.useState(asString(about.aboutText));
  const [speciality, setSpeciality] = React.useState(asString(about.speciality));
  const [serviceArea, setServiceArea] = React.useState(asString(about.serviceArea));
  const [yearsInBusiness, setYearsInBusiness] = React.useState(asString(about.yearsInBusiness));
  const [qualifications, setQualifications] = React.useState(asStringArray(about.qualifications));
  const [certifications, setCertifications] = React.useState(asStringArray(about.certifications));
  const [brandsUsed, setBrandsUsed] = React.useState(asStringArray(about.brandsUsed));

  const [categories, setCategories] = React.useState<ServiceMenuCategorySection[]>(
    asArray(serviceContent.categories).map((categoryValue) => {
      const category = asRecord(categoryValue) || {};
      return {
        id: asString(category.id, uid("cat")),
        name: asString(category.name),
        description: asString(category.description),
        services: asArray(category.services).map((serviceValue) => {
          const service = asRecord(serviceValue) || {};
          return {
            id: asString(service.id, uid("svc")),
            name: asString(service.name),
            description: asString(service.description),
            durationMinutes: asNumber(service.durationMinutes),
            price: asNumber(service.price),
            currency: asString(service.currency, defaultCurrency),
            priceType: (asString(service.priceType, "fixed") as PriceType),
            maxPrice: asNumber(service.maxPrice),
            tags: asStringArray(service.tags),
          };
        }),
      };
    }).filter((category) => category.id)
  );

  const [featuredServices, setFeaturedServices] = React.useState<FeaturedServicePackage[]>(
    asArray(featured.items).map((itemValue) => {
      const item = asRecord(itemValue) || {};
      return {
        id: asString(item.id, uid("pkg")),
        name: asString(item.name),
        description: asString(item.description),
        totalDurationMinutes: asNumber(item.totalDurationMinutes),
        price: asNumber(item.price),
        currency: asString(item.currency, defaultCurrency),
        includes: asStringArray(item.includes),
      };
    })
  );
  const [featuredTitle, setFeaturedTitle] = React.useState(asString(featured.title, "Popular packages"));

  const [bookingMode, setBookingMode] = React.useState<BookingMode>((asString(booking.bookingMode, "internal") as BookingMode));
  const [introText, setIntroText] = React.useState(asString(booking.introText, "Book online in a few taps or use one of the external booking options below."));
  const [internalButtonLabel, setInternalButtonLabel] = React.useState(asString(booking.internalButtonLabel, "Book now"));
  const [confirmationMessage, setConfirmationMessage] = React.useState(asString(booking.confirmationMessage, "Thanks for your request. We will confirm your appointment shortly."));
  const [nextAvailableText, setNextAvailableText] = React.useState(asString(booking.nextAvailableText, "Next available today"));
  const [busyDays, setBusyDays] = React.useState<number[]>(asArray(booking.busyDays).filter((day): day is number => typeof day === "number"));
  const [policies, setPolicies] = React.useState(asString(booking.policies));
  const [bookingLinks, setBookingLinks] = React.useState<BookingLink[]>(
    asArray(booking.bookingLinks).map((linkValue) => {
      const link = asRecord(linkValue) || {};
      return {
        id: asString(link.id, uid("link")),
        label: asString(link.label),
        url: asString(link.url).replace(/^https?:\/\//i, ""),
        type: asString(link.type, "custom") as BookingLink["type"],
        emphasis: asString(link.emphasis, "secondary") as BookingLink["emphasis"],
      };
    })
  );

  const [locations, setLocations] = React.useState<ServiceLocation[]>(
    asArray(location.locations).map((locationValue) => {
      const locationItem = asRecord(locationValue) || {};
      return {
        id: asString(locationItem.id, uid("loc")),
        name: asString(locationItem.name),
        address: asString(locationItem.address || locationItem.display_name),
        city: asString(locationItem.city),
        country: asString(locationItem.country),
      };
    })
  );
  const [contacts, setContacts] = React.useState<ServiceContact[]>(
    asArray(location.contacts).map((contactValue) => {
      const contact = asRecord(contactValue) || {};
      return {
        id: asString(contact.id, uid("con")),
        type: asString(contact.type, "phone") as ContactType,
        label: asString(contact.label),
        value: asString(contact.value),
      };
    })
  );
  const [serviceAreaText, setServiceAreaText] = React.useState(asString(location.serviceAreaText));

  const [testimonialsItems, setTestimonialsItems] = React.useState<TestimonialItem[]>(
    asArray(testimonials.items).map((itemValue) => {
      const item = asRecord(itemValue) || {};
      return {
        id: asString(item.id, uid("test")),
        quote: asString(item.quote),
        source: asString(item.source),
        rating: typeof item.rating === "number" ? item.rating : 5,
      };
    })
  );

  const [faqItems, setFaqItems] = React.useState<FaqItem[]>(
    asArray(faq.items).map((itemValue) => {
      const item = asRecord(itemValue) || {};
      return {
        id: asString(item.id, uid("faq")),
        question: asString(item.question),
        answer: asString(item.answer),
      };
    })
  );

  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);

  const markDirty = React.useCallback(() => setDirty(true), []);
  const handleViewPublic = () => window.open(`/${page.handle}`, "_blank");

  const actionButtons = (
    <>
      <Button variant="secondary" onClick={handleViewPublic} className="py-2 px-4 shadow-sm text-xs rounded-xl cursor-pointer whitespace-nowrap">
        <Eye size={14} className="mr-1.5" /> Preview
      </Button>
      <Button variant="primary" onClick={handleSave} disabled={saving || !dirty} className="py-2 px-5 shadow-sm text-sm rounded-xl cursor-pointer border-none text-white whitespace-nowrap">
        {saving ? <><Loader2 size={14} className="mr-1.5 animate-spin" /> Saving…</> : <><Save size={14} className="mr-1.5" /> Save Changes</>}
      </Button>
    </>
  );

  function addCategory() {
    setCategories((prev) => [...prev, { id: uid("cat"), name: "New Category", description: "", services: [] }]);
    markDirty();
  }

  function addService(categoryId: string) {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              services: [
                ...category.services,
                {
                  id: uid("svc"),
                  name: "New Service",
                  description: "",
                  durationMinutes: 60,
                  price: null,
                  currency: defaultCurrency,
                  priceType: "fixed",
                  maxPrice: null,
                  tags: [],
                },
              ],
            }
          : category
      )
    );
    markDirty();
  }

  function addFeaturedService() {
    setFeaturedServices((prev) => [...prev, { id: uid("pkg"), name: "New Package", description: "", totalDurationMinutes: 90, price: null, currency: defaultCurrency, includes: [] }]);
    markDirty();
  }

  function addBookingLink() {
    setBookingLinks((prev) => [...prev, { id: uid("link"), label: "Book on Calendly", url: "", type: "calendly", emphasis: "secondary" }]);
    markDirty();
  }

  function addLocation() {
    setLocations((prev) => [...prev, { id: uid("loc"), name: "", address: "", city: "", country: "" }]);
    markDirty();
  }

  function addContact() {
    setContacts((prev) => [...prev, { id: uid("con"), type: "phone", label: "", value: "" }]);
    markDirty();
  }

  function addTestimonial() {
    setTestimonialsItems((prev) => [...prev, { id: uid("test"), quote: "", source: "", rating: 5 }]);
    markDirty();
  }

  function addFaq() {
    setFaqItems((prev) => [...prev, { id: uid("faq"), question: "", answer: "" }]);
    markDirty();
  }

  function toggleBusyDay(dayIndex: number) {
    setBusyDays((prev) => prev.includes(dayIndex) ? prev.filter((day) => day !== dayIndex) : [...prev, dayIndex].sort((a, b) => a - b));
    markDirty();
  }

  async function handleHeroUpload(file: File) {
    const uploaded = await uploadAssetFile(file, { kind: "image", pageId: page.id });
    setHeroImageUrl(uploaded.secureUrl);
    markDirty();
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = [
        {
          type: "TEXT",
          content: {
            section: "service_hero",
            businessName,
            headline,
            roleOrTagline,
            heroImageUrl,
            primaryCtaLabel,
          } satisfies ServiceHeroContent,
          order: heroBlock?.order ?? 0,
        },
        {
          type: "TEXT",
          content: {
            section: "about_trust",
            aboutText,
            speciality,
            serviceArea,
            yearsInBusiness,
            qualifications,
            certifications,
            brandsUsed,
          } satisfies AboutTrustContent,
          order: aboutBlock?.order ?? 1,
        },
        {
          type: "GRID",
          content: {
            section: "service_categories",
            collapsible: Boolean(serviceContent.collapsible ?? true),
            defaultOpenCategoryIds: serviceContent.defaultOpenCategoryIds || categories.slice(0, 1).map((category) => category.id),
            hasSearch: serviceContent.hasSearch ?? true,
            categories: categories.map((category) => ({
              id: category.id,
              name: category.name,
              description: category.description,
              services: category.services.map((service) => ({
                id: service.id,
                name: service.name,
                description: service.description,
                durationMinutes: service.durationMinutes,
                price: service.price,
                currency: service.currency || defaultCurrency,
                priceType: service.priceType,
                maxPrice: service.maxPrice,
                tags: service.tags,
              })),
            })),
          } satisfies ServiceCategoriesContent,
          order: servicesBlock?.order ?? 2,
        },
        {
          type: "GRID",
          content: {
            section: "featured_services",
            title: featuredTitle,
            items: featuredServices.map((item) => ({
              ...item,
              currency: item.currency || defaultCurrency,
            })),
          } satisfies FeaturedServicesContent,
          order: featuredBlock?.order ?? 3,
        },
        {
          type: "GRID",
          content: {
            section: "booking",
            introText,
            bookingMode,
            internalButtonLabel,
            confirmationMessage,
            nextAvailableText,
            busyDays,
            bookingLinks: bookingLinks.map((link) => ({ ...link, url: link.url })),
            policies,
          } satisfies BookingContent,
          order: bookingBlock?.order ?? 4,
        },
        {
          type: "CONTACT",
          content: {
            section: "location_contact",
            locations,
            contacts,
            serviceAreaText,
          } satisfies LocationContactContent,
          order: locationBlock?.order ?? 5,
        },
        {
          type: "GRID",
          content: {
            section: "testimonials",
            items: testimonialsItems,
          } satisfies TestimonialsContent,
          order: testimonialsBlock?.order ?? 6,
        },
        {
          type: "GRID",
          content: {
            section: "faq",
            items: faqItems,
          } satisfies FaqContent,
          order: faqBlock?.order ?? 7,
        },
      ];

      const response = await fetch(`/api/editor/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks: payload }),
      });

      if (!response.ok) {
        try {
          const data = await response.json();
          alert(data.error || "Failed to save");
        } catch {
          alert("Failed to save");
        }
      } else {
        setDirty(false);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col items-start justify-between gap-3 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-primary text-sm font-semibold">
          <Badge variant="primary">Service Menu</Badge>
          <span>Edit Mode</span>
          {dirty && <span className="text-warning">· Unsaved changes</span>}
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
          {actionButtons}
        </div>
      </div>

      <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-premium space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Input labelInside="Business or Professional Name" value={businessName} onChange={(event) => { setBusinessName(event.target.value); markDirty(); }} />
            <Input labelInside="Headline" value={headline} onChange={(event) => { setHeadline(event.target.value); markDirty(); }} placeholder="Sharp fades, clean shaves." />
            <Input labelInside="Role or Tagline" value={roleOrTagline} onChange={(event) => { setRoleOrTagline(event.target.value); markDirty(); }} placeholder="Barber & stylist in Lekki" />
            <Input labelInside="Primary CTA Label" value={primaryCtaLabel} onChange={(event) => { setPrimaryCtaLabel(event.target.value); markDirty(); }} />
          </div>
          <div className="space-y-4">
            <Dropzone
              label="Hero Image"
              hint="PNG, JPG, WEBP, GIF, or AVIF up to 10MB"
              onChange={handleHeroUpload}
            />
            {heroImageUrl ? (
              <div className="rounded-2xl overflow-hidden border border-divider bg-background">
                <Image src={heroImageUrl} alt="Hero preview" width={1200} height={480} unoptimized className="w-full h-56 object-cover" />
                <div className="p-3">
                  <Button variant="ghost" onClick={() => { setHeroImageUrl(""); markDirty(); }} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer">Remove image</Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-xl text-text-primary">About & Trust</h3>
        <Textarea rows={4} value={aboutText} onChange={(event) => { setAboutText(event.target.value); markDirty(); }} placeholder="Tell visitors who you are, what you specialise in, and where you operate." />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input labelInside="Speciality" value={speciality} onChange={(event) => { setSpeciality(event.target.value); markDirty(); }} />
          <Input labelInside="Service Area" value={serviceArea} onChange={(event) => { setServiceArea(event.target.value); markDirty(); }} />
          <Input labelInside="Years in Business" value={yearsInBusiness} onChange={(event) => { setYearsInBusiness(event.target.value); markDirty(); }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input labelInside="Qualifications" value={qualifications.join(", ")} onChange={(event) => { setQualifications(event.target.value.split(",").map((item) => item.trim()).filter(Boolean)); markDirty(); }} placeholder="NVQ Level 3, Certified Trainer" />
          <Input labelInside="Certifications" value={certifications.join(", ")} onChange={(event) => { setCertifications(event.target.value.split(",").map((item) => item.trim()).filter(Boolean)); markDirty(); }} placeholder="First Aid, CIBTAC" />
          <Input labelInside="Brands Used" value={brandsUsed.join(", ")} onChange={(event) => { setBrandsUsed(event.target.value.split(",").map((item) => item.trim()).filter(Boolean)); markDirty(); }} placeholder="Wella, Babyliss Pro" />
        </div>
      </Card>

      <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold text-xl text-text-primary">Service Categories</h3>
          <Button variant="ghost" onClick={addCategory} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer">Add Category</Button>
        </div>
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="rounded-2xl border border-divider bg-background p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
                <Input labelInside="Category Name" value={category.name} onChange={(event) => { const value = event.target.value; setCategories((prev) => prev.map((item) => item.id === category.id ? { ...item, name: value } : item)); markDirty(); }} />
                <Input labelInside="Category Description" value={category.description} onChange={(event) => { const value = event.target.value; setCategories((prev) => prev.map((item) => item.id === category.id ? { ...item, description: value } : item)); markDirty(); }} />
                <Button variant="ghost" onClick={() => { setCategories((prev) => prev.filter((item) => item.id !== category.id)); markDirty(); }} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer text-error">
                  <Trash2 size={14} className="mr-1.5" /> Remove
                </Button>
              </div>
              <div className="space-y-3">
                {category.services.map((service) => (
                  <div key={service.id} className="rounded-2xl border border-divider bg-surface p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input labelInside="Service Name" value={service.name} onChange={(event) => { const value = event.target.value; setCategories((prev) => prev.map((item) => item.id === category.id ? { ...item, services: item.services.map((entry) => entry.id === service.id ? { ...entry, name: value } : entry) } : item)); markDirty(); }} />
                      <Input labelInside="Tags" value={service.tags.join(", ")} onChange={(event) => { const value = event.target.value.split(",").map((item) => item.trim()).filter(Boolean); setCategories((prev) => prev.map((item) => item.id === category.id ? { ...item, services: item.services.map((entry) => entry.id === service.id ? { ...entry, tags: value } : entry) } : item)); markDirty(); }} placeholder="Popular, New, Kids" />
                    </div>
                    <Textarea rows={2} value={service.description} onChange={(event) => { const value = event.target.value; setCategories((prev) => prev.map((item) => item.id === category.id ? { ...item, services: item.services.map((entry) => entry.id === service.id ? { ...entry, description: value } : entry) } : item)); markDirty(); }} placeholder="Describe what is included in the service." />
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <Input labelInside="Duration (mins)" type="number" value={service.durationMinutes ?? ""} onChange={(event) => { const value = event.target.value ? Number(event.target.value) : null; setCategories((prev) => prev.map((item) => item.id === category.id ? { ...item, services: item.services.map((entry) => entry.id === service.id ? { ...entry, durationMinutes: value } : entry) } : item)); markDirty(); }} />
                      <Input labelInside={`Price (${currencySymbol(service.currency || defaultCurrency)})`} type="number" value={service.price ?? ""} onChange={(event) => { const value = event.target.value ? Number(event.target.value) : null; setCategories((prev) => prev.map((item) => item.id === category.id ? { ...item, services: item.services.map((entry) => entry.id === service.id ? { ...entry, price: value } : entry) } : item)); markDirty(); }} />
                      <Select label="Price Type" options={priceTypeOptions} value={service.priceType} onChange={(event) => { const value = event.target.value as PriceType; setCategories((prev) => prev.map((item) => item.id === category.id ? { ...item, services: item.services.map((entry) => entry.id === service.id ? { ...entry, priceType: value } : entry) } : item)); markDirty(); }} />
                      <Input labelInside="Max Price" type="number" value={service.maxPrice ?? ""} onChange={(event) => { const value = event.target.value ? Number(event.target.value) : null; setCategories((prev) => prev.map((item) => item.id === category.id ? { ...item, services: item.services.map((entry) => entry.id === service.id ? { ...entry, maxPrice: value } : entry) } : item)); markDirty(); }} disabled={service.priceType !== "range"} />
                    </div>
                    <div className="flex justify-end">
                      <Button variant="ghost" onClick={() => { setCategories((prev) => prev.map((item) => item.id === category.id ? { ...item, services: item.services.filter((entry) => entry.id !== service.id) } : item)); markDirty(); }} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer text-error">
                        <Trash2 size={14} className="mr-1.5" /> Remove Service
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" onClick={() => addService(category.id)} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer">
                  <Plus size={14} className="mr-1.5" /> Add Service
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold text-xl text-text-primary">Featured Packages</h3>
          <Button variant="ghost" onClick={addFeaturedService} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer">Add Package</Button>
        </div>
        <Input labelInside="Section Title" value={featuredTitle} onChange={(event) => { setFeaturedTitle(event.target.value); markDirty(); }} />
        <div className="space-y-3">
          {featuredServices.map((item) => (
            <div key={item.id} className="rounded-2xl border border-divider bg-background p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input labelInside="Package Name" value={item.name} onChange={(event) => { const value = event.target.value; setFeaturedServices((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, name: value } : entry)); markDirty(); }} />
                <Input labelInside="Includes" value={item.includes.join(", ")} onChange={(event) => { const value = event.target.value.split(",").map((entry) => entry.trim()).filter(Boolean); setFeaturedServices((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, includes: value } : entry)); markDirty(); }} />
              </div>
              <Textarea rows={2} value={item.description} onChange={(event) => { const value = event.target.value; setFeaturedServices((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, description: value } : entry)); markDirty(); }} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input labelInside="Total Duration" type="number" value={item.totalDurationMinutes ?? ""} onChange={(event) => { const value = event.target.value ? Number(event.target.value) : null; setFeaturedServices((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, totalDurationMinutes: value } : entry)); markDirty(); }} />
                <Input labelInside={`Price (${currencySymbol(item.currency || defaultCurrency)})`} type="number" value={item.price ?? ""} onChange={(event) => { const value = event.target.value ? Number(event.target.value) : null; setFeaturedServices((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, price: value } : entry)); markDirty(); }} />
                <Button variant="ghost" onClick={() => { setFeaturedServices((prev) => prev.filter((entry) => entry.id !== item.id)); markDirty(); }} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer text-error">
                  <Trash2 size={14} className="mr-1.5" /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-xl text-text-primary">Booking & Availability</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select label="Booking Mode" options={bookingModeOptions} value={bookingMode} onChange={(event) => { setBookingMode(event.target.value as BookingMode); markDirty(); }} />
          <Input labelInside="Internal Button Label" value={internalButtonLabel} onChange={(event) => { setInternalButtonLabel(event.target.value); markDirty(); }} />
          <Input labelInside="Next Available" value={nextAvailableText} onChange={(event) => { setNextAvailableText(event.target.value); markDirty(); }} />
        </div>
        <Textarea rows={2} value={introText} onChange={(event) => { setIntroText(event.target.value); markDirty(); }} placeholder="Explain how visitors should book." />
        <Textarea rows={2} value={confirmationMessage} onChange={(event) => { setConfirmationMessage(event.target.value); markDirty(); }} placeholder="Shown after an internal booking request is sent." />
        <Textarea rows={3} value={policies} onChange={(event) => { setPolicies(event.target.value); markDirty(); }} placeholder="Add deposits, cancellation windows, lateness rules, or walk-in notes." />
        <div className="space-y-2">
          <span className="text-sm font-semibold text-text-secondary">Busy Days</span>
          <div className="flex flex-wrap gap-2">
            {dayLabels.map((label, index) => (
              <button key={label} type="button" onClick={() => toggleBusyDay(index)} className={`px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer ${busyDays.includes(index) ? "bg-primary text-white border-primary" : "bg-background text-text-secondary border-divider"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-text-secondary">External Booking Links</span>
            <Button variant="ghost" onClick={addBookingLink} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer">Add Link</Button>
          </div>
          {bookingLinks.map((link) => (
            <div key={link.id} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <Input labelInside="Label" value={link.label} onChange={(event) => { const value = event.target.value; setBookingLinks((prev) => prev.map((entry) => entry.id === link.id ? { ...entry, label: value } : entry)); markDirty(); }} />
              <Select label="Platform" options={[...BOOKING_PLATFORM_OPTIONS]} value={link.type} onChange={(event) => { const value = event.target.value as BookingLink["type"]; setBookingLinks((prev) => prev.map((entry) => entry.id === link.id ? { ...entry, type: value } : entry)); markDirty(); }} />
              <Input labelInside="URL" prefix="https://" value={link.url} onChange={(event) => { const value = event.target.value.replace(/^https?:\/\//i, ""); setBookingLinks((prev) => prev.map((entry) => entry.id === link.id ? { ...entry, url: value } : entry)); markDirty(); }} />
              <div className="flex items-end gap-2">
                <Select label="Style" options={[{ label: "Primary", value: "primary" }, { label: "Secondary", value: "secondary" }]} value={link.emphasis} onChange={(event) => { const value = event.target.value as BookingLink["emphasis"]; setBookingLinks((prev) => prev.map((entry) => entry.id === link.id ? { ...entry, emphasis: value } : entry)); markDirty(); }} />
                <Button variant="ghost" onClick={() => { setBookingLinks((prev) => prev.filter((entry) => entry.id !== link.id)); markDirty(); }} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer text-error">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-xl text-text-primary">Location & Contact</h3>
        <Textarea rows={2} value={serviceAreaText} onChange={(event) => { setServiceAreaText(event.target.value); markDirty(); }} placeholder="Describe your studio, branch, or mobile service area." />
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-text-secondary">Locations</span>
            <Button variant="ghost" onClick={addLocation} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer">Add Location</Button>
          </div>
          {locations.map((item) => (
            <div key={item.id} className="rounded-2xl border border-divider bg-background p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input labelInside="Location Name" value={item.name} onChange={(event) => { const value = event.target.value; setLocations((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, name: value } : entry)); markDirty(); }} />
                <LocationSearch label="Search Address" onSelect={(value) => { setLocations((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, address: value } : entry)); markDirty(); }} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input labelInside="Address" value={item.address} onChange={(event) => { const value = event.target.value; setLocations((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, address: value } : entry)); markDirty(); }} className="sm:col-span-2" />
                <Button variant="ghost" onClick={() => { setLocations((prev) => prev.filter((entry) => entry.id !== item.id)); markDirty(); }} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer text-error">
                  <Trash2 size={14} className="mr-1.5" /> Remove
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input labelInside="City" value={item.city} onChange={(event) => { const value = event.target.value; setLocations((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, city: value } : entry)); markDirty(); }} />
                <Input labelInside="Country" value={item.country} onChange={(event) => { const value = event.target.value; setLocations((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, country: value } : entry)); markDirty(); }} />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-text-secondary">Contacts</span>
            <Button variant="ghost" onClick={addContact} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer">Add Contact</Button>
          </div>
          {contacts.map((contact) => (
            <div key={contact.id} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <Select label="Type" options={[...CONTACT_TYPE_OPTIONS]} value={contact.type} onChange={(event) => { const value = event.target.value as ContactType; setContacts((prev) => prev.map((entry) => entry.id === contact.id ? { ...entry, type: value } : entry)); markDirty(); }} />
              <Input labelInside="Label" value={contact.label} onChange={(event) => { const value = event.target.value; setContacts((prev) => prev.map((entry) => entry.id === contact.id ? { ...entry, label: value } : entry)); markDirty(); }} />
              <Input labelInside="Value" value={contact.value} onChange={(event) => { const value = event.target.value; setContacts((prev) => prev.map((entry) => entry.id === contact.id ? { ...entry, value } : entry)); markDirty(); }} className="sm:col-span-2" />
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold text-xl text-text-primary">Testimonials</h3>
          <Button variant="ghost" onClick={addTestimonial} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer">Add Testimonial</Button>
        </div>
        <div className="space-y-3">
          {testimonialsItems.map((item) => (
            <div key={item.id} className="rounded-2xl border border-divider bg-background p-4 space-y-3">
              <Textarea rows={2} value={item.quote} onChange={(event) => { const value = event.target.value; setTestimonialsItems((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, quote: value } : entry)); markDirty(); }} placeholder="Client quote" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input labelInside="Source" value={item.source} onChange={(event) => { const value = event.target.value; setTestimonialsItems((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, source: value } : entry)); markDirty(); }} placeholder="Jane D." />
                <Input labelInside="Rating" type="number" min="1" max="5" value={item.rating} onChange={(event) => { const value = Number(event.target.value || 5); setTestimonialsItems((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, rating: value } : entry)); markDirty(); }} />
                <Button variant="ghost" onClick={() => { setTestimonialsItems((prev) => prev.filter((entry) => entry.id !== item.id)); markDirty(); }} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer text-error">
                  <Trash2 size={14} className="mr-1.5" /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold text-xl text-text-primary">FAQ</h3>
          <Button variant="ghost" onClick={addFaq} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer">Add FAQ</Button>
        </div>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <div key={item.id} className="rounded-2xl border border-divider bg-background p-4 space-y-3">
              <Input labelInside="Question" value={item.question} onChange={(event) => { const value = event.target.value; setFaqItems((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, question: value } : entry)); markDirty(); }} />
              <Textarea rows={3} value={item.answer} onChange={(event) => { const value = event.target.value; setFaqItems((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, answer: value } : entry)); markDirty(); }} placeholder="Answer" />
              <div className="flex justify-end">
                <Button variant="ghost" onClick={() => { setFaqItems((prev) => prev.filter((entry) => entry.id !== item.id)); markDirty(); }} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer text-error">
                  <Trash2 size={14} className="mr-1.5" /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="sticky bottom-4 z-20">
        <div className="ml-auto flex w-full max-w-md items-center justify-end gap-3 rounded-[1.6rem] border border-primary/20 bg-surface/95 p-3 shadow-premium backdrop-blur">
          <div className="mr-auto px-2 text-xs font-semibold text-text-secondary">
            {dirty ? "Unsaved changes" : "All changes saved"}
          </div>
          {actionButtons}
        </div>
      </div>
    </div>
  );
}
