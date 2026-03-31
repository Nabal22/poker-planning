import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip login page, static assets, and API routes
  if (
    pathname === "/login" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.match(/\.(png|svg|ico|jpg|jpeg|gif|webp|woff2?|ttf|css|js)$/)
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access-token")?.value;
  if (accessToken === process.env.ACCESS_CODE) {
    return NextResponse.next();
  }

  // Redirect to login, preserving the original destination
  const loginUrl = new URL("/login", request.url);
  if (pathname !== "/") {
    loginUrl.searchParams.set("redirect", pathname);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
