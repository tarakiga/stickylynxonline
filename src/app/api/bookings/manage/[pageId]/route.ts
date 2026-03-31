import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import type { ServiceBookingStatus } from "@prisma/client";
import { sendEmail } from "@/lib/email";

const editableStatuses: ServiceBookingStatus[] = ["PENDING", "CONFIRMED", "CANCELED", "DECLINED"];

export const dynamic = "force-dynamic";

async function getOwnedPage(pageId: string, userId: string) {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: {
      id: true,
      handle: true,
      title: true,
      userId: true,
      category: true,
    },
  });

  if (!page || page.userId !== userId) {
    return null;
  }

  return page;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pageId } = await params;
  const page = await getOwnedPage(pageId, userId);

  if (!page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const bookings = await prisma.serviceBooking.findMany({
    where: { pageId: page.id },
    orderBy: [{ bookingDate: "asc" }, { bookingStartMinutes: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ bookings });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pageId } = await params;
  const page = await getOwnedPage(pageId, userId);

  if (!page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const bookingId = typeof body?.bookingId === "string" ? body.bookingId : "";
  const action = typeof body?.action === "string" ? body.action : "";
  const status = typeof body?.status === "string" ? (body.status as ServiceBookingStatus) : null;
  const ownerNotes = typeof body?.ownerNotes === "string" ? body.ownerNotes.trim() : undefined;

  if (!bookingId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const booking = await prisma.serviceBooking.findFirst({
    where: {
      id: bookingId,
      pageId: page.id,
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (action === "REBOOK") {
    const confirmedBooking = await prisma.serviceBooking.findFirst({
      where: {
        pageId: page.id,
        id: { not: booking.id },
        status: "CONFIRMED",
        bookingDate: booking.bookingDate,
        bookingTime: booking.bookingTime,
      },
    });

    if (!confirmedBooking) {
      return NextResponse.json({ error: "This booking can only be rebooked after another customer is confirmed for the same slot" }, { status: 409 });
    }

    const pageName = page.title || page.handle;
    const emailResult = await sendEmail({
      to: booking.email,
      subject: `Please choose a new booking time for ${pageName}`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; color: #111827; line-height: 1.6;">
          <h2 style="margin: 0 0 12px;">Please choose another time</h2>
          <p style="margin: 0 0 16px;">Thanks for booking ${pageName}. The requested slot on ${booking.bookingDate} at ${booking.bookingTime} has just been confirmed for another customer.</p>
          <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 16px; background: #f9fafb;">
            <p style="margin: 0 0 8px;"><strong>Original service:</strong> ${booking.serviceName}</p>
            <p style="margin: 0 0 8px;"><strong>Original slot:</strong> ${booking.bookingDate} at ${booking.bookingTime}</p>
            <p style="margin: 0;">Please return to the booking page and choose a new available time.</p>
          </div>
        </div>
      `,
    });

    if (!emailResult.ok) {
      return NextResponse.json({ error: "Failed to send the rebook email" }, { status: 500 });
    }

    const rebookedBooking = await prisma.serviceBooking.update({
      where: { id: booking.id },
      data: {
        status: "DECLINED",
        ownerNotes: ownerNotes || "Rebook requested after another customer confirmed this slot.",
        canceledAt: new Date(),
        confirmedAt: null,
      },
    });

    revalidatePath(`/dashboard/editor/${page.id}`);
    revalidatePath(`/${page.handle}`);

    return NextResponse.json({ booking: rebookedBooking, rebookEmailSent: true });
  }

  if (!status || !editableStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (status === "CONFIRMED") {
    const conflictingBooking = await prisma.serviceBooking.findFirst({
      where: {
        pageId: page.id,
        id: { not: booking.id },
        status: "CONFIRMED",
        bookingDate: booking.bookingDate,
        bookingStartMinutes: { lt: booking.bookingEndMinutes },
        bookingEndMinutes: { gt: booking.bookingStartMinutes },
      },
      select: { id: true },
    });

    if (conflictingBooking) {
      return NextResponse.json({ error: "Another confirmed booking already overlaps this slot" }, { status: 409 });
    }
  }

  const updatedBooking = await prisma.serviceBooking.update({
    where: { id: booking.id },
    data: {
      status,
      ownerNotes,
      confirmedAt: status === "CONFIRMED" ? new Date() : null,
      canceledAt: status === "CANCELED" || status === "DECLINED" ? new Date() : null,
    },
  });

  revalidatePath(`/dashboard/editor/${page.id}`);
  revalidatePath(`/${page.handle}`);

  return NextResponse.json({ booking: updatedBooking });
}
