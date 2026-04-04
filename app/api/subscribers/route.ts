import { NextResponse } from "next/server";
import { auth } from "@/auth";
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

function subscriberStatus(subscriber: {
  unsubscribedAt: Date | null;
}): "active" | "unsubscribed" {
  return subscriber.unsubscribedAt ? "unsubscribed" : "active";
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const format = url.searchParams.get("format");
  const subscribers = await prisma.subscriber.findMany({
    orderBy: [{ unsubscribedAt: "asc" }, { createdAt: "desc" }],
  });

  if (format === "csv") {
    const lines = [
      "email,status,createdAt,unsubscribedAt",
      ...subscribers.map((subscriber) =>
        [
          subscriber.email,
          subscriberStatus(subscriber),
          subscriber.createdAt.toISOString(),
          subscriber.unsubscribedAt?.toISOString() ?? "",
        ]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      ),
    ];

    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="banany-subscribers.csv"',
      },
    });
  }

  return NextResponse.json(
    subscribers.map((subscriber) => ({
      id: subscriber.id,
      email: subscriber.email,
      createdAt: subscriber.createdAt.toISOString(),
      unsubscribedAt: subscriber.unsubscribedAt?.toISOString() ?? null,
      updatedAt: subscriber.updatedAt.toISOString(),
      status: subscriberStatus(subscriber),
    })),
  );
}

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
  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (existing) {
    await prisma.subscriber.update({
      where: { email },
      data: {
        unsubscribedAt: null,
        unsubscribeToken: existing.unsubscribeToken || nanoid(32),
      },
    });
  } else {
    await prisma.subscriber.create({
      data: {
        email,
        unsubscribeToken: nanoid(32),
      },
    });
  }

  return NextResponse.json({ ok: true });
}
