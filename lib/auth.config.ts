import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

// Config liviana para el middleware (edge-compatible, sin Prisma)
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    newUser: "/register/complete",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname

      const publicPaths = ["/login", "/register", "/api/auth", "/api/register"]
      const isPublic = publicPaths.some((p) => pathname.startsWith(p))
      // Nunca interceptar rutas de API con el proxy
      const isApi = pathname.startsWith("/api/")

      if (!isLoggedIn && !isPublic && !isApi) return false
      if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
        return Response.redirect(new URL("/calendar", nextUrl))
      }
      if (isLoggedIn && !(auth?.user as any)?.apartment && !isApi && pathname !== "/register/complete" && !isPublic) {
        return Response.redirect(new URL("/register/complete", nextUrl))
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.apartment = (user as any).apartment
        token.isAdmin = (user as any).isAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).apartment = token.apartment
        ;(session.user as any).isAdmin = token.isAdmin
      }
      return session
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({ credentials: {} }),
  ],
}
