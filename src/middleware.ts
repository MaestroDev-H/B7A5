import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("gearup_token")?.value;
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

  // 2. Authenticated users trying to access auth pages
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard/customer", request.url));
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
