"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Toaster, showToast } from "@/components/ui/Toast";
import { getPortfolioCaseStudySections, type PortfolioContactField } from "@/lib/portfolio-case-study";
import type { EditorPage } from "@/types/editor-page";

type PortfolioPage = EditorPage & {
  blocks?: Array<{ type: string; content?: unknown; order?: number }>
};

function buildInitialValues(fields: PortfolioContactField[]) {
  return fields.reduce<Record<string, string>>((accumulator, field) => {
    accumulator[field.name] = "";
    return accumulator;
  }, {});
}

function ensureHref(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "#";
  if (trimmed.startsWith("#")) return trimmed;
  if (/^(mailto:|tel:|https?:\/\/)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function PortfolioCaseStudyPublic({ page }: { page: PortfolioPage }) {
  const sections = React.useMemo(() => getPortfolioCaseStudySections(page.blocks || []), [page.blocks]);
  const { hero, services, caseStudies, clientLogos, testimonials, about, contact } = sections;
  const [formValues, setFormValues] = React.useState<Record<string, string>>(() => buildInitialValues(contact.fields));

  React.useEffect(() => {
    setFormValues(buildInitialValues(contact.fields));
  }, [contact.fields]);

  function setFieldValue(name: string, value: string) {
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const missing = contact.fields.find((field) => field.required && !formValues[field.name]?.trim());
    if (missing) {
      showToast(`${missing.label} is required`, "warning");
      return;
    }

    if (!contact.destinationEmail.trim()) {
      showToast("Add a destination email in the editor before publishing inquiries", "warning");
      return;
    }

    const subject = `${hero.nameOrBrand || page.title || "Portfolio"} inquiry`;
    const body = contact.fields
      .map((field) => `${field.label}: ${formValues[field.name] || ""}`)
      .join("\n");

    window.location.href = `mailto:${encodeURIComponent(contact.destinationEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showToast(contact.successMessage || "Opening your email client.", "success");
  }

  return (
    <>
      <Toaster />
      <div className="pb-20">
        <section className="border-b border-divider bg-[radial-gradient(circle_at_top_right,rgba(109,40,217,0.14),transparent_32%),linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.94))]">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
            <div className="space-y-6">
              <Badge variant="primary" className="rounded-full px-3 py-1 text-[10px] tracking-[0.18em] uppercase">
                Portfolio & Case Studies
              </Badge>
              <div className="space-y-4">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">{hero.nameOrBrand || page.title || page.handle}</p>
                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
                  {hero.headline || page.title || page.handle}
                </h1>
                {hero.subheadline ? (
                  <p className="max-w-2xl text-lg font-medium leading-8 text-text-secondary">
                    {hero.subheadline}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                {hero.primaryCta.label ? (
                  <a href={ensureHref(hero.primaryCta.url)} className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white border-none cursor-pointer">
                    {hero.primaryCta.label}
                    <ArrowRight size={16} />
                  </a>
                ) : null}
                {hero.secondaryCta.label ? (
                  <a href={ensureHref(hero.secondaryCta.url)} className="inline-flex items-center justify-center gap-2 rounded-full border border-divider bg-surface px-6 py-3 text-sm font-bold text-text-primary shadow-sm transition hover:border-primary/30 hover:text-primary">
                    {hero.secondaryCta.label}
                  </a>
                ) : null}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 translate-y-6 rounded-[2rem] bg-primary/10 blur-3xl" />
              <Card className="relative overflow-hidden rounded-[2rem] border border-divider bg-surface p-4 shadow-premium">
                {hero.heroImageUrl ? (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
                    <Image src={hero.heroImageUrl} alt={hero.nameOrBrand || page.title || "Portfolio hero"} fill className="object-cover" priority />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center rounded-[1.5rem] border border-dashed border-divider bg-background px-8 text-center">
                    <div className="space-y-3">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Proof-led positioning</p>
                      <p className="text-2xl font-bold text-text-primary">Lead with outcomes, back it up with proof, and finish with a clear inquiry path.</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-3">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Services</p>
            <h2 className="text-3xl font-black tracking-tight text-text-primary sm:text-4xl">What we help clients launch and improve</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.services.map((service) => (
              <Card key={service.id} className="rounded-[1.75rem] border border-divider bg-surface p-6 shadow-sm space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-text-primary">{service.name}</h3>
                  {service.description ? <p className="text-sm leading-7 text-text-secondary">{service.description}</p> : null}
                </div>
                {service.idealFor ? (
                  <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm font-medium text-text-primary">
                    Ideal for: {service.idealFor}
                  </div>
                ) : null}
                {service.relatedCaseStudyIds.length ? (
                  <div className="flex flex-wrap gap-2">
                    {service.relatedCaseStudyIds.map((caseStudyId) => (
                      <Badge key={caseStudyId} variant="neutral" className="rounded-full px-3 py-1 text-[11px]">
                        {caseStudyId}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        </section>

        <section id="case-studies" className="border-y border-divider bg-surface/70">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-8 space-y-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Case Studies</p>
              <h2 className="text-3xl font-black tracking-tight text-text-primary sm:text-4xl">Proof stories built around problem, solution, and outcome</h2>
            </div>
            <div className="grid gap-8">
              {caseStudies.items.map((caseStudy) => (
                <Card key={caseStudy.id} className="overflow-hidden rounded-[2rem] border border-divider bg-background shadow-premium">
                  <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="border-b border-divider bg-surface p-6 lg:border-b-0 lg:border-r lg:p-8">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          {caseStudies.featuredCaseStudyIds.includes(caseStudy.id) ? (
                            <Badge variant="primary" className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em]">
                              Featured
                            </Badge>
                          ) : null}
                          {caseStudy.industry ? (
                            <Badge variant="neutral" className="rounded-full px-3 py-1 text-[11px]">
                              {caseStudy.industry}
                            </Badge>
                          ) : null}
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-black tracking-tight text-text-primary">{caseStudy.title}</h3>
                          {caseStudy.summary ? <p className="text-sm leading-7 text-text-secondary">{caseStudy.summary}</p> : null}
                        </div>
                        {(caseStudy.clientName || caseStudy.clientType) ? (
                          <div className="rounded-2xl border border-divider bg-background px-4 py-3 text-sm font-medium text-text-primary">
                            {[caseStudy.clientName, caseStudy.clientType].filter(Boolean).join(" • ")}
                          </div>
                        ) : null}
                        {caseStudy.serviceTags.length ? (
                          <div className="flex flex-wrap gap-2">
                            {caseStudy.serviceTags.map((tag) => (
                              <Badge key={tag} variant="info" className="rounded-full px-3 py-1 text-[11px]">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                        {caseStudy.metrics.length ? (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {caseStudy.metrics.map((metric) => (
                              <div key={metric.id} className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-4">
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{metric.label}</p>
                                <p className="mt-2 text-2xl font-black text-text-primary">{metric.value}</p>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="p-6 lg:p-8">
                      {caseStudy.coverImageUrl ? (
                        <div className="relative mb-6 aspect-video overflow-hidden rounded-[1.5rem] border border-divider">
                          <Image src={caseStudy.coverImageUrl} alt={caseStudy.title || "Case study cover"} fill className="object-cover" />
                        </div>
                      ) : null}
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-divider bg-surface p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Problem</p>
                          <p className="mt-3 text-sm leading-7 text-text-secondary">{caseStudy.problem}</p>
                        </div>
                        <div className="rounded-2xl border border-divider bg-surface p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Solution</p>
                          <p className="mt-3 text-sm leading-7 text-text-secondary">{caseStudy.solution}</p>
                        </div>
                        <div className="rounded-2xl border border-divider bg-surface p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Outcome</p>
                          <p className="mt-3 text-sm leading-7 text-text-secondary">{caseStudy.outcome}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {(clientLogos.logos.length || testimonials.items.length) ? (
          <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Social Proof</p>
                <h2 className="text-3xl font-black tracking-tight text-text-primary sm:text-4xl">{clientLogos.title || "Trusted by teams who need proof and polish"}</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {clientLogos.logos.map((logo) => (
                    <a
                      key={logo.id}
                      href={logo.linkUrl ? ensureHref(logo.linkUrl) : undefined}
                      target={logo.linkUrl ? "_blank" : undefined}
                      rel={logo.linkUrl ? "noopener noreferrer" : undefined}
                      className="flex min-h-24 items-center justify-center rounded-2xl border border-divider bg-surface px-4 py-4 text-center shadow-sm transition hover:border-primary/25"
                    >
                      {logo.logoUrl ? (
                        <div className="relative h-10 w-full">
                          <Image src={logo.logoUrl} alt={logo.name || "Client logo"} fill className="object-contain" />
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-text-primary">{logo.name || "Client"}</span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
              <div className="grid gap-4">
                {testimonials.items.map((testimonial) => (
                  <Card key={testimonial.id} className="rounded-[1.75rem] border border-divider bg-surface p-6 shadow-sm">
                    <div className="flex gap-4">
                      {testimonial.avatarUrl ? (
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-divider">
                          <Image src={testimonial.avatarUrl} alt={testimonial.personName || "Client"} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-black text-primary">
                          {(testimonial.personName || testimonial.company || "C").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="space-y-3">
                        <p className="text-base font-medium leading-8 text-text-primary">“{testimonial.quote}”</p>
                        <div className="text-sm text-text-secondary">
                          <p className="font-bold text-text-primary">{testimonial.personName}</p>
                          <p>{[testimonial.role, testimonial.company].filter(Boolean).join(" • ")}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="border-y border-divider bg-surface/70">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
            <div className="space-y-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">About</p>
              <h2 className="text-3xl font-black tracking-tight text-text-primary sm:text-4xl">{about.title || "Why clients choose this process"}</h2>
              {about.body ? <p className="whitespace-pre-line text-base leading-8 text-text-secondary">{about.body}</p> : null}
              {about.skills.length ? (
                <div className="flex flex-wrap gap-2">
                  {about.skills.map((skill) => (
                    <Badge key={skill} variant="neutral" className="rounded-full px-3 py-1 text-[11px]">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
            <Card className="rounded-[2rem] border border-divider bg-background p-6 shadow-premium sm:p-8">
              <div className="space-y-5">
                <div className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Contact</p>
                  <h2 className="text-3xl font-black tracking-tight text-text-primary">{contact.title || "Tell us about your project"}</h2>
                  {contact.introText ? <p className="text-sm leading-7 text-text-secondary">{contact.introText}</p> : null}
                </div>
                {contact.destinationEmail ? (
                  <a href={`mailto:${contact.destinationEmail}`} className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                    <Mail size={16} />
                    {contact.destinationEmail}
                  </a>
                ) : null}
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {contact.fields.map((field) => (
                    <div key={field.id}>
                      {field.type === "textarea" ? (
                        <Textarea
                          rows={5}
                          value={formValues[field.name] || ""}
                          onChange={(event) => setFieldValue(field.name, event.target.value)}
                          placeholder={field.label}
                        />
                      ) : field.type === "select" ? (
                        <div className="space-y-2">
                          <span className="text-sm font-semibold text-text-secondary">{field.label}</span>
                          <select
                            value={formValues[field.name] || ""}
                            onChange={(event) => setFieldValue(field.name, event.target.value)}
                            className="w-full input-base px-4 py-3 appearance-none cursor-pointer text-text-primary bg-background focus:ring-primary-light"
                          >
                            <option value="">Select {field.label.toLowerCase()}</option>
                            {field.options.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <Input
                          type={field.type === "email" ? "email" : "text"}
                          labelInside={field.label}
                          value={formValues[field.name] || ""}
                          onChange={(event) => setFieldValue(field.name, event.target.value)}
                        />
                      )}
                    </div>
                  ))}
                  <Button type="submit" className="w-full justify-center rounded-full py-3 text-sm font-bold">
                    {contact.submitLabel || "Send Inquiry"}
                  </Button>
                  <div className="rounded-2xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-text-primary">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
                      <p>The inquiry opens in the visitor&apos;s email client with every filled field included, so replies go straight to your inbox.</p>
                    </div>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-divider bg-surface px-6 py-8 text-center shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Ready to convert more of the right clients?</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-text-primary sm:text-4xl">
              Build a portfolio that sells your services, not just your screenshots.
            </h2>
          </div>
        </section>
      </div>
    </>
  );
}
