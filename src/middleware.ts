// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Gunakan getToken dari next-auth/jwt untuk mendapatkan token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Protected routes - sesuaikan dengan kebutuhan Anda
  const protectedRoutes = ["/dashboard", "/profile", "/admin"];

  // Public routes yang tidak perlu authentication
  const publicRoutes = ["/signin", "/register", "/", "/api/auth"];

  // Cek jika route adalah public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Cek jika route adalah protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Jika user belum login dan mencoba akses protected route
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/signin", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Jika user sudah login dan mencoba akses login page
  if (pathname === "/signin" && token) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // Jika user sudah login dan mencoba akses login page
  if (pathname === "/register" && token) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
