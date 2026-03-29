"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "", email: "", password: "", apartment: "",
    notifyBefore: true, notifyEnd: false,
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function update(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false })
    router.push("/calendar")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">Crear cuenta</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Laundry Cabello</p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/calendar" })}
          className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Registrarse con Google
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"/></div>
          <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">o con email</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Juan García" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="vos@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={8}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mínimo 8 caracteres" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departamento <span className="text-gray-400">(ej: 4B)</span>
            </label>
            <input type="text" value={form.apartment} onChange={(e) => update("apartment", e.target.value.toUpperCase())} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              placeholder="4B" maxLength={5} />
          </div>

          <div className="border border-gray-100 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notificaciones por email</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.notifyBefore} onChange={(e) => update("notifyBefore", e.target.checked)}
                className="w-4 h-4 accent-blue-600" />
              <span className="text-sm text-gray-700">Avisarme 5 min antes de mi turno</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.notifyEnd} onChange={(e) => update("notifyEnd", e.target.checked)}
                className="w-4 h-4 accent-blue-600" />
              <span className="text-sm text-gray-700">Avisarme cuando finaliza mi turno</span>
            </label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-50">
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">Ingresá</Link>
        </p>
      </div>
    </div>
  )
}
