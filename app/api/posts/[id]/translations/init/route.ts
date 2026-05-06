import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeLocale } from "@/lib/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const post = await prisma.post.findUnique({
    where: { id },
  });
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (post.groupId) {
    return NextResponse.json({ ok: true, groupId: post.groupId });
  }

  const site = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  const locale = normalizeLocale(site?.locale) as "en" | "pt";

  const created = await prisma.$transaction(async (tx) => {
    const group = await tx.postGroup.create({ data: {} });
    await tx.post.update({
      where: { id: post.id },
      data: { groupId: group.id },
    });
    await tx.postTranslation.create({
      data: {
        groupId: group.id,
        locale,
        type: post.type,
        title: post.title,
        slug: post.slug,
        content: post.content,
        contentFormat: post.contentFormat,
        published: post.published,
        scheduledAt: post.scheduledAt,
        publishedAt: post.publishedAt,
        notifySubscribersOnPublish: post.notifySubscribersOnPublish,
        pinned: post.pinned,
        tags: post.tags,
        linkUrl: post.linkUrl,
      },
    });
    return group.id;
  });

  return NextResponse.json({ ok: true, groupId: created });
}

