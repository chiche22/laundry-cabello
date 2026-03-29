"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function CancelButton({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    if (!confirm("¿Cancelar este turno?")) return
    setLoading(true)
    await fetch("/api/bookings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <button onClick={handleCancel} disabled={loading}
      className="text-sm text-red-500 hover:text-red-700 font-medium transition disabled:opacity-50">
      {loading ? "..." : "Cancelar"}
    </button>
  )
}
