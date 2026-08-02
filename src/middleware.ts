import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("gearup_token")?.value;
  const role = request.cookies.get("gearup_role")?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isCheckoutRoute = pathname.startsWith("/checkout");

  // 1. Unauthenticated users trying to access protected routes
  if (!token && (isDashboardRoute || isCheckoutRoute)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated users trying to access auth pages (login/register)
  if (token && isAuthRoute) {
    const targetDashboard = role === "ADMIN" ? "/dashboard/admin" : role === "PROVIDER" ? "/dashboard/provider" : "/dashboard/customer";
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  // 3. Role-based Dashboard Route Protection & Isolation Guarantee
  if (token && role) {
    if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
      const fallback = role === "PROVIDER" ? "/dashboard/provider" : "/dashboard/customer";
      return NextResponse.redirect(new URL(fallback, request.url));
    }
    if (pathname.startsWith("/dashboard/provider") && role !== "PROVIDER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/customer", request.url));
    }
    if (pathname.startsWith("/dashboard/customer") && role !== "CUSTOMER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/provider", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/checkout/:path*",
    "/login",
    "/register",
  ],
};
