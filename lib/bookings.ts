import { prisma } from "@/lib/prisma"
import { DURATIONS } from "@/lib/booking-utils"

export { DURATIONS }

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
