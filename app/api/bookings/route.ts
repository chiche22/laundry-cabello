import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createBooking, cancelBooking, DURATIONS } from "@/lib/bookings"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { startsAt, durationMinutes } = await req.json()

  if (!startsAt || !durationMinutes) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 })
  }

  const validDurations = DURATIONS.map((d) => d.minutes)
  if (!validDurations.includes(durationMinutes)) {
    return NextResponse.json({ error: "Duración inválida" }, { status: 400 })
  }

  const start = new Date(startsAt)
  const now = new Date()
  const maxDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  if (start < now) return NextResponse.json({ error: "No podés reservar en el pasado" }, { status: 400 })
  if (start > maxDate) return NextResponse.json({ error: "Solo podés reservar hasta 30 días en adelante" }, { status: 400 })

  const result = await createBooking(session.user.id, start, durationMinutes)

  if (result.error === "conflict" && result.conflict) {
    const c = result.conflict
    const from = format(c.startsAt, "HH:mm")
    const to = format(c.endsAt, "HH:mm")
    const who = `${c.user.name}, depto ${c.user.apartment}`
    return NextResponse.json(
      { error: `Ese horario ya está ocupado (${from}–${to} por ${who}). Elegí otro horario.` },
      { status: 409 }
    )
  }

  return NextResponse.json(result.booking)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { bookingId } = await req.json()
  const isAdmin = (session.user as any).isAdmin ?? false

  const result = await cancelBooking(bookingId, session.user.id, isAdmin)

  if (result.error === "not_found") return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 })
  if (result.error === "forbidden") return NextResponse.json({ error: "No tenés permiso" }, { status: 403 })

  return NextResponse.json({ success: true })
}
