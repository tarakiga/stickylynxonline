"use client";

import * as React from "react";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dropzone } from "@/components/ui/Dropzone";
import { Toaster, showToast } from "@/components/ui/Toast";
import { uploadAssetFile } from "@/lib/upload-client";
import {
  getPortfolioCaseStudySections,
  type PortfolioAboutContent,
  type PortfolioCaseStudiesContent,
  type PortfolioCaseStudy,
  type PortfolioClientLogo,
  type PortfolioClientLogosContent,
  type PortfolioContactContent,
  type PortfolioHeroContent,
  type PortfolioMetric,
  type PortfolioServiceItem,
  type PortfolioServicesContent,
  type PortfolioTestimonial,
  type PortfolioTestimonialsContent,
} from "@/lib/portfolio-case-study";
import type { EditorPage } from "@/types/editor-page";
import { findEditorBlock } from "@/types/editor-page";

type PortfolioPage = EditorPage & {
  blocks?: Array<{ type: string; content?: unknown; order?: number }>
};

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatCommaList(values: string[]) {
  return values.join(", ");
}

export function PortfolioCaseStudyEditor({ page }: { page: PortfolioPage }) {
  const blocks = React.useMemo(() => page.blocks || [], [page.blocks]);
  const sections = React.useMemo(() => getPortfolioCaseStudySections(blocks), [blocks]);

  const [hero, setHero] = React.useState<PortfolioHeroContent>(sections.hero);
  const [services, setServices] = React.useState<PortfolioServiceItem[]>(sections.services.services);
  const [caseStudies, setCaseStudies] = React.useState<PortfolioCaseStudy[]>(sections.caseStudies.items);
  const [featuredCaseStudyIds, setFeaturedCaseStudyIds] = React.useState<string[]>(sections.caseStudies.featuredCaseStudyIds);
  const [logosTitle, setLogosTitle] = React.useState(sections.clientLogos.title);
  const [logos, setLogos] = React.useState<PortfolioClientLogo[]>(sections.clientLogos.logos);
  const [testimonials, setTestimonials] = React.useState<PortfolioTestimonial[]>(sections.testimonials.items);
  const [about, setAbout] = React.useState<PortfolioAboutContent>(sections.about);
  const [contact, setContact] = React.useState<PortfolioContactContent>(sections.contact);
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);

  const markDirty = React.useCallback(() => setDirty(true), []);
  const handleViewPublic = React.useCallback(() => window.open(`/${page.handle}`, "_blank"), [page.handle]);

  async function handleHeroUpload(file: File) {
    try {
      const upload = await uploadAssetFile(file, { kind: "image", pageId: page.id });
      setHero((current) => ({ ...current, heroImageUrl: upload.secureUrl }));
      setDirty(true);
      showToast("Hero image uploaded", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to upload hero image", "error");
    }
  }

  function updateService(id: string, updater: (current: PortfolioServiceItem) => PortfolioServiceItem) {
    setServices((current) => current.map((item) => (item.id === id ? updater(item) : item)));
    markDirty();
  }

  function updateCaseStudy(id: string, updater: (current: PortfolioCaseStudy) => PortfolioCaseStudy) {
    setCaseStudies((current) => current.map((item) => (item.id === id ? updater(item) : item)));
    markDirty();
  }

  function updateMetric(caseStudyId: string, metricId: string, updater: (current: PortfolioMetric) => PortfolioMetric) {
    setCaseStudies((current) =>
      current.map((study) =>
        study.id === caseStudyId
          ? { ...study, metrics: study.metrics.map((metric) => (metric.id === metricId ? updater(metric) : metric)) }
          : study
      )
    );
    markDirty();
  }

  function updateLogo(id: string, updater: (current: PortfolioClientLogo) => PortfolioClientLogo) {
    setLogos((current) => current.map((item) => (item.id === id ? updater(item) : item)));
    markDirty();
  }

  function updateTestimonial(id: string, updater: (current: PortfolioTestimonial) => PortfolioTestimonial) {
    setTestimonials((current) => current.map((item) => (item.id === id ? updater(item) : item)));
    markDirty();
  }

  function updateContactField(fieldId: string, updater: (current: PortfolioContactContent["fields"][number]) => PortfolioContactContent["fields"][number]) {
    setContact((current) => ({
      ...current,
      fields: current.fields.map((field) => (field.id === fieldId ? updater(field) : field)),
    }));
    markDirty();
  }

  function addService() {
    setServices((current) => [
      ...current,
      {
        id: uid("service"),
        name: "",
        description: "",
        idealFor: "",
        relatedCaseStudyIds: [],
      },
    ]);
    markDirty();
  }

  function addCaseStudy() {
    setCaseStudies((current) => [
      ...current,
      {
        id: uid("case-study"),
        clientName: "",
        clientType: "",
        industry: "",
        serviceTags: [],
        title: "",
        summary: "",
        problem: "",
        solution: "",
        outcome: "",
        metrics: [],
        coverImageUrl: "",
      },
    ]);
    markDirty();
  }

  function addMetric(caseStudyId: string) {
    setCaseStudies((current) =>
      current.map((study) =>
        study.id === caseStudyId
          ? {
              ...study,
              metrics: [...study.metrics, { id: uid("metric"), label: "", value: "" }],
            }
          : study
      )
    );
    markDirty();
  }

  function addLogo() {
    setLogos((current) => [...current, { id: uid("logo"), name: "", logoUrl: "", linkUrl: "" }]);
    markDirty();
  }

  function addTestimonial() {
    setTestimonials((current) => [
      ...current,
      {
        id: uid("testimonial"),
        quote: "",
        personName: "",
        role: "",
        company: "",
        avatarUrl: "",
        relatedCaseStudyId: "",
      },
    ]);
    markDirty();
  }

  function addContactField() {
    setContact((current) => ({
      ...current,
      fields: [
        ...current.fields,
        {
          id: uid("field"),
          name: "",
          type: "text",
          label: "",
          required: false,
          options: [],
        },
      ],
    }));
    markDirty();
  }

  function removeService(id: string) {
    setServices((current) => current.filter((item) => item.id !== id));
    markDirty();
  }

  function removeCaseStudy(id: string) {
    setCaseStudies((current) => current.filter((item) => item.id !== id));
    setFeaturedCaseStudyIds((current) => current.filter((item) => item !== id));
    markDirty();
  }

  function removeMetric(caseStudyId: string, metricId: string) {
    setCaseStudies((current) =>
      current.map((study) =>
        study.id === caseStudyId
          ? { ...study, metrics: study.metrics.filter((metric) => metric.id !== metricId) }
          : study
      )
    );
    markDirty();
  }

  function removeLogo(id: string) {
    setLogos((current) => current.filter((item) => item.id !== id));
    markDirty();
  }

  function removeTestimonial(id: string) {
    setTestimonials((current) => current.filter((item) => item.id !== id));
    markDirty();
  }

  function removeContactField(id: string) {
    setContact((current) => ({
      ...current,
      fields: current.fields.filter((field) => field.id !== id),
    }));
    markDirty();
  }

  async function handleSave() {
    setSaving(true);

    const heroBlock = findEditorBlock(blocks, "TEXT", "portfolio_hero");
    const servicesBlock = findEditorBlock(blocks, "GRID", "services_offered");
    const caseStudiesBlock = findEditorBlock(blocks, "GRID", "case_studies");
    const logosBlock = findEditorBlock(blocks, "GRID", "client_logos");
    const testimonialsBlock = findEditorBlock(blocks, "GRID", "testimonials");
    const aboutBlock = findEditorBlock(blocks, "TEXT", "about_profile");
    const contactBlock = findEditorBlock(blocks, "CONTACT", "contact_form");

    const assembled = [
      {
        type: "TEXT",
        order: heroBlock?.order ?? 0,
        content: hero,
      },
      {
        type: "GRID",
        order: servicesBlock?.order ?? 1,
        content: {
          section: "services_offered",
          services,
        } satisfies PortfolioServicesContent,
      },
      {
        type: "GRID",
        order: caseStudiesBlock?.order ?? 2,
        content: {
          section: "case_studies",
          featuredCaseStudyIds,
          items: caseStudies,
        } satisfies PortfolioCaseStudiesContent,
      },
      {
        type: "GRID",
        order: logosBlock?.order ?? 3,
        content: {
          section: "client_logos",
          title: logosTitle,
          logos,
        } satisfies PortfolioClientLogosContent,
      },
      {
        type: "GRID",
        order: testimonialsBlock?.order ?? 4,
        content: {
          section: "testimonials",
          items: testimonials,
        } satisfies PortfolioTestimonialsContent,
      },
      {
        type: "TEXT",
        order: aboutBlock?.order ?? 5,
        content: about,
      },
      {
        type: "CONTACT",
        order: contactBlock?.order ?? 6,
        content: contact,
      },
    ];

    try {
      const response = await fetch(`/api/editor/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks: assembled }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Failed to save changes");
      }

      setDirty(false);
      showToast("Portfolio page saved", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to save changes", "error");
    } finally {
      setSaving(false);
    }
  }

  const actionButtons = (
    <>
      <Button variant="secondary" onClick={handleViewPublic} className="py-2 px-4 shadow-sm text-xs rounded-xl cursor-pointer whitespace-nowrap">
        Preview
      </Button>
      <Button variant="primary" onClick={handleSave} disabled={saving || !dirty} className="py-2 px-5 shadow-sm text-sm cursor-pointer border-none text-white whitespace-nowrap">
        {saving ? "Saving…" : "Save Changes"}
      </Button>
    </>
  );

  return (
    <>
      <Toaster />
      <div className="w-full max-w-5xl mx-auto space-y-8">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col items-start justify-between gap-3 shadow-sm sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-primary text-sm font-semibold">
            <Badge variant="primary">Portfolio</Badge>
            <span>Edit Mode</span>
            {dirty ? <span className="text-warning">· Unsaved changes</span> : null}
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
            {actionButtons}
          </div>
        </div>

        <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-premium space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl text-text-primary">Hero & Positioning</h3>
            <Badge variant="success" className="text-[10px] px-2 py-0.5">Hero</Badge>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input labelInside="Brand or Name" value={hero.nameOrBrand} onChange={(event) => { setHero((current) => ({ ...current, nameOrBrand: event.target.value })); markDirty(); }} />
            <Input labelInside="Headline" value={hero.headline} onChange={(event) => { setHero((current) => ({ ...current, headline: event.target.value })); markDirty(); }} />
            <div className="md:col-span-2">
              <Textarea rows={3} value={hero.subheadline} onChange={(event) => { setHero((current) => ({ ...current, subheadline: event.target.value })); markDirty(); }} placeholder="Explain what you do, who you help, and why it matters." />
            </div>
            <Input labelInside="Primary CTA Label" value={hero.primaryCta.label} onChange={(event) => { setHero((current) => ({ ...current, primaryCta: { ...current.primaryCta, label: event.target.value } })); markDirty(); }} />
            <Input labelInside="Primary CTA URL" value={hero.primaryCta.url} onChange={(event) => { setHero((current) => ({ ...current, primaryCta: { ...current.primaryCta, url: event.target.value } })); markDirty(); }} />
            <Input labelInside="Secondary CTA Label" value={hero.secondaryCta.label} onChange={(event) => { setHero((current) => ({ ...current, secondaryCta: { ...current.secondaryCta, label: event.target.value } })); markDirty(); }} />
            <Input labelInside="Secondary CTA URL" value={hero.secondaryCta.url} onChange={(event) => { setHero((current) => ({ ...current, secondaryCta: { ...current.secondaryCta, url: event.target.value } })); markDirty(); }} />
            <div className="md:col-span-2 grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <Dropzone label="Hero Image" hint="PNG, JPG, WEBP up to 10MB" accept="image/*" onChange={handleHeroUpload} />
              <div className="rounded-2xl border border-divider bg-background p-3">
                {hero.heroImageUrl ? (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-divider">
                    <Image src={hero.heroImageUrl} alt={hero.nameOrBrand || page.title || "Portfolio hero"} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-divider text-sm font-medium text-text-secondary">
                    Hero preview will appear here
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-premium space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-xl text-text-primary">Services Offered</h3>
              <p className="text-sm text-text-secondary">Pair each service with the problems it solves and the case studies that prove it.</p>
            </div>
            <Button variant="secondary" onClick={addService} className="rounded-xl cursor-pointer">
              <Plus size={16} className="mr-2" />
              Add Service
            </Button>
          </div>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={service.id} className="rounded-2xl border border-divider bg-background p-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="neutral" className="text-[10px] px-2 py-0.5">Service {index + 1}</Badge>
                  <Button variant="ghost" onClick={() => removeService(service.id)} className="rounded-xl cursor-pointer text-error hover:text-error">
                    <Trash2 size={16} className="mr-2" />
                    Remove
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input labelInside="Service Name" value={service.name} onChange={(event) => updateService(service.id, (current) => ({ ...current, name: event.target.value }))} />
                  <Input labelInside="Related Case Study IDs" value={formatCommaList(service.relatedCaseStudyIds)} onChange={(event) => updateService(service.id, (current) => ({ ...current, relatedCaseStudyIds: parseCommaList(event.target.value) }))} />
                  <div className="md:col-span-2">
                    <Textarea rows={3} value={service.description} onChange={(event) => updateService(service.id, (current) => ({ ...current, description: event.target.value }))} placeholder="What is included and what outcome should the client expect?" />
                  </div>
                  <div className="md:col-span-2">
                    <Textarea rows={2} value={service.idealFor} onChange={(event) => updateService(service.id, (current) => ({ ...current, idealFor: event.target.value }))} placeholder="Ideal client, use case, or growth stage." />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-premium space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-xl text-text-primary">Featured Case Studies</h3>
              <p className="text-sm text-text-secondary">Use the problem → solution → outcome pattern so every proof story sells your process.</p>
            </div>
            <Button variant="secondary" onClick={addCaseStudy} className="rounded-xl cursor-pointer">
              <Plus size={16} className="mr-2" />
              Add Case Study
            </Button>
          </div>
          <Input labelInside="Featured Case Study IDs" value={formatCommaList(featuredCaseStudyIds)} onChange={(event) => { setFeaturedCaseStudyIds(parseCommaList(event.target.value)); markDirty(); }} />
          <div className="space-y-6">
            {caseStudies.map((caseStudy, index) => (
              <div key={caseStudy.id} className="rounded-2xl border border-divider bg-background p-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="warning" className="text-[10px] px-2 py-0.5">Case Study {index + 1}</Badge>
                  <Button variant="ghost" onClick={() => removeCaseStudy(caseStudy.id)} className="rounded-xl cursor-pointer text-error hover:text-error">
                    <Trash2 size={16} className="mr-2" />
                    Remove
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input labelInside="Client Name" value={caseStudy.clientName} onChange={(event) => updateCaseStudy(caseStudy.id, (current) => ({ ...current, clientName: event.target.value }))} />
                  <Input labelInside="Client Type" value={caseStudy.clientType} onChange={(event) => updateCaseStudy(caseStudy.id, (current) => ({ ...current, clientType: event.target.value }))} />
                  <Input labelInside="Industry" value={caseStudy.industry} onChange={(event) => updateCaseStudy(caseStudy.id, (current) => ({ ...current, industry: event.target.value }))} />
                  <Input labelInside="Service Tags" value={formatCommaList(caseStudy.serviceTags)} onChange={(event) => updateCaseStudy(caseStudy.id, (current) => ({ ...current, serviceTags: parseCommaList(event.target.value) }))} />
                  <div className="md:col-span-2">
                    <Input labelInside="Outcome Headline" value={caseStudy.title} onChange={(event) => updateCaseStudy(caseStudy.id, (current) => ({ ...current, title: event.target.value }))} />
                  </div>
                  <div className="md:col-span-2">
                    <Textarea rows={2} value={caseStudy.summary} onChange={(event) => updateCaseStudy(caseStudy.id, (current) => ({ ...current, summary: event.target.value }))} placeholder="Short teaser that explains the transformation." />
                  </div>
                  <div className="md:col-span-2">
                    <Input labelInside="Cover Image URL" value={caseStudy.coverImageUrl} onChange={(event) => updateCaseStudy(caseStudy.id, (current) => ({ ...current, coverImageUrl: event.target.value }))} />
                  </div>
                  <Textarea rows={4} value={caseStudy.problem} onChange={(event) => updateCaseStudy(caseStudy.id, (current) => ({ ...current, problem: event.target.value }))} placeholder="Problem" />
                  <Textarea rows={4} value={caseStudy.solution} onChange={(event) => updateCaseStudy(caseStudy.id, (current) => ({ ...current, solution: event.target.value }))} placeholder="Solution" />
                  <div className="md:col-span-2">
                    <Textarea rows={4} value={caseStudy.outcome} onChange={(event) => updateCaseStudy(caseStudy.id, (current) => ({ ...current, outcome: event.target.value }))} placeholder="Outcome" />
                  </div>
                </div>
                <div className="rounded-2xl border border-divider bg-surface p-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-text-primary">Result Metrics</h4>
                      <p className="text-xs text-text-secondary">Add optional proof points for this story.</p>
                    </div>
                    <Button variant="secondary" onClick={() => addMetric(caseStudy.id)} className="rounded-xl cursor-pointer">
                      <Plus size={16} className="mr-2" />
                      Add Metric
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {caseStudy.metrics.map((metric) => (
                      <div key={metric.id} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
                        <Input labelInside="Metric Label" value={metric.label} onChange={(event) => updateMetric(caseStudy.id, metric.id, (current) => ({ ...current, label: event.target.value }))} />
                        <Input labelInside="Metric Value" value={metric.value} onChange={(event) => updateMetric(caseStudy.id, metric.id, (current) => ({ ...current, value: event.target.value }))} />
                        <Button variant="ghost" onClick={() => removeMetric(caseStudy.id, metric.id)} className="self-end rounded-xl cursor-pointer text-error hover:text-error">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-premium space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-xl text-text-primary">Client Logos</h3>
              <p className="text-sm text-text-secondary">Show recognizable trust markers, even if some entries are anonymized.</p>
            </div>
            <Button variant="secondary" onClick={addLogo} className="rounded-xl cursor-pointer">
              <Plus size={16} className="mr-2" />
              Add Logo
            </Button>
          </div>
          <Input labelInside="Section Title" value={logosTitle} onChange={(event) => { setLogosTitle(event.target.value); markDirty(); }} />
          <div className="space-y-3">
            {logos.map((logo) => (
              <div key={logo.id} className="rounded-2xl border border-divider bg-background p-4 grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
                <Input labelInside="Client Name" value={logo.name} onChange={(event) => updateLogo(logo.id, (current) => ({ ...current, name: event.target.value }))} />
                <Input labelInside="Logo URL" value={logo.logoUrl} onChange={(event) => updateLogo(logo.id, (current) => ({ ...current, logoUrl: event.target.value }))} />
                <Input labelInside="Link URL" value={logo.linkUrl} onChange={(event) => updateLogo(logo.id, (current) => ({ ...current, linkUrl: event.target.value }))} />
                <Button variant="ghost" onClick={() => removeLogo(logo.id)} className="self-end rounded-xl cursor-pointer text-error hover:text-error">
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-premium space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-xl text-text-primary">Testimonials</h3>
              <p className="text-sm text-text-secondary">Keep each quote tied to a person, role, and company for credibility.</p>
            </div>
            <Button variant="secondary" onClick={addTestimonial} className="rounded-xl cursor-pointer">
              <Plus size={16} className="mr-2" />
              Add Testimonial
            </Button>
          </div>
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="rounded-2xl border border-divider bg-background p-4 space-y-4">
                <div className="flex items-center justify-end">
                  <Button variant="ghost" onClick={() => removeTestimonial(testimonial.id)} className="rounded-xl cursor-pointer text-error hover:text-error">
                    <Trash2 size={16} className="mr-2" />
                    Remove
                  </Button>
                </div>
                <Textarea rows={3} value={testimonial.quote} onChange={(event) => updateTestimonial(testimonial.id, (current) => ({ ...current, quote: event.target.value }))} placeholder="Client quote" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input labelInside="Person Name" value={testimonial.personName} onChange={(event) => updateTestimonial(testimonial.id, (current) => ({ ...current, personName: event.target.value }))} />
                  <Input labelInside="Role" value={testimonial.role} onChange={(event) => updateTestimonial(testimonial.id, (current) => ({ ...current, role: event.target.value }))} />
                  <Input labelInside="Company" value={testimonial.company} onChange={(event) => updateTestimonial(testimonial.id, (current) => ({ ...current, company: event.target.value }))} />
                  <Input labelInside="Related Case Study ID" value={testimonial.relatedCaseStudyId} onChange={(event) => updateTestimonial(testimonial.id, (current) => ({ ...current, relatedCaseStudyId: event.target.value }))} />
                  <div className="md:col-span-2">
                    <Input labelInside="Avatar URL" value={testimonial.avatarUrl} onChange={(event) => updateTestimonial(testimonial.id, (current) => ({ ...current, avatarUrl: event.target.value }))} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-premium space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl text-text-primary">About & Contact</h3>
            <Badge variant="info" className="text-[10px] px-2 py-0.5">Conversion</Badge>
          </div>
          <div className="space-y-4">
            <Input labelInside="About Title" value={about.title} onChange={(event) => { setAbout((current) => ({ ...current, title: event.target.value })); markDirty(); }} />
            <Textarea rows={6} value={about.body} onChange={(event) => { setAbout((current) => ({ ...current, body: event.target.value })); markDirty(); }} placeholder="Explain your background, approach, and what makes your process different." />
            <Input labelInside="Skills" value={formatCommaList(about.skills)} onChange={(event) => { setAbout((current) => ({ ...current, skills: parseCommaList(event.target.value) })); markDirty(); }} />
          </div>
          <div className="rounded-2xl border border-divider bg-background p-4 space-y-4">
            <h4 className="font-semibold text-text-primary">Inquiry Form</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input labelInside="Section Title" value={contact.title} onChange={(event) => { setContact((current) => ({ ...current, title: event.target.value })); markDirty(); }} />
              <Input labelInside="Destination Email" value={contact.destinationEmail} onChange={(event) => { setContact((current) => ({ ...current, destinationEmail: event.target.value })); markDirty(); }} />
              <Input labelInside="Submit Label" value={contact.submitLabel} onChange={(event) => { setContact((current) => ({ ...current, submitLabel: event.target.value })); markDirty(); }} />
              <Input labelInside="Success Message" value={contact.successMessage} onChange={(event) => { setContact((current) => ({ ...current, successMessage: event.target.value })); markDirty(); }} />
              <div className="md:col-span-2">
                <Textarea rows={3} value={contact.introText} onChange={(event) => { setContact((current) => ({ ...current, introText: event.target.value })); markDirty(); }} placeholder="Tell prospects what to include in their inquiry." />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h5 className="font-semibold text-text-primary">Fields</h5>
                <p className="text-xs text-text-secondary">Control the inquiry fields shown on the public page.</p>
              </div>
              <Button variant="secondary" onClick={addContactField} className="rounded-xl cursor-pointer">
                <Plus size={16} className="mr-2" />
                Add Field
              </Button>
            </div>
            <div className="space-y-4">
              {contact.fields.map((field) => (
                <div key={field.id} className="rounded-2xl border border-divider bg-surface p-4 grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_0.8fr_auto]">
                  <Input labelInside="Field Label" value={field.label} onChange={(event) => updateContactField(field.id, (current) => ({ ...current, label: event.target.value }))} />
                  <Input labelInside="Field Name" value={field.name} onChange={(event) => updateContactField(field.id, (current) => ({ ...current, name: event.target.value }))} />
                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-text-secondary">Type</span>
                    <select
                      value={field.type}
                      onChange={(event) => updateContactField(field.id, (current) => ({ ...current, type: event.target.value as PortfolioContactContent["fields"][number]["type"] }))}
                      className="w-full input-base px-4 py-3 appearance-none cursor-pointer text-text-primary bg-background focus:ring-primary-light"
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="textarea">Textarea</option>
                      <option value="select">Select</option>
                    </select>
                  </div>
                  <Button variant="ghost" onClick={() => removeContactField(field.id)} className="self-end rounded-xl cursor-pointer text-error hover:text-error">
                    <Trash2 size={16} />
                  </Button>
                  <div className="md:col-span-4 flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-text-primary">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(event) => updateContactField(field.id, (current) => ({ ...current, required: event.target.checked }))}
                        className="h-4 w-4 rounded border-divider"
                      />
                      Required
                    </label>
                    {field.type === "select" ? (
                      <div className="flex-1">
                        <Input labelInside="Select Options" value={formatCommaList(field.options)} onChange={(event) => updateContactField(field.id, (current) => ({ ...current, options: parseCommaList(event.target.value) }))} />
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
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
    </>
  );
}
