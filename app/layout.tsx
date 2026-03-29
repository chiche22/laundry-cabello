import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { auth } from "@/lib/auth"
import Header from "@/components/Header"
import SessionProvider from "@/components/SessionProvider"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_BUILDING_NAME ?? "Laundry Cabello",
  description: "Reservá tu turno en el laundry del edificio",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <SessionProvider>
          {session?.user && <Header user={session.user as any} />}
          <main className="flex-1">{children}</main>
        </SessionProvider>
      </body>
    </html>
  )
}
