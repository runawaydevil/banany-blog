import { prisma } from "@/lib/prisma";

export async function mediaUrlById(
  id: string | null | undefined,
): Promise<string | null> {
  if (!id) return null;
  const m = await prisma.media.findUnique({ where: { id } });
  return m?.url ?? null;
}
