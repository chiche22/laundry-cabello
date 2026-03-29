import { prisma } from "@/lib/prisma"
import { addDays, startOfDay, endOfDay } from "date-fns"

export const DURATIONS = [
  { label: "1h", minutes: 60 },
  { label: "1:30h", minutes: 90 },
  { label: "2h", minutes: 120 },
  { label: "2:30h", minutes: 150 },
  { label: "3h", minutes: 180 },
]

export async function getBookingsForRange(from: Date, to: Date) {
  return prisma.booking.findMany({
    where: {
      startsAt: { gte: from },
      endsAt: { lte: to },
    },
    include: {
      user: { select: { name: true, apartment: true } },
    },
    orderBy: { startsAt: "asc" },
  })
}

export async function getBookingsForMonth(year: number, month: number) {
  const from = new Date(year, month, 1)
  const to = new Date(year, month + 1, 1)
  return getBookingsForRange(from, to)
}

export async function checkConflict(startsAt: Date, endsAt: Date, excludeId?: string) {
  const conflict = await prisma.booking.findFirst({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      OR: [
        // New booking starts inside existing
        { startsAt: { lt: endsAt }, endsAt: { gt: startsAt } },
      ],
    },
    include: {
      user: { select: { name: true, apartment: true } },
    },
  })
  return conflict
}

export async function createBooking(userId: string, startsAt: Date, durationMinutes: number) {
  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000)

  // Check conflict first
  const conflict = await checkConflict(startsAt, endsAt)
  if (conflict) {
    return { error: "conflict", conflict }
  }

  const booking = await prisma.booking.create({
    data: { userId, startsAt, endsAt },
    include: { user: { select: { name: true, apartment: true } } },
  })

  return { booking }
}

export async function cancelBooking(bookingId: string, userId: string, isAdmin: boolean) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking) return { error: "not_found" }
  if (!isAdmin && booking.userId !== userId) return { error: "forbidden" }

  await prisma.booking.delete({ where: { id: bookingId } })
  return { success: true }
}

export async function getUpcomingBookingsForUser(userId: string) {
  return prisma.booking.findMany({
    where: {
      userId,
      startsAt: { gte: new Date() },
    },
    orderBy: { startsAt: "asc" },
  })
}

export async function getAllUpcomingBookings() {
  return prisma.booking.findMany({
    where: { startsAt: { gte: new Date() } },
    include: { user: { select: { name: true, apartment: true } } },
    orderBy: { startsAt: "asc" },
  })
}

export function buildGoogleCalendarUrl(startsAt: Date, endsAt: Date) {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Laundry — ${process.env.NEXT_PUBLIC_BUILDING_NAME ?? "Edificio"}`,
    dates: `${fmt(startsAt)}/${fmt(endsAt)}`,
    details: "Turno reservado desde la app del laundry.",
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
