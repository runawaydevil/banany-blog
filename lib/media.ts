import type { Media, SiteSettings } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deleteObjectKey } from "@/lib/s3";
import { getObjectFromS3 } from "@/lib/s3-read";
import { getEffectivePublicOrigin } from "@/lib/public-origin";
import { isValidMediaObjectKey } from "@/lib/upload-policy";

type MediaRecord = Pick<Media, "id" | "key" | "url" | "mimeType">;

const DIRECT_KEY_RE =
  /\b(?:uploads|branding)\/[A-Za-z0-9_-]{8,64}\.[a-z0-9]{2,8}\b/gi;
const RAW_ROUTE_KEY_RE = /\/api\/media\/raw\?[^"' >)]*?key=([^"'& >)]+)/gi;

export async function getMediaById(
  id: string | null | undefined,
): Promise<MediaRecord | null> {
  if (!id) return null;
  return prisma.media.findUnique({
    where: { id },
    select: { id: true, key: true, url: true, mimeType: true },
  });
}

export async function mediaUrlById(
  id: string | null | undefined,
): Promise<string | null> {
  const media = await getMediaById(id);
  return media?.url ?? null;
}

export function absolutizeMediaUrl(
  rawUrl: string | null | undefined,
  site: Pick<SiteSettings, "publicUrl"> | null,
): string | null {
  if (!rawUrl) return null;
  try {
    return new URL(rawUrl).toString();
  } catch {
    return new URL(rawUrl, `${getEffectivePublicOrigin(site)}/`).toString();
  }
}

export async function readMediaContentById(
  id: string | null | undefined,
): Promise<{ body: Uint8Array; contentType: string } | null> {
  const media = await getMediaById(id);
  if (!media) return null;
  const object = await getObjectFromS3(media.key);
  if (!object) return null;
  return {
    body: object.body,
    contentType: object.contentType || media.mimeType || "application/octet-stream",
  };
}

export function extractReferencedMediaKeysFromContent(content: string): string[] {
  const keys = new Set<string>();

  for (const match of content.matchAll(DIRECT_KEY_RE)) {
    const key = match[0];
    if (isValidMediaObjectKey(key)) keys.add(key);
  }

  for (const match of content.matchAll(RAW_ROUTE_KEY_RE)) {
    const rawKey = match[1];
    if (!rawKey) continue;
    try {
      const decoded = decodeURIComponent(rawKey);
      if (isValidMediaObjectKey(decoded)) keys.add(decoded);
    } catch {
      /* ignore malformed key */
    }
  }

  return [...keys];
}

export const extractReferencedMediaKeysFromHtml = extractReferencedMediaKeysFromContent;

export async function reconcileMediaUsage(): Promise<{
  deleted: number;
  kept: number;
}> {
  const [site, posts, pages, allMedia] = await Promise.all([
    prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      select: { faviconMediaId: true, logoMediaId: true },
    }),
    prisma.post.findMany({ select: { content: true } }),
    prisma.page.findMany({ select: { content: true } }),
    prisma.media.findMany({
      select: { id: true, key: true, url: true, mimeType: true },
    }),
  ]);

  const referencedKeys = new Set<string>();

  for (const post of posts) {
    for (const key of extractReferencedMediaKeysFromContent(post.content)) {
      referencedKeys.add(key);
    }
  }

  for (const page of pages) {
    for (const key of extractReferencedMediaKeysFromContent(page.content)) {
      referencedKeys.add(key);
    }
  }

  const brandingIds = [site?.faviconMediaId, site?.logoMediaId].filter(
    (value): value is string => Boolean(value),
  );
  if (brandingIds.length > 0) {
    const brandingMedia = await prisma.media.findMany({
      where: { id: { in: brandingIds } },
      select: { key: true },
    });
    for (const media of brandingMedia) {
      referencedKeys.add(media.key);
    }
  }

  const orphaned = allMedia.filter((media) => !referencedKeys.has(media.key));
  if (orphaned.length === 0) {
    return { deleted: 0, kept: allMedia.length };
  }

  await Promise.all(
    orphaned.map(async (media) => {
      await deleteObjectKey(media.key).catch(() => {});
    }),
  );

  await prisma.media.deleteMany({
    where: { id: { in: orphaned.map((media) => media.id) } },
  });

  return {
    deleted: orphaned.length,
    kept: allMedia.length - orphaned.length,
  };
}

let rolloutCleanupPromise:
  | Promise<{
      deleted: number;
      kept: number;
    }>
  | null = null;

export function runMediaRolloutCleanupOnce(): Promise<{
  deleted: number;
  kept: number;
}> {
  if (!rolloutCleanupPromise) {
    rolloutCleanupPromise = reconcileMediaUsage().catch((error) => {
      rolloutCleanupPromise = null;
      throw error;
    });
  }
  return rolloutCleanupPromise;
}
