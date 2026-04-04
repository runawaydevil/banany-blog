import { NextRequest, NextResponse } from "next/server";
import { getObjectFromS3 } from "@/lib/s3-read";
import { prisma } from "@/lib/prisma";
import { isValidMediaObjectKey } from "@/lib/upload-policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function dispositionForMime(ct: string): string {
  const base = ct.split(";")[0]!.trim().toLowerCase();
  if (base.startsWith("image/")) {
    return "inline";
  }
  return "attachment";
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key || !isValidMediaObjectKey(key)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const media = await prisma.media.findUnique({ where: { key } });
  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const obj = await getObjectFromS3(key);
  if (!obj) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ct = obj.contentType || media.mimeType || "application/octet-stream";
  const disp = dispositionForMime(ct);

  return new NextResponse(Buffer.from(obj.body), {
    headers: {
      "Content-Type": ct,
      "Content-Disposition": `${disp}; filename="file"`,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
