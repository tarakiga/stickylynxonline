# lets do this one: Service Menu

For barbers, salons, spas, gyms, therapists, photographers, cleaners, tutors—anyone selling time‑based services.

Lists services (like your Food Menu, but with duration instead of calories), prices, and brief descriptions.

Integrates with an external calendar/booking link (“Book on Calendly / Fresha / WhatsApp”) (Build an internal booking module that can be used across all categories and for this let it be the default option with the options for external booking integrations).
Add Simple availability indicators (busy days, next available slot). like we did on food menu

Design this as a **“Service Menu \& Booking” page type**: a one‑pager that shows what you do, what it costs, and how to book, for any time‑based service business.(Remeber currency is setup in settings so the currency should feed from settings)

***

## 1. Role of the Service Menu \& Booking page

- **Audience**: barbers, salons, spas, gyms, therapists, photographers, cleaners, tutors, etc., and their clients.[^1]
- **Goal**: visitors quickly see offered services, durations, prices, and can book via internal booking or external tool (Calendly, Fresha, WhatsApp, etc.) 
- **Format**: one live URL per provider or branch; QR‑friendly for in‑store use and link‑in‑bio friendly for online use.

***

## 2. Information architecture (page layout)

### 2.1 Blocks from top to bottom

1. **Business / Professional Hero block**
    - Name (business or person), role (“Barber \& stylist”, “Mobile massage therapist”, “Math tutor”).
    - Short tagline (“Sharp fades \& beard trims”, “At‑home deep tissue massage”).
    - Hero image (person, logo, or interior).
    - Primary CTA button: “View services” or “Book an appointment”.[^2][^1]
2. **About \& trust block**
    - Short “about” paragraph: who you are, what you specialise in, where you operate.
    - Optional micro‑trust elements: years in business, qualifications, certifications, key brands used.
3. **Service categories \& services block**
    - Categories: “Haircuts”, “Coloring”, “Beard \& grooming”, “Massages”, “Facials”, “Personal training”, “Photography packages”, etc.
    - Inside each category, multiple services with:
        - Name, short description.
        - Duration (e.g., 30 / 45 / 60 minutes).
        - Price (or price range).
        - Optional tags (e.g., “New”, “Popular”, “Kids”, “At‑home”). Field in design library that accepts multi pills
    - UX similar to Food Menu, and layout emphasizes time + price.
4. **Featured services / packages block** (optional)
    - 3–6 highlighted services or bundles, e.g.:
        - “Full Grooming Package”, “Bridal Makeup + Trial”, “Monthly PT Pack (4 sessions)”.
    - Each with headline, what’s included, total duration and price.
5. **Booking \& availability block**
    - Explanation of how booking works: “Book online”, “DM/WhatsApp to schedule”, “Walk‑in welcome”.
    - Buttons linking to: Calendly, Fresha, Booksy, Google Calendar appointment link, or WhatsApp chat.[^1]
    - Optional text for policies: cancellation window, deposits, lateness rules.
6. **Location \& contact block**
    - Address(es), service area (for mobile services), map or area description.
    - Multi‑contact: phone, WhatsApp, email, Instagram, website.[^1]
    - “Get directions” and “Call now” buttons.
7. **Reviews / testimonials block** (optional but high‑value)
    - 3–6 short client quotes, star ratings if available, name/initials.
    - Pull from Google Reviews / other platforms manually for v1.[^3]
8. **FAQ block** (optional)
    - Common questions: “Do you take walk‑ins?”, “What should I bring?”, “How early should I arrive?”
    - Accordions.

***

## 3. Template configuration inside your framework

Define a new category:

- `category: "ServiceMenu"`


### 3.1 Block list (default order)

1. `ServiceHeroBlock`
2. `AboutTrustBlock`
3. `ServiceCategoriesBlock`
4. `FeaturedServicesBlock` (optional)
5. `BookingBlock`
6. `LocationContactBlock`
7. `TestimonialsBlock` (optional)
8. `FaqBlock` (optional)

### 3.2 Example schemas

**ServiceHeroBlock**

```ts
type ServiceHeroBlock = {
  businessName: string;      // “Fade Studio Barbers”
  headline?: string;         // “Sharp fades, clean shaves.”
  roleOrTagline: string;     // “Barber & stylist in Lekki”
  heroImageUrl?: string;
  primaryCta?: { label: string; url: string }; // “Book now”
};
```

**ServiceCategoriesBlock**

```ts
type Service = {
  name: string;              // “Skin fade”
  description?: string;      // “Clipper cut with razor finish”
  durationMinutes?: number;  // 30, 45, 60
  price: number;
  currency: string;
  priceType?: "fixed" | "from" | "range";
  maxPrice?: number;         // for ranges
  tags?: string[];           // ["Popular", "Student", "Kids"]
};

type ServiceCategory = {
  id: string;
  name: string;              // “Haircuts”
  description?: string;
  services: Service[];
};

type ServiceCategoriesBlock = {
  categories: ServiceCategory[];
  collapsible: boolean;         // accordion per category
  defaultOpenCategoryIds: string[];
  hasSearch: boolean;           // search within services
};
```

**FeaturedServicesBlock**

```ts
type FeaturedService = {
  name: string;                // “Full Grooming Package”
  description: string;
  totalDurationMinutes?: number;
  price: number;
  currency: string;
  includes: string[];          // ["Haircut", "Beard trim", "Hot towel"]
};

type FeaturedServicesBlock = {
  title?: string;              // “Popular packages”
  items: FeaturedService[];
};
```

**BookingBlock**

```ts
type BookingLink = {
  label: string;      // “Book on Calendly”, “WhatsApp”
  url: string;
  type: "calendly" | "fresha" | "booksy" | "whatsapp" | "custom";
  emphasis?: "primary" | "secondary";
};

type BookingBlock = {
  introText?: string;     // “Book online in 2 minutes.”
  bookingLinks: BookingLink[];
  notes?: string;         // policies, deposits, etc.
};
```

**LocationContactBlock**

Reuse your MultiContact + Location patterns:

```ts
type LocationContactBlock = {
  locations: Location[];  // same pattern as Food Menu
  contacts: Contact[];    // phone, whatsapp, email, instagram, etc.
};
```


***

## 4. Editor experience (for service providers)

1. **Setup wizard**
    - Step 1: business/pro name, role, main service type (barber, salon, tutor, etc.).
    - Step 2: pick or create service categories from presets (e.g., Haircuts, Coloring, Grooming, Packages).
    - Step 3: add first few services (name, duration, price).
2. **Service builder**
    - Similar to Food Menu editor but focused on:
        - Duration selector (dropdown: 15 / 30 / 45 / 60 / 90 / 120).
        - Price and price type (“fixed”, “from”, “range”).
    - Drag‑and‑drop ordering of categories and services.
3. **Booking integration**
    - Simple form to paste external booking URLs: Calendly links, Fresha page, WhatsApp deep link, etc.[^1]
    - Choose which is primary (“Book now” button) versus secondary (“Chat first”).
4. **Trust \& reviews**
    - Optional area to paste quotes or manually enter review snippets.

***

## 5. Design-system hooks

This template gives you new reusable UI patterns:

- **Service card**: name, duration, price, description, “Popular” tag.
- **Category accordion**: collapsible sections for service groups.
- **Booking button set**: primary and secondary CTAs with platform icons (Calendly, WhatsApp, etc.).
- **Review/testimonial card**: name/initials, rating, quote.

You can document a “Service Menu \& Booking” layout example in `/design-system` alongside Food Menu and Project Portal.

***

## 6. v1 vs later

**v1**

- Collapsible categories, search within services.
- Basic analytics: page views, clicks on booking links.

**Later**

- Embedded booking widgets (if APIs allow).
- Packages with limited‑time promos and coupon integration.



