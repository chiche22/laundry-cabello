"use client"
import { useRouter } from "next/navigation"
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isToday, startOfWeek, endOfWeek, addMonths, subMonths
} from "date-fns"
import { es } from "date-fns/locale"

interface Booking {
  id: string
  startsAt: string
  endsAt: string
  userName: string
  apartment: string
}

interface Props {
  bookings: Booking[]
  year: number
  month: number
}

export default function CalendarClient({ bookings, year, month }: Props) {
  const router = useRouter()
  const current = new Date(year, month, 1)
  const days = eachDayOfInterval({ start: startOfMonth(current), end: endOfMonth(current) })
  const startDay = startOfMonth(current).getDay() // 0=Sun

  function navigate(delta: -1 | 1) {
    const next = delta === 1 ? addMonths(current, 1) : subMonths(current, 1)
    router.push(`/calendar?year=${next.getFullYear()}&month=${next.getMonth()}`)
  }

  function bookingsForDay(day: Date) {
    return bookings.filter((b) => isSameDay(new Date(b.startsAt), day))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600">
          ‹
        </button>
        <h2 className="text-lg font-bold text-gray-900 capitalize">
          {format(current, "MMMM yyyy", { locale: es })}
        </h2>
        <button onClick={() => navigate(1)} className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600">
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before month start */}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((day) => {
          const dayBookings = bookingsForDay(day)
          const isPast = day < new Date(new Date().setHours(0, 0, 0, 0))
          const maxDate = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
          const isTooFar = day > maxDate

          return (
            <div
              key={day.toISOString()}
              onClick={() => {
                if (!isPast && !isTooFar) router.push(`/book?date=${format(day, "yyyy-MM-dd")}`)
              }}
              className={[
                "min-h-[80px] rounded-xl p-2 border transition",
                isToday(day) ? "border-blue-400 bg-blue-50" : "border-gray-100 bg-white",
                isPast || isTooFar ? "opacity-40 cursor-default" : "cursor-pointer hover:border-blue-300 hover:bg-blue-50/40",
              ].join(" ")}
            >
              <div className={[
                "text-sm font-semibold mb-1",
                isToday(day) ? "text-blue-600" : "text-gray-700",
              ].join(" ")}>
                {format(day, "d")}
              </div>
              <div className="space-y-0.5">
                {dayBookings.map((b) => (
                  <div
                    key={b.id}
                    className="text-xs bg-red-100 text-red-800 rounded-md px-1 py-0.5 truncate"
                    title={`${b.userName} (${b.apartment}) · ${format(new Date(b.startsAt), "HH:mm")}–${format(new Date(b.endsAt), "HH:mm")}`}
                  >
                    {format(new Date(b.startsAt), "HH:mm")} {b.userName.split(" ")[0]} {b.apartment}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => router.push("/book")}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-3 text-sm font-semibold transition"
        >
          + Reservar turno
        </button>
      </div>

      <div className="mt-4 flex items-center gap-4 justify-center text-xs text-gray-400">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 inline-block"/> Ocupado</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white border border-gray-200 inline-block"/> Libre</span>
      </div>
    </div>
  )
}
