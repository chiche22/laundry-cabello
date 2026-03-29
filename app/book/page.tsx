"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DURATIONS, buildGoogleCalendarUrl } from "@/lib/booking-utils"
import { format, addDays } from "date-fns"
import { es } from "date-fns/locale"
import { Suspense } from "react"

function BookForm() {
  const router = useRouter()
  const params = useSearchParams()
  const today = format(new Date(), "yyyy-MM-dd")
  const maxDate = format(addDays(new Date(), 30), "yyyy-MM-dd")

  const [date, setDate] = useState(params.get("date") ?? today)
  const [hour, setHour] = useState(params.get("hour") ?? "08")
  const [duration, setDuration] = useState(60)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState<{ startsAt: string; endsAt: string } | null>(null)

  const startsAt = `${date}T${hour}:00:00`
  const endsAtDate = new Date(new Date(startsAt).getTime() + duration * 60 * 1000)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startsAt: new Date(startsAt).toISOString(), durationMinutes: duration }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error)
      return
    }
    setSuccess({ startsAt: data.startsAt, endsAt: data.endsAt })
  }

  if (success) {
    const gcalUrl = buildGoogleCalendarUrl(new Date(success.startsAt), new Date(success.endsAt))
    return (
      <div className="max-w-sm mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">¡Turno reservado!</h2>
          <p className="text-gray-600 text-sm mb-6">
            {format(new Date(success.startsAt), "EEEE d 'de' MMMM", { locale: es })}
            <br />
            {format(new Date(success.startsAt), "HH:mm")} – {format(new Date(success.endsAt), "HH:mm")}
          </p>
          <a href={gcalUrl} target="_blank" rel="noopener noreferrer"
            className="block w-full border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition mb-3">
            📅 Agregar a Google Calendar
          </a>
          <button onClick={() => router.push("/my-bookings")}
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-semibold transition">
            Ver mis turnos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Reservar turno</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              min={today} max={maxDate} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora de inicio</label>
            <select value={hour} onChange={(e) => setHour(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((h) => (
                <option key={h} value={h}>{h}:00</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duración</label>
            <div className="grid grid-cols-5 gap-2">
              {DURATIONS.map((d) => (
                <button type="button" key={d.minutes}
                  onClick={() => setDuration(d.minutes)}
                  className={[
                    "rounded-xl py-2 text-sm font-medium border transition",
                    duration === d.minutes
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-200 text-gray-700 hover:border-blue-300",
                  ].join(" ")}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
            Turno: <span className="font-semibold text-gray-900">
              {hour}:00 – {format(endsAtDate, "HH:mm")}
            </span>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-3 py-2">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-sm font-semibold transition disabled:opacity-50">
            {loading ? "Verificando disponibilidad..." : "Confirmar reserva"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense>
      <BookForm />
    </Suspense>
  )
}
