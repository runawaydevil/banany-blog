import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge middleware cannot rely on AUTH_SECRET in Docker/standalone (env is not
 * available there at runtime). Dashboard auth is enforced in
 * `app/(dashboard)/dashboard/layout.tsx` via `auth()` (Node).
 *
 * We only forward the requested path so the layout can build an accurate
 * login callback URL (deep links under /dashboard).
 */
export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname + req.nextUrl.search;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-bb-callback-path", path);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
