"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function PerfilPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [form, setForm] = useState({ name: "", apartment: "", notifyBefore: true, notifyEnd: false })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (session?.user) {
      setForm({
        name: session.user.name ?? "",
        apartment: (session.user as any).apartment ?? "",
        notifyBefore: (session.user as any).notifyBefore ?? true,
        notifyEnd: (session.user as any).notifyEnd ?? false,
      })
    }
  }, [session])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    await update()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Mi perfil</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
            <input type="text" value={form.apartment}
              onChange={(e) => setForm(f => ({ ...f, apartment: e.target.value.toUpperCase() }))} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              maxLength={5} />
          </div>
          <div className="border border-gray-100 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notificaciones por email</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.notifyBefore}
                onChange={(e) => setForm(f => ({ ...f, notifyBefore: e.target.checked }))}
                className="w-4 h-4 accent-blue-600" />
              <span className="text-sm text-gray-700">Avisarme 5 min antes de mi turno</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.notifyEnd}
                onChange={(e) => setForm(f => ({ ...f, notifyEnd: e.target.checked }))}
                className="w-4 h-4 accent-blue-600" />
              <span className="text-sm text-gray-700">Avisarme cuando finaliza mi turno</span>
            </label>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {saved && <p className="text-green-600 text-sm">✓ Cambios guardados</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-50">
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </div>
  )
}
