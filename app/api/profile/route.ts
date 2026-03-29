import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { name, apartment, notifyBefore, notifyEnd } = await req.json()

  if (apartment) {
    const apartmentRegex = /^\d+[A-Za-z]$/
    if (!apartmentRegex.test(apartment)) {
      return NextResponse.json({ error: "El depto debe tener formato 4B (número + letra)" }, { status: 400 })
    }
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name && { name }),
      ...(apartment && { apartment: apartment.toUpperCase() }),
      ...(notifyBefore !== undefined && { notifyBefore }),
      ...(notifyEnd !== undefined && { notifyEnd }),
    },
    select: { name: true, apartment: true, notifyBefore: true, notifyEnd: true },
  })

  return NextResponse.json(updated)
}
