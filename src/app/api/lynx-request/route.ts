import { NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"
import { EMAIL_COLORS } from "@/config/theme"

type LynxRequestBody = {
  name?: string
  email?: string
  brand?: string
  requestType?: string
  timeline?: string
  summary?: string
}

type RequestFieldError = {
  field: string
  message: string
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function getRequestLabel(value: string) {
  switch (value) {
    case "custom_category":
      return "New category"
    case "custom_template":
      return "New template"
    case "category_upgrade":
      return "Existing category upgrade"
    case "other":
      return "Other request"
    default:
      return "Not specified"
  }
}

function getTimelineLabel(value: string) {
  switch (value) {
    case "asap":
      return "As soon as possible"
    case "this_month":
      return "Within this month"
    case "this_quarter":
      return "Within this quarter"
    case "exploring":
      return "Just exploring"
    default:
      return "Not specified"
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as LynxRequestBody | null

  if (!body) {
    return NextResponse.json({ errors: [{ field: "summary", message: "Invalid request payload." }] }, { status: 400 })
  }

  const name = String(body.name || "").trim()
  const email = String(body.email || "").trim()
  const brand = String(body.brand || "").trim()
  const requestType = String(body.requestType || "").trim()
  const timeline = String(body.timeline || "").trim()
  const summary = String(body.summary || "").trim()

  const errors: RequestFieldError[] = []

  if (!name) {
    errors.push({ field: "name", message: "Please enter your name." })
  }

  if (!email) {
    errors.push({ field: "email", message: "Please enter your email address." })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: "email", message: "Please enter a valid email address." })
  }

  if (!requestType) {
    errors.push({ field: "requestType", message: "Please choose the request type." })
  }

  if (!summary) {
    errors.push({ field: "summary", message: "Please describe the Lynx you want." })
  } else if (summary.length < 20) {
    errors.push({ field: "summary", message: "Add a bit more detail so we can evaluate your request." })
  }

  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 })
  }

  const result = await sendEmail({
    to: "request@stickylynx.online",
    subject: `Stickylynx Request from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; padding: 24px;">
        <div style="margin-bottom: 24px;">
          <p style="margin: 0 0 8px; color: ${EMAIL_COLORS.primary}; font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;">New custom Lynx request</p>
          <h1 style="margin: 0; font-size: 24px; line-height: 1.2;">A visitor submitted a new request from the Stickylynx home page.</h1>
        </div>
        <div style="border: 1px solid #E5E7EB; border-radius: 18px; overflow: hidden;">
          <div style="display: grid;">
            ${[
              ["Name", name],
              ["Email", email],
              ["Brand or Business", brand || "Not provided"],
              ["Request Type", getRequestLabel(requestType)],
              ["Preferred Timeline", getTimelineLabel(timeline)],
            ]
              .map(
                ([label, value]) => `
                  <div style="padding: 14px 18px; border-bottom: 1px solid #E5E7EB;">
                    <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #6B7280; margin-bottom: 6px;">${escapeHtml(label)}</div>
                    <div style="font-size: 15px; line-height: 1.6; color: #111827;">${escapeHtml(value)}</div>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
        <div style="margin-top: 20px; border-radius: 18px; background: ${EMAIL_COLORS.surfaceMuted}; padding: 18px;">
          <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #6B7280; margin-bottom: 8px;">Request Summary</div>
          <div style="font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${escapeHtml(summary)}</div>
        </div>
      </div>
    `,
  })

  if (!result.ok) {
    return NextResponse.json(
      {
        errors: [{ field: "summary", message: "We could not send your request right now. Please try again shortly." }],
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
