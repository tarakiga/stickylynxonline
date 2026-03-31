CREATE TYPE "ServiceBookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELED', 'DECLINED');

CREATE TABLE "ServiceBooking" (
  "id" TEXT NOT NULL,
  "pageId" TEXT NOT NULL,
  "status" "ServiceBookingStatus" NOT NULL DEFAULT 'PENDING',
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "serviceId" TEXT NOT NULL,
  "serviceName" TEXT NOT NULL,
  "serviceDurationMinutes" INTEGER,
  "bookingDate" TEXT NOT NULL,
  "bookingTime" TEXT NOT NULL,
  "bookingStartMinutes" INTEGER NOT NULL,
  "bookingEndMinutes" INTEGER NOT NULL,
  "message" TEXT,
  "ownerNotes" TEXT,
  "confirmedAt" TIMESTAMP(3),
  "canceledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ServiceBooking_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ServiceBooking_pageId_bookingDate_status_idx" ON "ServiceBooking"("pageId", "bookingDate", "status");
CREATE INDEX "ServiceBooking_pageId_createdAt_idx" ON "ServiceBooking"("pageId", "createdAt");

ALTER TABLE "ServiceBooking"
ADD CONSTRAINT "ServiceBooking_pageId_fkey"
FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
