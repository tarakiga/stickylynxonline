## 1. Role of the Property Listing page

- **Audience**: buyers, renters, investors, and their advisors.[^2][^1]
- **Goal**: in 30–90 seconds, visitors should understand what the property is, where it is, key features, price/terms, and how to book a viewing or request more info.[^3][^1]
- **Format**: one live URL per property, reusing your design system and block engine, not a PDF brochure.

***

## 2. Information architecture (page layout)

Ordered blocks on the page (all configurable):

1. **Hero / Key facts block**
    - Property name/title (e.g., “3‑Bed Apartment in Lekki Phase 1”).
    - Short tagline (“Waterfront, serviced, 24/7 power”).
    - Hero image or collage; badges like “For Sale / For Rent / Off‑plan”.
    - Key facts row: price / rent, beds, baths, size (sqm), location chip.[^1][^2]
2. **Photo gallery block**
    - Grid or carousel of high‑quality photos (interior, exterior, amenities).
    - Lightbox on click; optional labels (e.g., “Living room”, “Master bedroom”).[^4][^5]
3. **Overview \& highlight features block**
    - Short description / narrative of the property and who it’s ideal for.
    - Bullet list of highlights: “En‑suite bedrooms”, “Sea view”, “2 parking spaces”.[^5][^2]
4. **Details \& specs block**
    - Structured list of property details:[^1]
        - Type (apartment, duplex, villa, commercial, land).
        - Beds, baths, toilets.
        - Covered area and plot size.
        - Floor/level, year built, furnishing status, tenure (freehold/leasehold).
    - Optional section for building/estate features (e.g., pool, gym, security, elevator).
5. **Location \& map block**
    - Address / area name, city, country.
    - Embedded map (or static map image in v1) showing approximate location.[^5]
    - Nearby places text list (schools, malls, transit).
6. **Pricing \& availability block**
    - For sale: asking price, currency, possible range (“From X”), status (Available / Under offer / Sold).[^2]
    - For rent: monthly/annual rent, minimum term, deposit requirements.
    - Optional: service charge and what it covers.
    - Status badge color‑coded.
7. **Floor plan \& documents block** (optional)
    - Thumbnails or links for floor plans, brochures, PDFs.
    - Each with label and download/view buttons.
8. **Agent / contact block**
    - Agent or agency profile: photo, name, role, branding.
    - Multi‑contact: phone, WhatsApp, email, agency website \& socials.
    - Primary CTAs: “Request viewing”, “Call agent”, “Message on WhatsApp”.[^2]
9. **Booking / inquiry form block**
    - Inline form: name, email, phone, preferred date/time, message.
    - Creates a lead record and triggers email notification to agent.
10. **Similar / other listings block** (later / optional)

- Cards linking to other properties by same agent or in same area.

***

## 3. Template configuration in your framework

Define a new **category**:

- `category: "PropertyListing"`


### 3.1 High-level block list

Default order:

1. `PropertyHeroBlock`
2. `PhotoGalleryBlock`
3. `OverviewFeaturesBlock`
4. `PropertyDetailsBlock`
5. `LocationMapBlock`
6. `PricingAvailabilityBlock`
7. `FloorplansDocumentsBlock` (optional)
8. `AgentContactBlock`
9. `InquiryFormBlock`
10. `RelatedPropertiesBlock` (optional)

### 3.2 Example schemas (TS-style)

**PropertyHeroBlock**

```ts
type PropertyHeroBlock = {
  title: string;          // “3-Bed Apartment in Lekki Phase 1”
  tagline?: string;       // “Waterfront, serviced, 24/7 power”
  status: "for_sale" | "for_rent" | "sold" | "under_offer";
  propertyType: "apartment" | "duplex" | "house" | "villa" | "studio" | "land" | "office" | "retail" | "other";
  beds?: number;
  baths?: number;
  areaSqm?: number;
  locationLabel: string;  // “Lekki Phase 1, Lagos”
  heroImageUrl?: string;
  highlightBadges?: string[]; // [“New listing”, “Sea view”]
};
```

**PhotoGalleryBlock**

```ts
type GalleryImage = {
  url: string;
  label?: string;   // “Living room”
};

type PhotoGalleryBlock = {
  images: GalleryImage[];
};
```

**OverviewFeaturesBlock**

```ts
type OverviewFeaturesBlock = {
  overviewText: string;   // 2–3 paragraphs
  highlights: string[];   // bullet list of key selling points
};
```

**PropertyDetailsBlock**

```ts
type PropertyDetailsBlock = {
  propertyType: string;
  beds?: number;
  baths?: number;
  toilets?: number;
  coveredAreaSqm?: number;
  landAreaSqm?: number;
  floor?: string;           // “3rd floor”
  yearBuilt?: string;
  furnishing: "unfurnished" | "semi" | "fully" | "other";
  tenure?: string;          // “Freehold”, “Leasehold 99 years”
  buildingFeatures?: string[];  // pool, gym, security, elevator, etc.
};
```

**LocationMapBlock**

```ts
type LocationMapBlock = {
  addressLine1?: string;
  addressLine2?: string;
  area: string;      // e.g. “Lekki Phase 1”
  city: string;
  country: string;
  geoCoords?: { lat: number; lng: number };
  nearbyPlaces?: string[]; // schools, malls, landmarks
};
```

**PricingAvailabilityBlock**

```ts
type PricingAvailabilityBlock = {
  listingType: "sale" | "rent";
  price: number;           // asking price or rent amount
  currency: string;        // “NGN”, “USD”
  period?: "month" | "year" | "one_time"; // for rent vs sale
  serviceCharge?: {
    amount: number;
    period: "month" | "year";
    description?: string;
  };
  availabilityStatus: "available" | "under_offer" | "sold" | "coming_soon";
  notes?: string;          // “Negotiable”, “Offers over…”
};
```

**FloorplansDocumentsBlock**

```ts
type DocumentItem = {
  title: string;          // “2nd floor plan”
  type: "floorplan" | "brochure" | "spec_sheet" | "other";
  url: string;
};

type FloorplansDocumentsBlock = {
  items: DocumentItem[];
};
```

**AgentContactBlock** (use your MultiContact)

```ts
type AgentContactBlock = {
  agentName: string;
  agentPhotoUrl?: string;
  role?: string;              // “Lettings negotiator”
  agencyName?: string;
  bio?: string;
  contacts: Contact[];        // reuse Contact type (phone, email, whatsapp, etc.)
};
```

**InquiryFormBlock**

- Config: which fields are required, destination email, auto‑reply settings.
- Data: stored as leads linked to `pageId`.

***

## 4. Editor experience (for agents/hosts)

1. **Quick start**
    - Choose “Property Listing” category.
    - Enter minimal info: title, area, listing type (sale/rent), price, beds, baths.
    - Upload 1–3 hero photos.
2. **Guided sections**
    - For each block, provide hints based on best practices:[^1][^2]
        - Overview: “Explain who this property is ideal for in 2–3 sentences.”
        - Highlights: “List 4–8 things that set this property apart.”
        - Pricing: “Be clear about what’s included (service charge, furnishings).”
3. **Map \& location**
    - Address inputs + optional map preview if lat/lng provided.
    - Simple toggle to hide precise address but show area (for privacy).
4. **Contact \& lead capture**
    - Configure MultiContact with phone, WhatsApp, email.
    - Turn inquiry form on/off; set notification email(s).

***

## 5. Design-system hooks

Use this template to introduce:

- **Property fact bar**: horizontal chips for price, beds, baths, size.
- **Pill status badges**: For Sale / For Rent / Sold with color tokens.
- **Photo gallery pattern**: carousel + grid + lightbox.
- **Spec list pattern**: two‑column key/value pairs (like a spec sheet).
- **Map card**: location text with embedded/static map.
- **Agent card**: avatar, role, agency, contact buttons.

These components will also be useful later in portfolio/case study pages and service listings.

***

## 6. v1 vs later enhancements

**v1**

- Single‑property listing pages.
- Manual data entry (no MLS/API integration).
- Basic view/inquiry analytics.
- Static/embedded map via coordinates or map URL.
