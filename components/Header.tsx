"use client"
import Link from "next/link"
import { signOut } from "next-auth/react"

interface HeaderProps {
  user: { name?: string | null; apartment?: string | null; isAdmin?: boolean }
}

export default function Header({ user }: HeaderProps) {
  const buildingName = process.env.NEXT_PUBLIC_BUILDING_NAME ?? "Laundry Cabello"
  return (
    <header className="bg-gray-900 text-white shadow">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 font-bold text-lg">🧺 {buildingName}</span>
          {user.apartment && (
            <span className="text-gray-400 text-sm">· {user.apartment}</span>
          )}
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/calendar" className="hover:text-yellow-400 transition-colors">
            Calendario
          </Link>
          <Link href="/my-bookings" className="hover:text-yellow-400 transition-colors">
            Mis turnos
          </Link>
          {user.isAdmin && (
            <Link href="/admin" className="hover:text-yellow-400 transition-colors">
              Admin
            </Link>
          )}
          <Link href="/perfil" className="hover:text-yellow-400 transition-colors">
            Perfil
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-gray-400 hover:text-red-400 transition-colors"
          >
            Salir
          </button>
        </nav>
      </div>
    </header>
  )
}
