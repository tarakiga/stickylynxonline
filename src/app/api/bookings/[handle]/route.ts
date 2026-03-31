import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { findEditorBlock } from "@/types/editor-page";

export const dynamic = "force-dynamic";

function asArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const body = await request.json().catch(() => null);

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const serviceId = typeof body?.serviceId === "string" ? body.serviceId.trim() : "";
  const date = typeof body?.date === "string" ? body.date.trim() : "";
  const time = typeof body?.time === "string" ? body.time.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const page = await prisma.page.findUnique({
    where: { handle },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
      blocks: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const blocks = page.blocks as Array<{ type: string; content?: unknown }>;
  const locationBlock = findEditorBlock(blocks, "CONTACT", "location_contact");
  const servicesBlock = findEditorBlock(blocks, "GRID", "service_categories");

  const locationContent = asRecord(locationBlock?.content) || {};
  const contacts = asArray(locationContent.contacts);
  const contactEmail =
    contacts
      .map((contactValue) => asRecord(contactValue))
      .find((contact) => contact && asString(contact.type) === "email" && asString(contact.value))?.value ||
    page.user?.email;

  if (!contactEmail || typeof contactEmail !== "string") {
    return NextResponse.json({ error: "No booking recipient is configured for this page" }, { status: 400 });
  }

  let serviceName = "";
  const servicesContent = asRecord(servicesBlock?.content) || {};
  for (const categoryValue of asArray(servicesContent.categories)) {
    const category = asRecord(categoryValue) || {};
    for (const serviceValue of asArray(category.services)) {
      const service = asRecord(serviceValue) || {};
      if (asString(service.id) === serviceId) {
        serviceName = asString(service.name);
      }
    }
  }

  const pageName = page.title || page.handle;
  const ownerName = page.user?.name || "there";
  const requestedSlot = [date, time].filter(Boolean).join(" at ");

  const ownerHtml = `
    <div style="font-family: Inter, Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h2 style="margin: 0 0 12px;">New booking request for ${pageName}</h2>
      <p style="margin: 0 0 16px;">A visitor submitted a service booking request from your Stickylynx page.</p>
      <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 16px; background: #f9fafb;">
        <p style="margin: 0 0 8px;"><strong>Name:</strong> ${name}</p>
        <p style="margin: 0 0 8px;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 0 0 8px;"><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p style="margin: 0 0 8px;"><strong>Service:</strong> ${serviceName || "General enquiry"}</p>
        <p style="margin: 0 0 8px;"><strong>Preferred slot:</strong> ${requestedSlot || "Not provided"}</p>
        <p style="margin: 0;"><strong>Message:</strong> ${message || "No extra notes"}</p>
      </div>
    </div>
  `;

  const requesterHtml = `
    <div style="font-family: Inter, Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h2 style="margin: 0 0 12px;">Your booking request has been sent</h2>
      <p style="margin: 0 0 16px;">Hi ${name}, your request for ${pageName} is now with ${ownerName}. They will confirm the appointment soon.</p>
      <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 16px; background: #f9fafb;">
        <p style="margin: 0 0 8px;"><strong>Service:</strong> ${serviceName || "General enquiry"}</p>
        <p style="margin: 0 0 8px;"><strong>Preferred slot:</strong> ${requestedSlot || "Not provided"}</p>
        <p style="margin: 0;"><strong>Message:</strong> ${message || "No extra notes"}</p>
      </div>
    </div>
  `;

  const [ownerResult, requesterResult] = await Promise.all([
    sendEmail({
      to: contactEmail,
      subject: `New booking request for ${pageName}`,
      html: ownerHtml,
    }),
    sendEmail({
      to: email,
      subject: `Your booking request for ${pageName}`,
      html: requesterHtml,
    }),
  ]);

  if (!ownerResult.ok) {
    return NextResponse.json({ error: "Failed to send booking request" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    confirmationSent: requesterResult.ok,
  });
}
