import { findEditorBlock } from "@/types/editor-page"

export const PORTFOLIO_CASE_STUDY_CATEGORY = "PORTFOLIO_CASE_STUDY" as const

export type PortfolioCta = {
  label: string
  url: string
}

export type PortfolioHeroContent = {
  section: "portfolio_hero"
  nameOrBrand: string
  headline: string
  subheadline: string
  heroImageUrl: string
  primaryCta: PortfolioCta
  secondaryCta: PortfolioCta
}

export type PortfolioServiceItem = {
  id: string
  name: string
  description: string
  idealFor: string
  relatedCaseStudyIds: string[]
}

export type PortfolioServicesContent = {
  section: "services_offered"
  services: PortfolioServiceItem[]
}

export type PortfolioMetric = {
  id: string
  label: string
  value: string
}

export type PortfolioCaseStudy = {
  id: string
  clientName: string
  clientType: string
  industry: string
  serviceTags: string[]
  title: string
  summary: string
  problem: string
  solution: string
  outcome: string
  metrics: PortfolioMetric[]
  coverImageUrl: string
}

export type PortfolioCaseStudiesContent = {
  section: "case_studies"
  featuredCaseStudyIds: string[]
  items: PortfolioCaseStudy[]
}

export type PortfolioClientLogo = {
  id: string
  name: string
  logoUrl: string
  linkUrl: string
}

export type PortfolioClientLogosContent = {
  section: "client_logos"
  title: string
  logos: PortfolioClientLogo[]
}

export type PortfolioTestimonial = {
  id: string
  quote: string
  personName: string
  role: string
  company: string
  avatarUrl: string
  relatedCaseStudyId: string
}

export type PortfolioTestimonialsContent = {
  section: "testimonials"
  items: PortfolioTestimonial[]
}

export type PortfolioToolLogo = {
  id: string
  name: string
  logoUrl: string
}

export type PortfolioAboutContent = {
  section: "about_profile"
  title: string
  body: string
  skills: string[]
  toolLogos: PortfolioToolLogo[]
}

export type PortfolioContactFieldType = "text" | "email" | "textarea" | "select"

export type PortfolioContactField = {
  id: string
  name: string
  type: PortfolioContactFieldType
  label: string
  required: boolean
  options: string[]
}

export type PortfolioContactContent = {
  section: "contact_form"
  title: string
  introText: string
  successMessage: string
  destinationEmail: string
  submitLabel: string
  fields: PortfolioContactField[]
}

export type PortfolioCaseStudySections = {
  hero: PortfolioHeroContent
  services: PortfolioServicesContent
  caseStudies: PortfolioCaseStudiesContent
  clientLogos: PortfolioClientLogosContent
  testimonials: PortfolioTestimonialsContent
  about: PortfolioAboutContent
  contact: PortfolioContactContent
}

type EditorBlock = {
  type: string
  content: Record<string, unknown>
  order: number
}

function uid(prefix: string, index: number) {
  return `${prefix}-${index + 1}`
}

function asRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item || "").trim()).filter(Boolean)
}

function asCta(value: unknown, fallbackLabel: string, fallbackUrl = "#") {
  const record = asRecord(value)
  return {
    label: String(record.label || fallbackLabel).trim(),
    url: String(record.url || fallbackUrl).trim(),
  }
}

function asMetrics(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((item, index) => {
      const record = asRecord(item)
      return {
        id: String(record.id || uid("metric", index)),
        label: String(record.label || "").trim(),
        value: String(record.value || "").trim(),
      }
    })
    .filter((item) => item.label || item.value)
}

function asServices(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((item, index) => {
      const record = asRecord(item)
      return {
        id: String(record.id || uid("service", index)),
        name: String(record.name || "").trim(),
        description: String(record.description || "").trim(),
        idealFor: String(record.idealFor || "").trim(),
        relatedCaseStudyIds: asStringArray(record.relatedCaseStudyIds),
      }
    })
    .filter((item) => item.name || item.description || item.idealFor)
}

function asCaseStudies(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((item, index) => {
      const record = asRecord(item)
      return {
        id: String(record.id || uid("case-study", index)),
        clientName: String(record.clientName || "").trim(),
        clientType: String(record.clientType || "").trim(),
        industry: String(record.industry || "").trim(),
        serviceTags: asStringArray(record.serviceTags),
        title: String(record.title || "").trim(),
        summary: String(record.summary || "").trim(),
        problem: String(record.problem || "").trim(),
        solution: String(record.solution || "").trim(),
        outcome: String(record.outcome || "").trim(),
        metrics: asMetrics(record.metrics),
        coverImageUrl: String(record.coverImageUrl || "").trim(),
      }
    })
    .filter((item) => item.title || item.summary || item.problem || item.solution || item.outcome)
}

function asLogos(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((item, index) => {
      const record = asRecord(item)
      return {
        id: String(record.id || uid("logo", index)),
        name: String(record.name || "").trim(),
        logoUrl: String(record.logoUrl || "").trim(),
        linkUrl: String(record.linkUrl || "").trim(),
      }
    })
    .filter((item) => item.name || item.logoUrl)
}

function asTestimonials(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((item, index) => {
      const record = asRecord(item)
      return {
        id: String(record.id || uid("testimonial", index)),
        quote: String(record.quote || "").trim(),
        personName: String(record.personName || "").trim(),
        role: String(record.role || "").trim(),
        company: String(record.company || "").trim(),
        avatarUrl: String(record.avatarUrl || "").trim(),
        relatedCaseStudyId: String(record.relatedCaseStudyId || "").trim(),
      }
    })
    .filter((item) => item.quote || item.personName || item.company)
}

function asToolLogos(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((item, index) => {
      const record = asRecord(item)
      return {
        id: String(record.id || uid("tool", index)),
        name: String(record.name || "").trim(),
        logoUrl: String(record.logoUrl || "").trim(),
      }
    })
    .filter((item) => item.name || item.logoUrl)
}

function asContactFieldType(value: unknown): PortfolioContactFieldType {
  return value === "email" || value === "textarea" || value === "select" ? value : "text"
}

function asContactFields(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((item, index) => {
      const record = asRecord(item)
      return {
        id: String(record.id || uid("field", index)),
        name: String(record.name || "").trim() || `field_${index + 1}`,
        type: asContactFieldType(record.type),
        label: String(record.label || "").trim() || `Field ${index + 1}`,
        required: Boolean(record.required),
        options: asStringArray(record.options),
      }
    })
    .filter((item) => item.label)
}

export function createDefaultPortfolioCaseStudyBlocks(config: { title?: string; handle?: string } = {}) {
  const nameOrBrand = config.title?.trim() || "Studio Lynx"
  const handle = config.handle?.trim() || "studio-lynx"

  return [
    {
      type: "TEXT",
      order: 0,
      content: {
        section: "portfolio_hero",
        nameOrBrand,
        headline: "We design conversion-first websites and launch systems for ambitious service brands.",
        subheadline: "Show your niche, your proof, and your next step on a single sales-ready portfolio page.",
        heroImageUrl: "",
        primaryCta: { label: "Book a Discovery Call", url: `mailto:hello@${handle.replace(/[^a-z0-9-]/g, "") || "example"}.com` },
        secondaryCta: { label: "View Case Studies", url: "#case-studies" },
      } satisfies PortfolioHeroContent,
    },
    {
      type: "GRID",
      order: 1,
      content: {
        section: "services_offered",
        services: [
          {
            id: "service-1",
            name: "Brand & Positioning",
            description: "Clarify your offer, sharpen your messaging, and align your visual system with the clients you want most.",
            idealFor: "Freelancers and boutique studios repositioning for premium work.",
            relatedCaseStudyIds: ["case-study-1"],
          },
          {
            id: "service-2",
            name: "Website Design & Build",
            description: "Design and ship a polished, high-converting site that communicates trust quickly and clearly.",
            idealFor: "Service businesses launching a new offer or refreshing an outdated site.",
            relatedCaseStudyIds: ["case-study-1", "case-study-2"],
          },
          {
            id: "service-3",
            name: "Ongoing Growth Support",
            description: "Keep improving copy, experiments, and conversion paths after launch so the page compounds results.",
            idealFor: "Teams that need a retained partner after launch.",
            relatedCaseStudyIds: ["case-study-2"],
          },
        ],
      } satisfies PortfolioServicesContent,
    },
    {
      type: "GRID",
      order: 2,
      content: {
        section: "case_studies",
        featuredCaseStudyIds: ["case-study-1"],
        items: [
          {
            id: "case-study-1",
            clientName: "Northstar Advisory",
            clientType: "B2B consultancy",
            industry: "Professional services",
            serviceTags: ["Website Design", "Messaging", "Conversion Strategy"],
            title: "+42% more qualified inbound leads in 90 days",
            summary: "Reframed the offer, rebuilt the site hierarchy, and tightened CTAs so buyers understood the value immediately.",
            problem: "Their site looked credible but did not explain the service outcomes clearly enough for decision-makers to convert.",
            solution: "We rebuilt the messaging architecture, introduced proof-led case study sections, and simplified the consultation funnel.",
            outcome: "The team launched with a clearer premium narrative and saw a measurable lift in qualified leads within the first quarter.",
            metrics: [
              { id: "metric-1", label: "Qualified leads", value: "+42%" },
              { id: "metric-2", label: "Consultation bookings", value: "+28%" },
            ],
            coverImageUrl: "",
          },
          {
            id: "case-study-2",
            clientName: "Aster Creative",
            clientType: "Design studio",
            industry: "Creative services",
            serviceTags: ["Portfolio Strategy", "Case Studies", "Retainer Support"],
            title: "Turned a generic portfolio into a clear services funnel",
            summary: "Shifted the site from image-heavy showcasing to a story-led sales page with stronger qualification signals.",
            problem: "Prospects liked the visual work but did not understand what to buy or how to engage.",
            solution: "We paired service cards with proof stories, rewrote project summaries, and added a better inquiry structure.",
            outcome: "The studio started attracting better-fit inquiries with clearer budgets and timelines.",
            metrics: [
              { id: "metric-3", label: "Qualified inquiries", value: "2.3x" },
            ],
            coverImageUrl: "",
          },
        ],
      } satisfies PortfolioCaseStudiesContent,
    },
    {
      type: "GRID",
      order: 3,
      content: {
        section: "client_logos",
        title: "Trusted by teams building their next growth chapter",
        logos: [
          { id: "logo-1", name: "Northstar", logoUrl: "", linkUrl: "" },
          { id: "logo-2", name: "Aster", logoUrl: "", linkUrl: "" },
          { id: "logo-3", name: "Summit", logoUrl: "", linkUrl: "" },
        ],
      } satisfies PortfolioClientLogosContent,
    },
    {
      type: "GRID",
      order: 4,
      content: {
        section: "testimonials",
        items: [
          {
            id: "testimonial-1",
            quote: "StickyLynx helped us explain our offer in a way that finally felt premium and easy to buy.",
            personName: "Amina Yusuf",
            role: "Founder",
            company: "Northstar Advisory",
            avatarUrl: "",
            relatedCaseStudyId: "case-study-1",
          },
          {
            id: "testimonial-2",
            quote: "The new portfolio stopped being a gallery and started acting like a salesperson.",
            personName: "Daniel Reed",
            role: "Creative Director",
            company: "Aster Creative",
            avatarUrl: "",
            relatedCaseStudyId: "case-study-2",
          },
        ],
      } satisfies PortfolioTestimonialsContent,
    },
    {
      type: "TEXT",
      order: 5,
      content: {
        section: "about_profile",
        title: "Why clients hire us",
        body: "Use this section to explain your approach, your niche, and the thinking behind your work. Keep it outcome-focused so prospects understand what makes your process different.\n\nPair your story with the skills and tools that support delivery so the page builds both trust and clarity.",
        skills: ["Figma", "Next.js", "Copywriting", "Conversion Strategy"],
        toolLogos: [],
      } satisfies PortfolioAboutContent,
    },
    {
      type: "CONTACT",
      order: 6,
      content: {
        section: "contact_form",
        title: "Tell us about your next project",
        introText: "Share your goals, timeline, and scope. We will reach out with next steps and fit guidance.",
        successMessage: "Opening your email client with your project details.",
        destinationEmail: "hello@stickylynx.online",
        submitLabel: "Request a Proposal",
        fields: [
          { id: "field-1", name: "name", type: "text", label: "Your name", required: true, options: [] },
          { id: "field-2", name: "email", type: "email", label: "Email address", required: true, options: [] },
          { id: "field-3", name: "company", type: "text", label: "Company", required: false, options: [] },
          { id: "field-4", name: "projectSummary", type: "textarea", label: "Project summary", required: true, options: [] },
          {
            id: "field-5",
            name: "budget",
            type: "select",
            label: "Budget range",
            required: false,
            options: ["Under $5k", "$5k - $10k", "$10k - $25k", "$25k+"],
          },
        ],
      } satisfies PortfolioContactContent,
    },
  ] satisfies EditorBlock[]
}

export function getPortfolioCaseStudySections(blocks: Array<{ type: string; content?: unknown }>): PortfolioCaseStudySections {
  const defaults = createDefaultPortfolioCaseStudyBlocks()

  const heroSource = asRecord(findEditorBlock(blocks, "TEXT", "portfolio_hero")?.content || defaults[0].content)
  const servicesSource = asRecord(findEditorBlock(blocks, "GRID", "services_offered")?.content || defaults[1].content)
  const caseStudiesSource = asRecord(findEditorBlock(blocks, "GRID", "case_studies")?.content || defaults[2].content)
  const logosSource = asRecord(findEditorBlock(blocks, "GRID", "client_logos")?.content || defaults[3].content)
  const testimonialsSource = asRecord(findEditorBlock(blocks, "GRID", "testimonials")?.content || defaults[4].content)
  const aboutSource = asRecord(findEditorBlock(blocks, "TEXT", "about_profile")?.content || defaults[5].content)
  const contactSource = asRecord(findEditorBlock(blocks, "CONTACT", "contact_form")?.content || defaults[6].content)

  return {
    hero: {
      section: "portfolio_hero",
      nameOrBrand: String(heroSource.nameOrBrand || ""),
      headline: String(heroSource.headline || ""),
      subheadline: String(heroSource.subheadline || ""),
      heroImageUrl: String(heroSource.heroImageUrl || ""),
      primaryCta: asCta(heroSource.primaryCta, "Book a Discovery Call"),
      secondaryCta: asCta(heroSource.secondaryCta, "View Case Studies"),
    },
    services: {
      section: "services_offered",
      services: asServices(servicesSource.services),
    },
    caseStudies: {
      section: "case_studies",
      featuredCaseStudyIds: asStringArray(caseStudiesSource.featuredCaseStudyIds),
      items: asCaseStudies(caseStudiesSource.items),
    },
    clientLogos: {
      section: "client_logos",
      title: String(logosSource.title || ""),
      logos: asLogos(logosSource.logos),
    },
    testimonials: {
      section: "testimonials",
      items: asTestimonials(testimonialsSource.items),
    },
    about: {
      section: "about_profile",
      title: String(aboutSource.title || ""),
      body: String(aboutSource.body || ""),
      skills: asStringArray(aboutSource.skills),
      toolLogos: asToolLogos(aboutSource.toolLogos),
    },
    contact: {
      section: "contact_form",
      title: String(contactSource.title || ""),
      introText: String(contactSource.introText || ""),
      successMessage: String(contactSource.successMessage || ""),
      destinationEmail: String(contactSource.destinationEmail || ""),
      submitLabel: String(contactSource.submitLabel || "Send Inquiry"),
      fields: asContactFields(contactSource.fields),
    },
  }
}
