"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CompleteRegisterPage() {
  const router = useRouter()
  const [apartment, setApartment] = useState("")
  const [notifyBefore, setNotifyBefore] = useState(true)
  const [notifyEnd, setNotifyEnd] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apartment, notifyBefore, notifyEnd }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }
    router.push("/calendar")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-sm p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1 text-center">Un paso más</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Completá tu perfil para continuar</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departamento <span className="text-gray-400">(ej: 4B)</span>
            </label>
            <input type="text" value={apartment} onChange={(e) => setApartment(e.target.value.toUpperCase())} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              placeholder="4B" maxLength={5} />
          </div>
          <div className="border border-gray-100 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notificaciones</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={notifyBefore} onChange={(e) => setNotifyBefore(e.target.checked)} className="w-4 h-4 accent-blue-600" />
              <span className="text-sm text-gray-700">Avisarme 5 min antes de mi turno</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={notifyEnd} onChange={(e) => setNotifyEnd(e.target.checked)} className="w-4 h-4 accent-blue-600" />
              <span className="text-sm text-gray-700">Avisarme cuando finaliza mi turno</span>
            </label>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-50">
            {loading ? "Guardando..." : "Continuar"}
          </button>
        </form>
      </div>
    </div>
  )
}
