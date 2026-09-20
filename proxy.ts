import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** Fast edge check; every admin page/action performs the authoritative server-side role check. */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin") && !request.cookies.get("igp_session")) {
    const login = new URL("/login", request.url); login.searchParams.set("next", request.nextUrl.pathname); return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
