import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import type { Prisma, ServiceBookingStatus } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import { getBookingSlotKey, getTodayDateKey, isValidDateKey, type BookingManagementTab } from "@/lib/service-bookings";

const editableStatuses: ServiceBookingStatus[] = ["PENDING", "CONFIRMED", "COMPLETED", "NO_SHOW", "CANCELED", "DECLINED"];
const pageSize = 20;

export const dynamic = "force-dynamic";

function parseTab(value: string | null): BookingManagementTab {
  if (value === "UPCOMING" || value === "PAST") {
    return value;
  }

  return "TODAY";
}

function parseStatus(value: string | null) {
  if (!value || value === "ALL") {
    return "ALL" as const;
  }

  return editableStatuses.includes(value as ServiceBookingStatus) ? (value as ServiceBookingStatus) : "ALL";
}

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function parseDateFilter(value: string | null) {
  return value && isValidDateKey(value) ? value : "";
}

function buildTabWhere(
  currentTab: BookingManagementTab,
  todayKey: string,
  fromDate: string,
  toDate: string
): Prisma.StringFilter {
  const bookingDate: Prisma.StringFilter = {};

  if (currentTab === "TODAY") {
    bookingDate.equals = todayKey;
  }

  if (currentTab === "UPCOMING") {
    bookingDate.gt = todayKey;
  }

  if (currentTab === "PAST") {
    bookingDate.lt = todayKey;
  }

  if (fromDate) {
    bookingDate.gte = fromDate;
  }

  if (toDate) {
    bookingDate.lte = toDate;
  }

  return bookingDate;
}

function getTabCounts(pageId: string, todayKey: string) {
  return Promise.all([
    prisma.serviceBooking.count({ where: { pageId, bookingDate: todayKey } }),
    prisma.serviceBooking.count({ where: { pageId, bookingDate: { gt: todayKey } } }),
    prisma.serviceBooking.count({ where: { pageId, bookingDate: { lt: todayKey } } }),
  ]);
}

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

  const currentTab = parseTab(request.nextUrl.searchParams.get("tab"));
  const status = parseStatus(request.nextUrl.searchParams.get("status"));
  const search = request.nextUrl.searchParams.get("search")?.trim() || "";
  const requestedPage = parsePositiveInt(request.nextUrl.searchParams.get("page"), 1);
  const fromDate = parseDateFilter(request.nextUrl.searchParams.get("from"));
  const toDate = parseDateFilter(request.nextUrl.searchParams.get("to"));
  const todayKey = getTodayDateKey();
  const bookingDate = buildTabWhere(currentTab, todayKey, fromDate, toDate);

  const where: Prisma.ServiceBookingWhereInput = {
    pageId: page.id,
    bookingDate,
    ...(status !== "ALL" ? { status } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const totalCount = await prisma.serviceBooking.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);

  const [bookings, statusGroups, [todayCount, upcomingCount, pastCount]] = await Promise.all([
    prisma.serviceBooking.findMany({
      where,
      orderBy:
        currentTab === "PAST"
          ? [{ bookingDate: "desc" }, { bookingStartMinutes: "desc" }, { createdAt: "desc" }]
          : [{ bookingDate: "asc" }, { bookingStartMinutes: "asc" }, { createdAt: "desc" }],
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.serviceBooking.groupBy({
      by: ["status"],
      where,
      _count: {
        _all: true,
      },
    }),
    getTabCounts(page.id, todayKey),
  ]);

  const slotDates = Array.from(new Set(bookings.map((booking) => booking.bookingDate)));
  const slotKeys = new Set(bookings.map((booking) => getBookingSlotKey(booking)));

  const activeSlotBookings =
    slotDates.length > 0
      ? await prisma.serviceBooking.findMany({
          where: {
            pageId: page.id,
            bookingDate: { in: slotDates },
            status: { in: ["PENDING", "CONFIRMED"] },
          },
          select: {
            bookingDate: true,
            bookingTime: true,
            status: true,
          },
        })
      : [];

  const slotCounts = new Map<string, number>();
  const confirmedSlotKeys = new Set<string>();

  activeSlotBookings.forEach((booking) => {
    const slotKey = getBookingSlotKey(booking);
    if (!slotKeys.has(slotKey)) {
      return;
    }

    slotCounts.set(slotKey, (slotCounts.get(slotKey) || 0) + 1);
    if (booking.status === "CONFIRMED") {
      confirmedSlotKeys.add(slotKey);
    }
  });

  const summary = statusGroups.reduce(
    (accumulator, group) => {
      const count = group._count._all;

      if (group.status === "PENDING") {
        accumulator.pending += count;
      } else if (group.status === "CONFIRMED") {
        accumulator.confirmed += count;
      } else {
        accumulator.closed += count;
      }

      return accumulator;
    },
    { pending: 0, confirmed: 0, closed: 0 }
  );

  return NextResponse.json({
    bookings: bookings.map((booking) => {
      const slotKey = getBookingSlotKey(booking);

      return {
        ...booking,
        isDoubleBooked: (slotCounts.get(slotKey) || 0) > 1,
        hasConfirmedConflict: booking.status !== "CONFIRMED" && confirmedSlotKeys.has(slotKey),
      };
    }),
    summary,
    pagination: {
      page: currentPage,
      pageSize,
      totalCount,
      totalPages,
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    },
    tabCounts: {
      TODAY: todayCount,
      UPCOMING: upcomingCount,
      PAST: pastCount,
    },
  });
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
      confirmedAt:
        status === "CONFIRMED"
          ? booking.confirmedAt || new Date()
          : status === "COMPLETED" || status === "NO_SHOW"
            ? booking.confirmedAt
            : null,
      canceledAt: status === "CANCELED" || status === "DECLINED" ? new Date() : null,
    },
  });

  revalidatePath(`/dashboard/editor/${page.id}`);
  revalidatePath(`/${page.handle}`);

  return NextResponse.json({ booking: updatedBooking });
}
