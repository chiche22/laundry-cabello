import { getBookingsForMonth } from "@/lib/bookings"
import CalendarClient from "@/components/CalendarClient"

export const dynamic = "force-dynamic"

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const params = await searchParams
  const now = new Date()
  const year = parseInt(params.year ?? String(now.getFullYear()))
  const month = parseInt(params.month ?? String(now.getMonth()))

  const bookings = await getBookingsForMonth(year, month)
  const serialized = bookings.map((b) => ({
    id: b.id,
    startsAt: b.startsAt.toISOString(),
    endsAt: b.endsAt.toISOString(),
    userName: b.user.name ?? "Vecino",
    apartment: b.user.apartment ?? "",
  }))

  return <CalendarClient bookings={serialized} year={year} month={month} />
}
