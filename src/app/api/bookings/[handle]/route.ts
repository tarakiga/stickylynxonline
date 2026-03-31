import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { getServiceMenuServiceById, parseTimeToMinutes, overlaps } from "@/lib/service-bookings";

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

function isValidDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function getPageForBookings(handle: string) {
  return prisma.page.findUnique({
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
}

async function getRecipientEmail(blocks: Array<{ type: string; content?: unknown }>, fallbackEmail?: string | null) {
  const locationBlock = blocks.find((block) => block.type === "CONTACT" && asRecord(block.content)?.section === "location_contact");
  const locationContent = asRecord(locationBlock?.content) || {};
  const contacts = asArray(locationContent.contacts);

  const contactEmail =
    contacts
      .map((contactValue) => asRecord(contactValue))
      .find((contact) => contact && asString(contact.type) === "email" && asString(contact.value))?.value ||
    fallbackEmail;

  return typeof contactEmail === "string" ? contactEmail : "";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const page = await prisma.page.findUnique({
    where: { handle },
    select: {
      id: true,
      handle: true,
      category: true,
      bookings: {
        where: { status: "CONFIRMED" },
        orderBy: [{ bookingDate: "asc" }, { bookingStartMinutes: "asc" }],
        select: {
          id: true,
          status: true,
          serviceId: true,
          bookingDate: true,
          bookingTime: true,
          bookingStartMinutes: true,
          bookingEndMinutes: true,
        },
      },
    },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json({
    bookings: page.bookings,
  });
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

  if (!name || !email || !serviceId || !date || !time) {
    return NextResponse.json({ error: "Name, email, service, date, and time are required" }, { status: 400 });
  }

  if (!isValidDateKey(date)) {
    return NextResponse.json({ error: "Invalid booking date" }, { status: 400 });
  }

  const startMinutes = parseTimeToMinutes(time);
  if (startMinutes === null) {
    return NextResponse.json({ error: "Invalid booking time" }, { status: 400 });
  }

  const page = await getPageForBookings(handle);

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const blocks = page.blocks as Array<{ type: string; content?: unknown }>;
  const contactEmail = await getRecipientEmail(blocks, page.user?.email);

  if (!contactEmail) {
    return NextResponse.json({ error: "No booking recipient is configured for this page" }, { status: 400 });
  }

  const selectedService = getServiceMenuServiceById(blocks, serviceId);
  if (!selectedService) {
    return NextResponse.json({ error: "Selected service no longer exists" }, { status: 400 });
  }

  const durationMinutes = selectedService.durationMinutes || 30;
  const endMinutes = startMinutes + durationMinutes;

  const existingBookings = await prisma.serviceBooking.findMany({
    where: {
      pageId: page.id,
      bookingDate: date,
      status: "CONFIRMED",
    },
    select: {
      id: true,
      bookingStartMinutes: true,
      bookingEndMinutes: true,
    },
  });

  const conflictingBooking = existingBookings.find((booking) =>
    overlaps(startMinutes, endMinutes, booking.bookingStartMinutes, booking.bookingEndMinutes)
  );

  if (conflictingBooking) {
    return NextResponse.json({ error: "That time has already been booked. Please choose another slot." }, { status: 409 });
  }

  const createdBooking = await prisma.serviceBooking.create({
    data: {
      pageId: page.id,
      name,
      email,
      phone: phone || null,
      serviceId: selectedService.id,
      serviceName: selectedService.name || "Service request",
      serviceDurationMinutes: durationMinutes,
      bookingDate: date,
      bookingTime: time,
      bookingStartMinutes: startMinutes,
      bookingEndMinutes: endMinutes,
      message: message || null,
      status: "PENDING",
    },
  });

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
        <p style="margin: 0 0 8px;"><strong>Service:</strong> ${selectedService.name || "General enquiry"}</p>
        <p style="margin: 0 0 8px;"><strong>Preferred slot:</strong> ${requestedSlot || "Not provided"}</p>
        <p style="margin: 0 0 8px;"><strong>Status:</strong> Pending confirmation</p>
        <p style="margin: 0;"><strong>Message:</strong> ${message || "No extra notes"}</p>
      </div>
    </div>
  `;

  const requesterHtml = `
    <div style="font-family: Inter, Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h2 style="margin: 0 0 12px;">Your booking request has been sent</h2>
      <p style="margin: 0 0 16px;">Hi ${name}, your request for ${pageName} is now with ${ownerName}. They will confirm the appointment soon.</p>
      <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 16px; background: #f9fafb;">
        <p style="margin: 0 0 8px;"><strong>Booking reference:</strong> ${createdBooking.id}</p>
        <p style="margin: 0 0 8px;"><strong>Service:</strong> ${selectedService.name || "General enquiry"}</p>
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
    booking: {
      id: createdBooking.id,
      status: createdBooking.status,
    },
  });
}
