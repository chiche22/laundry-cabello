import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT ?? "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

async function sendMail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: `"Laundry ${process.env.NEXT_PUBLIC_BUILDING_NAME ?? "Cabello"}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  })
}

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const in5min = new Date(now.getTime() + 5 * 60 * 1000)
  const in6min = new Date(now.getTime() + 6 * 60 * 1000)

  // Notify 5 min before
  const upcoming = await prisma.booking.findMany({
    where: {
      startsAt: { gte: in5min, lt: in6min },
      user: { notifyBefore: true },
    },
    include: { user: true },
  })

  for (const b of upcoming) {
    if (!b.user.email) continue
    const start = b.startsAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
    const end = b.endsAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
    await sendMail(
      b.user.email,
      "🧺 Tu turno arranca en 5 minutos",
      `<p>Hola ${b.user.name},</p><p>Tu turno de laundry empieza a las <strong>${start}</strong> y termina a las <strong>${end}</strong>.</p>`
    )
  }

  // Notify on end
  const ending = await prisma.booking.findMany({
    where: {
      endsAt: { gte: now, lt: new Date(now.getTime() + 60 * 1000) },
      user: { notifyEnd: true },
    },
    include: { user: true },
  })

  for (const b of ending) {
    if (!b.user.email) continue
    await sendMail(
      b.user.email,
      "🧺 Tu turno terminó",
      `<p>Hola ${b.user.name},</p><p>Tu turno de laundry acaba de terminar. ¡Gracias!</p>`
    )
  }

  return NextResponse.json({ notified: upcoming.length + ending.length })
}
