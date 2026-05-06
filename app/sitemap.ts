import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site";
import { getEffectivePublicOrigin } from "@/lib/public-origin";
import { toISOStringSafe } from "@/lib/dates";
import { normalizeLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteSettings();
  if (!site?.setupComplete) return [];

  const base = getEffectivePublicOrigin(site).replace(/\/$/, "");

  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true, publishedAt: true, updatedAt: true, groupId: true },
  });
  const locale = normalizeLocale(site.locale);
  const groupIds = posts.map((p) => p.groupId).filter(Boolean) as string[];
  const translations =
    groupIds.length > 0
      ? await prisma.postTranslation.findMany({
          where: { groupId: { in: groupIds }, locale, published: true },
          select: { groupId: true, slug: true, publishedAt: true, updatedAt: true },
        })
      : [];
  const byGroup = new Map(translations.map((t) => [t.groupId, t]));
  const pages = await prisma.page.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  const entries: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date() },
    { url: `${base}/archive`, lastModified: new Date() },
    ...posts.map((p) => ({
      url: `${base}/posts/${(p.groupId && byGroup.get(p.groupId)?.slug) || p.slug}`,
      lastModified: new Date(
        toISOStringSafe((p.groupId && byGroup.get(p.groupId)?.publishedAt) || p.publishedAt) ||
          ((p.groupId && byGroup.get(p.groupId)?.updatedAt) || p.updatedAt).toISOString(),
      ),
    })),
    ...pages.map((p) => ({
      url: `${base}/p/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  ];

  return entries;
}
