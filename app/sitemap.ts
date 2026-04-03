import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site";
import { getEffectivePublicOrigin } from "@/lib/public-origin";
import { toISOStringSafe } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteSettings();
  if (!site?.setupComplete) return [];

  const base = getEffectivePublicOrigin(site).replace(/\/$/, "");

  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true, publishedAt: true, updatedAt: true },
  });
  const pages = await prisma.page.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  const entries: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date() },
    { url: `${base}/archive`, lastModified: new Date() },
    ...posts.map((p) => ({
      url: `${base}/posts/${p.slug}`,
      lastModified: new Date(
        toISOStringSafe(p.publishedAt) || p.updatedAt.toISOString(),
      ),
    })),
    ...pages.map((p) => ({
      url: `${base}/p/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  ];

  return entries;
}
