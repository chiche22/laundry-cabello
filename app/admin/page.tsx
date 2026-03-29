import { auth } from "@/lib/auth"
import { getAllUpcomingBookings } from "@/lib/bookings"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import CancelButton from "@/components/CancelButton"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const session = await auth()
  if (!(session?.user as any)?.isAdmin) redirect("/calendar")

  const bookings = await getAllUpcomingBookings()

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Panel admin</h1>
      <p className="text-gray-500 text-sm mb-6">Todos los turnos próximos</p>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500">
          No hay turnos próximos.
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 capitalize">
                  {format(b.startsAt, "EEEE d 'de' MMMM", { locale: es })}
                </p>
                <p className="text-sm text-gray-500">
                  {format(b.startsAt, "HH:mm")} – {format(b.endsAt, "HH:mm")}
                </p>
                <p className="text-sm text-gray-700 mt-0.5">
                  {b.user.name} · Depto {b.user.apartment}
                </p>
              </div>
              <CancelButton bookingId={b.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
