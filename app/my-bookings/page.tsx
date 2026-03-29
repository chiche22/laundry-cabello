import { auth } from "@/lib/auth"
import { getUpcomingBookingsForUser } from "@/lib/bookings"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import CancelButton from "@/components/CancelButton"

export const dynamic = "force-dynamic"

export default async function MyBookingsPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const bookings = await getUpcomingBookingsForUser(session.user.id)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis turnos</h1>
      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500">
          <p className="text-4xl mb-3">🧺</p>
          <p>No tenés turnos próximos.</p>
          <a href="/book" className="mt-4 inline-block text-blue-600 font-medium hover:underline text-sm">
            Reservar un turno →
          </a>
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
              </div>
              <CancelButton bookingId={b.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
