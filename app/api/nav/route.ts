import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await prisma.navItem.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(items);
}

const putSchema = z.array(
  z.object({
    id: z.string().optional(),
    label: z.string().min(1).max(120),
    href: z.string().min(1).max(500),
    order: z.number().int(),
  }),
);

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await req.json().catch(() => null);
  const parsed = putSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  await prisma.$transaction([
    prisma.navItem.deleteMany(),
    prisma.navItem.createMany({
      data: parsed.data.map((x, i) => ({
        label: x.label,
        href: x.href,
        order: x.order ?? i,
      })),
    }),
  ]);
  const items = await prisma.navItem.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(items);
}
