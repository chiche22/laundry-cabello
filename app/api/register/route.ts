import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  const { name, email, password, apartment, notifyBefore, notifyEnd } = await req.json()

  if (!name || !email || !password || !apartment) {
    return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 })
  }

  const apartmentRegex = /^\d+[A-Za-z]$/
  if (!apartmentRegex.test(apartment)) {
    return NextResponse.json({ error: "El depto debe tener formato 4B (número + letra)" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: {
      name,
      email,
      apartment: apartment.toUpperCase(),
      passwordHash,
      notifyBefore: notifyBefore ?? true,
      notifyEnd: notifyEnd ?? false,
    },
  })

  return NextResponse.json({ success: true })
}
