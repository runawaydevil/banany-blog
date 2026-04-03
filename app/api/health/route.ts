import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Liveness/readiness for reverse proxies and Docker HEALTHCHECK.
 * Does not touch the database (avoids false negatives when DB is still starting).
 */
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
