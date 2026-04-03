import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { nanoid } from "nanoid";
import {
  clientIpFromRequest,
  rateLimit,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
});

const SUB_MAX = 20;
const SUB_WINDOW_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
  const ip = clientIpFromRequest(req);
  const rl = rateLimit(`subscribe:${ip}`, SUB_MAX, SUB_WINDOW_MS);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();
  await prisma.subscriber.upsert({
    where: { email },
    create: { email, confirmed: true, token: nanoid(32) },
    update: {},
  });
  return NextResponse.json({ ok: true });
}
