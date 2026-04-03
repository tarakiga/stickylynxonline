# now do this: Portfolio / Case Study Page (Agency / Freelancer)

For designers, developers, copywriters, small agencies—complements Resume + Project Portal.

Blocks: hero, services offered, 3–6 featured case studies (problem → solution → outcome), testimonials, logos, and contact form.

High value because it turns the generic “portfolio” into a conversion‑oriented sales page.

Treat this as a **“Portfolio \& Case Studies” page type** that sells your services, not just showcases pretty work: one URL per freelancer/agency that pairs services with 3–6 proof stories.[^1][^2][^3]

***

## 1. Role of the Portfolio / Case Study page

- **Audience**: designers, developers, copywriters, marketers, small agencies—and the clients who might hire them.[^2][^4]
- **Goal**: show what you do, prove you’ve done it successfully for others (case studies), then make it obvious how to contact or book you.[^3][^5][^1]
- **Format**: a conversion‑oriented landing page: hero → services → case studies → testimonials/logos → contact.

***

## 2. Information architecture (page layout)

### 2.1 Blocks from top to bottom

1. **Hero / Value proposition block**
    - Name or studio name.
    - Clear statement: what you do and who you help (“I design high‑converting SaaS marketing sites for B2B startups”).[^2][^3]
    - Short subline (problem you solve or niche).
    - Primary CTA: “View case studies” or “Book a call”.
2. **Services offered block**
    - 3–6 core services: e.g., “Brand identity”, “Web design \& build”, “Conversion copywriting”, “Retainer support”.[^6][^4]
    - Each service card: title, short description, ideal client/use case, link to 1–3 relevant case studies later on.
3. **Featured case studies block**
    - 3–6 case studies, each with consistent structure: **Problem → Solution → Outcome**.[^7][^8][^9]
    - Case study card (teaser):
        - Client name or type, short headline result (“+40% sign‑ups in 3 months”).
        - 1–2 lines summarizing the story; tags for industry/service.
    - Detail view (either on same page section or modal/accordion):
        - Problem/context.
        - Your approach/process.
        - Tools used (optional).
        - Results/impact (metrics or qualitative impact).
4. **Logos / social proof strip**
    - Row or grid of client logos (“Trusted by…”).
    - Works even when you cannot name all clients; can include anonymized labels (“Fintech startup”, “Health NGO”).[^10][^1]
5. **Testimonials block**
    - 3–5 client quotes with name, role, company, and optional headshot.[^8][^7]
    - Place at least one testimonial near case studies and one near the contact CTA.
6. **About / credibility block**
    - Short “about” section: who you are, background, what makes your approach different.[^11][^6][^2]
    - Optional: skills/tools logos (Figma, Webflow, React, Notion, etc.).
7. **Contact / inquiry form block**
    - Simple form: name, email, company, short project description, budget range/timeline (optional).[^1][^3]
    - Supporting copy: “Tell me about your project” / “Request a proposal”.
    - Secondary contact options: email, Calendly link, LinkedIn.

***

## 3. Template configuration inside your framework

Define a new category:

- `category: "PortfolioCaseStudy"`


### 3.1 Block list (default)

1. `PortfolioHeroBlock`
2. `ServicesOfferedBlock`
3. `CaseStudiesBlock`
4. `ClientLogosBlock`
5. `TestimonialsBlock`
6. `AboutBlock`
7. `ContactFormBlock`

### 3.2 Example schemas (TS‑style)

**PortfolioHeroBlock**

```ts
type PortfolioHeroBlock = {
  nameOrBrand: string;          // “Tar Akiga” or “Studio Lynx”
  headline: string;             // “I design fast, conversion-first SaaS sites.”
  subheadline?: string;         // “For B2B teams ready to scale.”
  heroImageUrl?: string;        // headshot or logo
  primaryCta?: { label: string; url: string }; // e.g. “Book a call”
  secondaryCta?: { label: string; url: string }; // e.g. “View case studies”
};
```

**ServicesOfferedBlock**

```ts
type ServiceItem = {
  name: string;                 // “Website design & build”
  description: string;          // what’s included / outcomes
  idealFor?: string;            // “SaaS startups, pre-seed to Series B”
  relatedCaseStudyIds?: string[];
};

type ServicesOfferedBlock = {
  services: ServiceItem[];
};
```

**CaseStudiesBlock**

```ts
type CaseStudy = {
  id: string;
  clientName?: string;          // can be anonymized
  clientType?: string;          // “SaaS startup”, “E-commerce brand”
  industry?: string;
  serviceTags: string[];        // “Web design”, “Branding”
  title: string;                // headline “+40% sign-ups in 3 months”
  summary: string;              // 1–2 line overview
  problem: string;
  solution: string;
  outcome: string;              // focus on impact/results
  metrics?: { label: string; value: string }[]; // optional numbers
  coverImageUrl?: string;
};

type CaseStudiesBlock = {
  featuredCaseStudyIds?: string[]; // 1 hero case study to highlight
  items: CaseStudy[];
};
```

**ClientLogosBlock**

```ts
type ClientLogo = {
  name: string;
  logoUrl: string;
  linkUrl?: string;
};

type ClientLogosBlock = {
  title?: string;            // “Trusted by”
  logos: ClientLogo[];
};
```

**TestimonialsBlock**

```ts
type Testimonial = {
  quote: string;
  personName: string;
  role?: string;
  company?: string;
  avatarUrl?: string;
  relatedCaseStudyId?: string;
};

type TestimonialsBlock = {
  items: Testimonial[];
};
```

**AboutBlock**

```ts
type AboutBlock = {
  title?: string;            // “About me” / “Why clients hire me”
  body: string;              // 1–3 short paragraphs
  skills?: string[];         // “Figma”, “Next.js”, “Conversion copy”
  toolLogos?: { name: string; logoUrl: string }[];
};
```

**ContactFormBlock**

```ts
type ContactFormBlock = {
  title?: string;            // “Tell me about your project”
  introText?: string;
  successMessage?: string;
  destinationEmail: string;
  fields: {
    name: string;
    type: "text" | "email" | "textarea" | "select";
    label: string;
    required: boolean;
    options?: string[];      // for select, e.g. budget ranges
  }[];
};
```


***

## 4. Editor experience (for freelancer/agency)

1. **Quick start**
    - Enter name/brand, headline (“I build X for Y”), and 2–3 services.
    - Add 1 hero case study and 1 testimonial to get to “MVP portfolio” quickly.[^3][^2]
2. **Case study builder**
    - Guided form that enforces **Problem → Solution → Outcome** narrative.[^9][^7]
    - Optional metrics fields but not required (supports qualitative outcomes).
    - Suggests linking each case study to one or more services.
3. **Conversion focus**
    - Require at least one CTA in the hero and one near the bottom.
    - Provide default contact form template with typical fields already configured.

***

## 5. Design‑system hooks

This template introduces or reuses patterns that boost conversion:

- **Service cards** with hover states and links to relevant case studies.
- **Case study cards** with consistent layout and progressive disclosure (summary first, details on expand).[^7]
- **Metric badges** for key results (“+40% sign‑ups”, “3x ROAS”).
- **Testimonial cards** with avatars and logos.
- **Contact strip** CTA that can also be dropped into other templates.

***

## 6. v1 vs later

**v1**

- Single page per freelancer/agency with static case studies and form submissions via email.
- Basic analytics: page views, form submissions.

**Later**

- Tag‑based filtering of case studies by industry/service.
- Intake/brief forms that connect to your Project Portal category.
- A/B testing hero headline and CTA.


