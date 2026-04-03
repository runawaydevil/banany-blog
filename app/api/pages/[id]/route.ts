import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { slugify } from "@/lib/utils";
import { slugBaseFromPostInput } from "@/lib/slug-base";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchSchema = z
  .object({
    title: z.string().min(1).max(500).optional(),
    content: z.string().optional(),
    published: z.boolean().optional(),
    publishedAt: z.string().datetime().nullable().optional(),
  })
  .strict();

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
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
    let s = (base && slugify(base)) || nanoid(8);
    if (!s) s = nanoid(8);
    let candidate = s;
    for (let i = 0; i < 24; i++) {
      const clash = await prisma.page.findFirst({
        where: { slug: candidate, NOT: { id: excludeId } },
      });
      if (!clash) return candidate;
      candidate = `${s}-${nanoid(4)}`;
    }
    return `${s}-${nanoid(6)}`;
  }

  if (data.publishedAt !== undefined) {
    data.publishedAt = data.publishedAt
      ? new Date(data.publishedAt as string)
      : null;
  }

  const current = await prisma.page.findUnique({ where: { id } });
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
      data.title !== undefined ? (data.title as string) : current.title;
    const nextContent =
      data.content !== undefined ? (data.content as string) : current.content;
    const plain = slugBaseFromPostInput(nextTitle, String(nextContent || ""));
    data.slug = await uniqueSlugFor(plain, id);
  }

  const page = await prisma.page.update({
    where: { id },
    data: data as object,
  });
  return NextResponse.json(page);
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
  await prisma.page.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
