A generic **digital menu page** for:

- restaurants,
- fast‑food,
- cafés,
- dessert shops,
- delivery‑only kitchens,
- buffet / combo services.

It must support many categories, multiple locations, multiple contact channels, and items with size/option‑based pricing while remaining mobile‑first and scannable.

***

### 1. Page information

| Field | Description |
| :-- | :-- |
| `category` | `"FoodMenu"` |
| `templateVersion` | String (e.g., `1.0`) to allow future template changes |
| `blocks` | Ordered list of typed blocks (e.g., `BrandHeaderBlock`, `ServiceInfoBlock`, `MenuSectionsBlock`, `ExtrasBlock`) |


***

### 2. Block structure

#### 2.1 `BrandHeaderBlock`

Top‑of‑page hero section:

- `businessName: string`
- `tagline?: string` (e.g., “Nigerian fast‑food”, “Western café”)
- `cuisineType?: string` (e.g., “Afro‑Asian”, “Italian‑style burgers”)
- `shortDescription?: string` (e.g., “Serving Lagos and Abuja since 2020”)
- `heroImage?: string` (URL)
- `primaryCta?: { label: string, url: string }` (e.g., “Order via WhatsApp”)

This block is **always visible** and non‑collapsible.

***

#### 2.2 `ServiceInfoBlock` (multi‑location, multi‑contact)

Where the business is, how to reach them, and how to order:

```ts
type Contact = {
  type: "phone" | "email" | "whatsapp" | "instagram" | "facebook" | "other";
  value: string;     // phone, email, URL
  label: string;     // “Admin”, “WhatsApp orders”, “Main line”
  isPrimary: boolean;
};

type Location = {
  id: string;
  name: string;      // “Lagos Main Branch”, “Abuja Drive‑thru”
  address: string;
  city: string;
  postalCode?: string;
  country: string;
  geoCoords?: { lat: number; lng: number };
  openingHours: {
    dayOfWeek: 0..6; // 0 = Sunday
    open: string;    // “09:00”
    close: string;   // “22:00”
  }[];
};

type OrderingLink = {
  label: string;     // “Order via Zira”, “Uber Eats”
  url: string;
};
```

```ts
type ServiceInfoBlock = {
  serviceType: "dine-in" | "takeaway" | "delivery" | "combo" | "all";
  description?: string;   // “Serving Lagos and Abuja from 9am–10pm”
  contacts: Contact[];
  locations: Location[];
  orderingLinks: OrderingLink[];
  notes?: string;         // “Minimum order NGN 1,500 for delivery”
};
```

UX treatment:

- Contacts and locations are shown as compact **cards** or **chips**.
- “Multi‑Contact” component is reused from your design‑system library.
- Locations can be hidden in a collapsible section if there are many.

***

#### 2.3 `MenuSectionsBlock` (with collapsible UX)

This is the core block that holds sections and their items.

- `defaultOpenSectionIds: string[]` (e.g., `["Mains", "Specials", "Combos"]`)
- `collapsible: boolean` (always `true` for v1)
- `hasSidebar: boolean` (optional, desktop only)
- `hasSearch: boolean` (optional, but recommended for big menus)
- `maxDefaultOpen: number` (e.g., `3`)

Each section has:

```ts
type MenuSection = {
  id: string;          // stable key
  name: string;        // “Starters”, “Mains”, “Drinks”, “Kids”, “Combos”
  description?: string; // e.g., “Our classic starters”
  highlighted: boolean; // shown as “Chef’s Picks” etc.
  items: MenuItem[];
};
```

Rendering rules:

- On page load, only sections whose `id` is in `defaultOpenSectionIds` are expanded.
- All others are collapsed accordions (collapsible cards).
- On desktop, an optional **sidebar navigator** shows all section names (with scroll‑spy).
- A **search bar** (if `hasSearch = true`) filters items across all sections in real time.
- A **category‑jump dropdown** (for mobile) lets the user instantly scroll to a section.

***

#### 2.4 `MenuItem` (with Product Variation support)

A menu item with optional **multiple prices** (e.g., pizza: small / medium / large).

```ts
type MenuItemVariation = {
  name: string;        // “Small”, “Medium”, “Large”, “Single”, “Double”
  size?: "small" | "medium" | "large" | "single" | "double" | "combo" | "other";
  price: number;       // numeric price (e.g., 2500)
  currency: string;    // e.g., “NGN”, “USD”
  description?: string; // e.g., “12 inch”, “Family‑size plate”
};

type MenuItem = {
  name: string;             // “Pepperoni Pizza”
  description?: string;     // “Tomato, mozzarella, pepperoni, herbs”
  baseDescription?: string; // shared for all variants (e.g., “Classic pizza with mozzarella and tomato”)
  variations: MenuItemVariation[];
  tags: string[];           // e.g., “Vegan”, “Gluten‑free”, “Spicy”, “Combo”, “Recommended”
  photoUrl?: string;
  notes?: string;           // “Contains cheese”, “Mild spice”, “Served with chips”
};
```

Editor UX:

- For each item, the **`Product Variation`** component is shown:
    - Default is one variation (no extra UI).
    - Owner can click “Add variation” to add small/medium/large etc.
- The variation component renders as a **radio group** or **dropdown** of size options with prices next to each.

V1 guarantees **at least one** variation per item.

***

#### 2.5 `ExtrasBlock` (optional)

An optional section for cross‑sells and add‑ons:

```ts
type ExtrasBlock = {
  title: string;          // “Add‑ons”, “Combo Packs”, “Recommended Sides”
  description?: string;   // “Enhance your order with these extras”
  items: MenuItem[];      // subset of items meant as add‑ons/side dishes
};
```

This can reuse the same `MenuItem` type and `Product Variation` UX.

***

### 3. Frontend UX rules for large menus

For a menu with 20+ sections:

- **Default view**:
    - Show only the first 3–5 **featured** sections expanded (chosen by admin in the editor via `defaultOpenSectionIds`).
    - All others are collapsed accordions.
- **Mobile UX**:
    - Collapsible accordion list + **search bar** at the top of the menu.
    - Optional **category‑jump dropdown** (“View all”, “Mains”, “Drinks”, “Snacks”).
- **Desktop UX**:
    - Sticky **sidebar navigator** with all section names and scroll‑spy.
    - Horizontal section list that can be made collapsible if needed.
    - Search bar at the top.

These options are **controlled by flags** on `MenuSectionsBlock` so they can be toggled per page.

***

### 4. Design‑system components used

- `MenuSectionCard` – section header with optional description and color accent.
- `MenuItemCard` – item name, description, `Product Variation` control, tags, photo, notes.
- `Tag/Chip` – for dietary/status labels (Vegan, Spicy, etc.).
- `MultiContact` – reusable contact‑list component for `ServiceInfoBlock`.
- `LocationCard` – reusable card for each location.
- `Product Variation` – size/option selector with prices.
- Optional: `SidebarNavigator` and `SearchBar` for enhanced menu navigation.

***

### 5. Practical example (what an admin sets in editor)

For a Lagos fast‑food restaurant:

- `BrandHeaderBlock`:
    - `businessName: "TastyGrill Fast Food"`
    - `tagline: "Affordable Nigerian fast‑food"`
    - `cuisineType: "Afro‑Asian street food"`
    - `primaryCta: { label: "Order via WhatsApp", url: "https://wa.me/..." }`
- `ServiceInfoBlock`:
    - `serviceType: "all"`
    - `contacts: [ { type: "phone", value: "+234...", label: "Admin", isPrimary: true }, { type: "whatsapp", value: "+234...", label: "Orders", isPrimary: false } ]`
    - `locations: [ { name: "Lagos Ikeja Branch", address: "...", city: "Lagos", openingHours: [...] }, { name: "Lagos Fadeyi Branch", ... } ]`
- `MenuSectionsBlock`:
    - `defaultOpenSectionIds: ["Mains", "Specials"]`
    - `collapsible: true`
    - `hasSidebar: true`
    - `hasSearch: true`
    - `sections: [ { id: "Mains", name: "Mains", items: [ /* pizza, burger, rice bowls */ ] }, { id: "Specials", name: "Chef's Specials", items: [...] }, { id: "Snacks", name: "Snacks" }, ... ]`
- `MenuItem` (Pizza, example):
    - `name: "Pepperoni Pizza"`
    - `baseDescription: "Classic pizza with mozzarella and tomato"`
    - `variations: [ { name: "Small", size: "small", price: 2500, currency: "NGN" }, { name: "Medium", size: "medium", price: 3500, currency: "NGN" }, { name: "Large", size: "large", price: 4500, currency: "NGN" } ]`
    - `tags: ["Spicy", "Recommended"]`
    - `notes: "Contains cheese, served with chips"`
