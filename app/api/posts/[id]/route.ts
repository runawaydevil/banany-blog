import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { slugify } from "@/lib/utils";
import { slugBaseFromPostTitle } from "@/lib/slug-base";
import { z } from "zod";
import { PostType } from "@prisma/client";
import { scheduledAtInPastMessage } from "@/lib/post-scheduled-at";
import { finalizeExcerptForStorage } from "@/lib/excerpt-plain";
import { reconcileMediaUsage } from "@/lib/media";

export const dynamic = "force-dynamic";

const patchSchema = z
  .object({
    title: z.string().max(500).nullable().optional(),
    content: z.string().optional(),
    type: z.nativeEnum(PostType).optional(),
    published: z.boolean().optional(),
    publishedAt: z.string().datetime().nullable().optional(),
    scheduledAt: z.string().datetime().nullable().optional(),
    tags: z.array(z.string()).optional(),
    excerpt: z.string().max(8000).nullable().optional(),
    linkUrl: z.string().url().nullable().optional().or(z.literal("")),
    pinned: z.boolean().optional(),
  })
  .strict();

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data: Record<string, unknown> = { ...parsed.data };

  async function uniqueSlugFor(base: string, excludeId: string): Promise<string> {
    let s = (base && slugify(base)) || nanoid(10);
    if (!s) s = nanoid(10);
    let candidate = s;
    for (let i = 0; i < 24; i++) {
      const clash = await prisma.post.findFirst({
        where: { slug: candidate, NOT: { id: excludeId } },
      });
      if (!clash) return candidate;
      candidate = `${s}-${nanoid(5)}`;
    }
    return `${s}-${nanoid(8)}`;
  }

  if (data.publishedAt !== undefined) {
    data.publishedAt = data.publishedAt
      ? new Date(data.publishedAt as string)
      : null;
  }
  if (data.scheduledAt !== undefined) {
    data.scheduledAt = data.scheduledAt
      ? new Date(data.scheduledAt as string)
      : null;
    if (data.scheduledAt) {
      const msg = scheduledAtInPastMessage(data.scheduledAt as Date);
      if (msg) {
        return NextResponse.json({ error: msg }, { status: 400 });
      }
    }
  }
  if (data.linkUrl === "") data.linkUrl = null;
  if (data.excerpt !== undefined) {
    data.excerpt = finalizeExcerptForStorage(data.excerpt as string | null);
  }

  const current = await prisma.post.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    data.published === true &&
    !current.published &&
    data.publishedAt === undefined
  ) {
    data.publishedAt = new Date();
  }

  if (!current.published) {
    const nextTitle =
      data.title !== undefined ? (data.title as string | null) : current.title;
    const plain = slugBaseFromPostTitle(nextTitle);
    data.slug = await uniqueSlugFor(plain, id);
  }

  const post = await prisma.post.update({
    where: { id },
    data: data as object,
  });
  await reconcileMediaUsage();
  return NextResponse.json(post);
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  await prisma.post.delete({ where: { id } });
  await reconcileMediaUsage();
  return NextResponse.json({ ok: true });
}
