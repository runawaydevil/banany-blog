import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { slugBaseFromPostTitle } from "@/lib/slug-base";
import { nanoid } from "nanoid";
import { z } from "zod";
import { PostType } from "@prisma/client";
import { scheduledAtInPastMessage } from "@/lib/post-scheduled-at";
import { finalizeExcerptForStorage } from "@/lib/excerpt-plain";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  title: z.string().max(500).nullable().optional(),
  content: z.string(),
  type: z.nativeEnum(PostType).optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
  tags: z.array(z.string()).optional(),
  excerpt: z.string().max(8000).nullable().optional(),
  linkUrl: z.string().url().nullable().optional().or(z.literal("")),
  pinned: z.boolean().optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const admin = searchParams.get("admin") === "1";
  const session = await auth();

  if (admin && !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await prisma.post.findMany({
    where: admin
      ? {}
      : { published: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(posts);
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
  const linkUrl =
    body.linkUrl === "" || body.linkUrl == null ? null : body.linkUrl;
  const plain = slugBaseFromPostTitle(body.title);
  let slug = slugify(plain) || nanoid(10);
  const exists = await prisma.post.findUnique({ where: { slug } });
  if (exists) slug = `${slug}-${nanoid(6)}`;

  const published = body.published ?? true;
  const publishedAt =
    body.publishedAt != null
      ? new Date(body.publishedAt)
      : published
        ? new Date()
        : null;

  const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
  if (scheduledAt) {
    const msg = scheduledAtInPastMessage(scheduledAt);
    if (msg) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  }

  const post = await prisma.post.create({
    data: {
      title: body.title ?? null,
      slug,
      content: body.content,
      type: body.type ?? PostType.POST,
      published,
      publishedAt,
      scheduledAt,
      tags: body.tags ?? [],
      excerpt: finalizeExcerptForStorage(body.excerpt),
      linkUrl,
      pinned: body.pinned ?? false,
    },
  });

  return NextResponse.json(post);
}
