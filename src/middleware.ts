/**
 * src/middleware.ts
 * Next.js Edge Middleware — protects all app routes.
 * Unauthenticated requests to protected pages are redirected to /login.
 * Public routes (/login, /register, /api/auth/*, static assets) are always allowed.
 */

export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    /*
     * Match every request path EXCEPT:
     *  - _next/static  (static files)
     *  - _next/image   (image optimisation)
     *  - favicon.ico
     *  - /login        (sign-in page)
     *  - /register     (sign-up page)
     *  - /api/auth/*   (NextAuth endpoints)
     */
    "/((?!_next/static|_next/image|favicon.ico|login|register|forgot-password|reset-password|api/auth).*)",
  ],
};
