Stickylynx

***

## 1. Product Overview

The product is a web platform where users create, customize, and share a **single public page** that aggregates their content, links, and offerings, similar to Linktree’s “link in bio” pages and Gumroad’s creator storefronts.[^1][^2]
Each page is based on a template type (Food Menu, Resume, EPK, etc.), supports simple content editing, and is reachable via a short, shareable URL.[^2]

The platform includes a first-class **Design System** (Asap font, colors, components, icons) that serves as the single source of truth for UX and UI implementation, previewable on a standalone HTML design-system guide page.[^3][^4]

***

## 2. Goals and Non‑Goals

**Primary goals**

- Let any user create a high-quality single page in <10 minutes with no code required.
- Support multiple page **categories** (Food Menu, Resume, EPK, etc.) via templates and configuration, not hard-coded layouts.
- Maintain a **design-system-driven** implementation to ensure visual consistency and rapid template creation across categories.[^3]
- Provide a solid foundation to later bolt on monetization (e.g., Gumroad-style selling) and analytics.[^5][^1]

**Non‑goals (v1)**

- Full e-commerce (cart, checkout, tax/VAT handling, license keys) like full Gumroad.
- Complex multi-page sites, blogs, or CMS.
- Native mobile apps (initially responsive web only).
- Marketplace/discovery feed of creators.

***

## 3. User Personas

1. **Solo creator / music artist**
    - Needs a single EPK page with bio, press photos, embedded tracks, videos, and links to streaming platforms (Spotify, Apple Music, etc.).
    - Shares link in social bios and to promoters.
2. **Restaurant / café owner**
    - Needs a mobile-friendly **Food Menu** page with categories, item descriptions, prices, and optional “Order via WhatsApp” or external delivery links.
    - Prints QR codes pointing to the page.
3. **Job seeker / freelancer**
    - Needs a **Resume** or personal profile page with sections (About, Experience, Education, Skills, Projects, Links).
    - Shares link in job applications and on LinkedIn.
4. **Service professional / consultant**
    - Needs a single page combining links, services, contact info, and optionally embedded booking calendar or payment links (to external tools).

***

## 4. Core Use Cases

1. **Sign up and create first page**
    - User signs up (email/password, social login optional in later version).
    - Chooses a template category (Food Menu, Resume, EPK, “Generic Link Page”).
    - Enters minimal required info (title, handle, category).
    - Gets a default page generated and previewed.
2. **Customize page content**
    - Edit text fields (titles, sections, descriptions).
    - Add/remove sections (e.g., “Skills” on Resume, “Set List” on EPK).
    - Reorder blocks/sections via drag-and-drop or simple up/down controls.
    - Add links (URL + label + optional icon/thumbnail).
3. **Style / branding adjustments (within design system)**
    - Choose among a small set of themes that are defined in the **design system** (color tokens, background treatments, button variants).
    - Upload profile photo/logo and cover/banner image.
    - Light and dark mode toggle (if included in design system).
4. **Preview \& publish**
    - Live preview as user edits.
    - Publish/unpublish toggle.
    - Page is publicly accessible at a short URL (e.g., `site.com/@handle` or `site.com/slug`).
    - User can copy link, share to social platforms.
5. **Manage multiple pages**
    - From dashboard, user can create multiple pages (e.g., multiple menus or different EPKs) under one account.
    - Each page shows basic stats (views, last updated; richer analytics later).
6. **Design system viewing**
    - Public (or internal) design-system HTML guide that showcases:
        - Typography (Asap styles, scales).
        - Color palette (primary, secondary, neutrals, feedback colors).
        - Components (buttons, cards, chips, tags, nav, modals, forms).
        - Layout grids and spacing.
    - Guide is versioned and treated as the UX source of truth.[^4][^3]

***

## 5. Feature Requirements

### 5.1 Authentication \& Accounts

- Email + password registration and login.
- Password reset (email-based).
- Basic profile settings: name, avatar, timezone.
- Optional: social login (Google) in a later iteration.


### 5.2 Page Types (Categories)

Each page has:

- `category`: enum (Food Menu, Resume, EPK, Generic) – extensible via config.
- `templateVersion`: to handle future template updates without breaking existing pages.
- `blocks`: ordered list of typed blocks (text, image, list, link list, rich card, audio embed, video embed, contact form stub).

**Food Menu template**

- Sections (e.g., Starters, Mains, Drinks), each with:
    - Name, description.
    - Menu items: title, description, price, tags (vegan/spicy/etc.).
    - Optional photo for section or item.
- Optional “Order” CTAs linking to WhatsApp, phone, or external ordering platforms.

**Resume template**

- Blocks: Header (name, role, contact), Summary, Experience (role, company, period, bullets), Education, Skills (tag list), Projects, Links.
- Supports hiding/showing defined sections.

**EPK template**

- Hero: artist name, tagline, key links (Spotify, Apple Music, YouTube).
- Media: track list (embedded players or external links), video embeds (YouTube/Vimeo), image gallery (press photos).
- Press kit download link (PDF upload) and short bio.
- Contact section (management/booking contact, socials).

**Generic “Link Page” template (Linktree-like)**

- Profile avatar, name, short bio.
- Vertical list of links: each with text, URL, optional icon or thumbnail.[^6][^2]

Templates are driven by configuration (JSON schema) so new categories can be added without rewriting core rendering logic.

### 5.3 Page Management \& Editing

- Pages dashboard:
    - List all pages with: title, category, URL, status (published/draft), view count (if tracking).
    - CRUD operations (create, duplicate, rename, delete).
- Editor:
    - Form-driven editing of structured fields per template.
    - Simple controls for block order and visibility.
    - Media upload for images and PDFs.
    - Auto-save or explicit save button.
    - “Preview” mode that shows exact public rendering.


### 5.4 Public Page Rendering

- Public URL pattern: `/{handle}` or `/p/{slug}` (configurable).
- Fast, responsive, mobile-first layout.
- SEO basics: unique meta title, description, OG tags per page.
- Basic open graph preview using cover and title.


### 5.5 Analytics (minimal v1)

- Track page views per page (aggregate count).
- Show counts in dashboard (no complex charts initially).
- Prepare data model for future expansion: referrer, device breakdown, date-based graphs.


### 5.6 Monetization (future-facing hooks)

Even if v1 doesn’t implement full Gumroad e-commerce, keep room in the data model:

- Optional “Product” block: title, price, CTA link (currently external).
- Later: internal checkout, digital delivery, and memberships similar to Gumroad’s creator tools.[^7][^1]

***

## 6. Design System Requirements

The design system is the **primary source of truth** driving all UI across templates.

### 6.1 Foundations

- **Typography**
    - Primary typeface: Asap (all weights as needed, regular/bold minimum).
    - Define usage: headings, body, captions, button text, and responsive scale.[^8][^4]
- **Color system**
    - Token-based palette: `primary`, `primaryVariant`, `accent`, `background`, `surface`, `success`, `warning`, `error`, `neutral` scales.
    - Light/dark modes (if used) expressed via tokens, not hard-coded literal colors.
- **Spacing \& layout**
    - 4/8px spacing scale.
    - Content width constraints (max-widths for cards, pages).
    - Grid rules for desktop vs mobile.
- **Iconography**
    - Defined icon set (e.g., Lucide or similar) with naming conventions.
    - Usage guidelines (sizes, stroke width, alignment).


### 6.2 Components Library

Define and document reusable components, each with:

- Anatomy, states, and variants.
- Props/usage guidelines.
- Figma (or equivalent) link and coded implementation.

Key components:

- Buttons (primary, secondary, ghost, destructive).
- Inputs (text, textarea, select, toggle, checkbox, radio).
- Cards (generic, profile card, menu item card, media card).
- Tag/Chip (for skills, dietary labels).
- Navigation (top bar for app, not necessarily in public page).
- Modals, toasts, and inline alerts.
- Link block variants (Linktree-style link, product callout).


### 6.3 Design System HTML Guide Page

- Hosted at e.g. `/design-system` or separate subdomain.
- Sections:
    - Overview and usage principles.
    - Live typography section showing Asap at various sizes and weights.
    - Color tokens with examples, accessible contrast guidelines.
    - Component gallery with interactive demos.
    - Layout examples for each page template type.[^3]
- This page is updated alongside deployments and treated as the reference for designers and developers.

***

## 7. Architecture \& Technical Constraints (High-Level)

- Web app, responsive, optimized for mobile first.
- Multi-tenant SaaS by default: each account can have multiple pages; infra supports many creators.
- Page rendering should be cacheable and fast (static or server-rendered pages with incremental regeneration).
- Configuration-driven template engine: new categories added via schema + template config, not one-off layouts.

***

## 8. Non‑Functional Requirements

- Performance: public pages load in <2 seconds on 3G for typical content.
- Accessibility: adhere to WCAG AA for contrast and semantics.
- Reliability: 99.5% uptime target for public pages.
- Security: standard auth best practices; file uploads scanned/validated; public pages are read-only to visitors.

***

## 9. Open Questions

- for payments create a subsctiption plan and integrate paystack
- the design system will be private/internal only
- custom domains per page (e.g., `myname.com`) will be featured in v2
- initialize, commit and push to https://github.com/tarakiga/stickylynxonline.git

