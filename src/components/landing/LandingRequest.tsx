"use client"

import * as React from "react"
import { ArrowRight, CheckCircle2, Mail, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"
import { showToast } from "@/components/ui/Toast"

type RequestField = "name" | "email" | "requestType" | "summary"

type RequestFormState = {
  name: string
  email: string
  brand: string
  requestType: string
  timeline: string
  summary: string
}

const initialForm: RequestFormState = {
  name: "",
  email: "",
  brand: "",
  requestType: "custom_category",
  timeline: "asap",
  summary: "",
}

export function LandingRequest() {
  const [form, setForm] = React.useState<RequestFormState>(initialForm)
  const [errors, setErrors] = React.useState<Partial<Record<RequestField, string>>>({})
  const [sending, setSending] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  const updateField = <K extends keyof RequestFormState>(key: K, value: RequestFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key in errors) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    setErrors({})

    try {
      const res = await fetch("/api/lynx-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          brand: form.brand.trim(),
          requestType: form.requestType,
          timeline: form.timeline,
          summary: form.summary.trim(),
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        const nextErrors: Partial<Record<RequestField, string>> = {}
        if (Array.isArray(data?.errors)) {
          for (const item of data.errors) {
            if (item?.field && item?.message) {
              nextErrors[item.field as RequestField] = item.message
            }
          }
        }
        setErrors(nextErrors)
        if (Object.keys(nextErrors).length === 0) {
          showToast(data?.error || "We could not send your request right now. Please try again shortly.", "error")
        }
        return
      }

      setSent(true)
      setForm(initialForm)
      showToast("Your request has been sent successfully.", "success")
    } catch {
      showToast("We could not reach the request service. Please try again shortly.", "error")
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="relative overflow-hidden bg-background py-24">
      <div className="absolute left-1/2 top-10 h-[420px] w-[780px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary shadow-sm">
            <Sparkles size={14} />
            Request a Custom Lynx
          </div>
          <div className="max-w-2xl space-y-4">
            <h2 className="text-3xl font-black tracking-tight text-text-primary sm:text-5xl">
              Didn&apos;t find the right Lynx yet?
            </h2>
            <p className="text-lg font-medium leading-relaxed text-text-secondary">
              Tell us what you need and we&apos;ll review it for a future Stickylynx category, template, or tailored experience.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Category Gaps",
                body: "Request a new Lynx type when your workflow does not fit our current library.",
              },
              {
                title: "Template Direction",
                body: "Share the style, layout, and interactions you wish were already available.",
              },
              {
                title: "Business Context",
                body: "Explain the use case so we can prioritise ideas with the strongest real-world demand.",
              },
              {
                title: "Direct Review",
                body: "Every request is delivered to request@stickylynx.online for the product team to review.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[2rem] border border-divider bg-surface p-5 shadow-sm">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-text-primary">{item.title}</p>
                <p className="mt-3 text-sm leading-6 text-text-secondary">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-[2rem] border border-primary/20 bg-primary/5 px-5 py-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Direct inbox</p>
              <a href="mailto:request@stickylynx.online" className="mt-1 block text-sm font-bold text-text-primary hover:text-primary">
                request@stickylynx.online
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-[2.25rem] border border-primary/20 bg-gradient-to-br from-primary/10 via-surface to-surface p-1 shadow-premium">
          <div className="rounded-[2rem] border border-divider bg-surface p-6 sm:p-8">
            <div className="mb-6 space-y-2">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">Tell us what you need</p>
              <h3 className="text-2xl font-black tracking-tight text-text-primary sm:text-3xl">Submit your custom Lynx request</h3>
              <p className="text-sm leading-6 text-text-secondary">
                A short, clear request helps us evaluate the right feature, template, or new category faster.
              </p>
            </div>

            {sent ? (
              <div className="rounded-[1.75rem] border border-success/20 bg-success/10 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success text-white shadow-sm">
                    <CheckCircle2 size={22} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-text-primary">Request received</h4>
                    <p className="text-sm leading-6 text-text-secondary">
                      Thanks for sharing your idea. Our team has received it at request@stickylynx.online and will review it.
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setSent(false)}
                      className="mt-2 cursor-pointer rounded-2xl px-5 py-3"
                    >
                      Submit another request
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                  <Input
                    labelInside="Your Name"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Jane Doe"
                    error={errors.name}
                  />
                  <Input
                    labelInside="Email Address"
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    placeholder="jane@brand.com"
                    error={errors.email}
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Input
                    labelInside="Brand or Business"
                    value={form.brand}
                    onChange={(event) => updateField("brand", event.target.value)}
                    placeholder="Optional"
                  />
                  <Select
                    label="What do you need?"
                    value={form.requestType}
                    onChange={(event) => updateField("requestType", event.target.value)}
                    options={[
                      { label: "New category", value: "custom_category" },
                      { label: "New template", value: "custom_template" },
                      { label: "Existing category upgrade", value: "category_upgrade" },
                      { label: "Other request", value: "other" },
                    ]}
                  />
                </div>

                <Select
                  label="Preferred timeline"
                  value={form.timeline}
                  onChange={(event) => updateField("timeline", event.target.value)}
                  options={[
                    { label: "As soon as possible", value: "asap" },
                    { label: "Within this month", value: "this_month" },
                    { label: "Within this quarter", value: "this_quarter" },
                    { label: "Just exploring", value: "exploring" },
                  ]}
                />

                <Textarea
                  label="Describe the Lynx you want"
                  rows={6}
                  value={form.summary}
                  onChange={(event) => updateField("summary", event.target.value)}
                  placeholder="What are you trying to build, who is it for, and what should the experience include?"
                  error={errors.summary}
                />

                <div className="flex flex-col gap-4 border-t border-divider pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-md text-xs font-semibold leading-5 text-text-secondary">
                    We review every request manually so we can prioritise the most valuable new Lynx ideas.
                  </p>
                  <Button
                    type="submit"
                    disabled={sending}
                    className="cursor-pointer rounded-2xl px-6 py-4 text-sm shadow-premium"
                  >
                    {sending ? "Sending Request..." : "Send Request"}
                    <ArrowRight size={18} />
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
