import { prisma } from "@/lib/prisma";
import type { UploadedFontFace } from "@/lib/font-face-types";

export async function getUploadedFontFaces(): Promise<UploadedFontFace[]> {
  const rows = await prisma.fontAsset.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    familyName: r.familyName,
    url: r.url,
    format: r.format,
  }));
}
