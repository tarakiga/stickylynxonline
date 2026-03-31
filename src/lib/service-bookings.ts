import type { BookingContent } from "@/lib/service-menu"
import { findEditorBlock } from "@/types/editor-page"

export const ACTIVE_BOOKING_STATUSES = ["PENDING", "CONFIRMED"] as const

export const BOOKING_STATUS_OPTIONS = [
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Canceled", value: "CANCELED" },
  { label: "Declined", value: "DECLINED" },
] as const

export type BookingStatus = (typeof BOOKING_STATUS_OPTIONS)[number]["value"]

export type ServiceBookingRow = {
  id: string
  pageId: string
  status: BookingStatus
  name: string
  email: string
  phone: string | null
  serviceId: string
  serviceName: string
  serviceDurationMinutes: number | null
  bookingDate: string
  bookingTime: string
  bookingStartMinutes: number
  bookingEndMinutes: number
  message: string | null
  ownerNotes: string | null
  confirmedAt: string | Date | null
  canceledAt: string | Date | null
  createdAt: string | Date
  updatedAt: string | Date
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null
}

function asArray<T = unknown>(value: unknown) {
  return Array.isArray(value) ? (value as T[]) : []
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

export function parseTimeToMinutes(value: string) {
  const normalized = value.trim()

  if (/^\d{2}:\d{2}$/.test(normalized)) {
    const [hours, minutes] = normalized.split(":").map(Number)
    return hours * 60 + minutes
  }

  const match = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return null

  const [, rawHours, rawMinutes, meridiem] = match
  const hours = Number(rawHours) % 12 + (meridiem.toUpperCase() === "PM" ? 12 : 0)
  const minutes = Number(rawMinutes)
  return hours * 60 + minutes
}

export function formatMinutesToTime(value: number) {
  const hours = Math.floor(value / 60)
  const minutes = value % 60
  const suffix = hours >= 12 ? "PM" : "AM"
  const normalizedHours = hours % 12 || 12
  return `${normalizedHours}:${`${minutes}`.padStart(2, "0")} ${suffix}`
}

export function overlaps(startA: number, endA: number, startB: number, endB: number) {
  return startA < endB && startB < endA
}

export function getBookingSlotKey(booking: Pick<ServiceBookingRow, "bookingDate" | "bookingTime">) {
  return `${booking.bookingDate}__${booking.bookingTime}`
}

export function getServiceMenuBookingContent(blocks: Array<{ type: string; content?: unknown }>) {
  return (findEditorBlock(blocks, "GRID", "booking")?.content || {}) as Partial<BookingContent>
}

export function getServiceMenuServiceById(
  blocks: Array<{ type: string; content?: unknown }>,
  serviceId: string
) {
  const servicesBlock = findEditorBlock(blocks, "GRID", "service_categories")
  const servicesContent = asRecord(servicesBlock?.content) || {}

  for (const categoryValue of asArray(servicesContent.categories)) {
    const category = asRecord(categoryValue) || {}
    for (const serviceValue of asArray(category.services)) {
      const service = asRecord(serviceValue) || {}
      if (asString(service.id) === serviceId) {
        return {
          id: asString(service.id),
          name: asString(service.name),
          durationMinutes: asNumber(service.durationMinutes),
        }
      }
    }
  }

  return null
}
