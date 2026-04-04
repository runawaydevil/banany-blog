import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { slugBaseFromPostInput } from "@/lib/slug-base";
import { nanoid } from "nanoid";
import { z } from "zod";
import { reconcileMediaUsage } from "@/lib/media";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string(),
  published: z.boolean().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const admin = searchParams.get("admin") === "1";
  const session = await auth();
  if (admin && !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const pages = await prisma.page.findMany({
    where: admin ? {} : { published: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(pages);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const body = parsed.data;
  const plain = slugBaseFromPostInput(body.title, body.content);
  let slug = slugify(plain) || nanoid(8);
  if (await prisma.page.findUnique({ where: { slug } })) {
    slug = `${slug}-${nanoid(4)}`;
  }
  const published = body.published ?? false;
  const publishedAt = body.publishedAt
    ? new Date(body.publishedAt)
    : published
      ? new Date()
      : null;

  const page = await prisma.page.create({
    data: {
      title: body.title,
      slug,
      content: body.content,
      published,
      publishedAt,
    },
  });
  await reconcileMediaUsage();
  return NextResponse.json(page);
}
