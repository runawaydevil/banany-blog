import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadBuffer } from "@/lib/s3";
import { prisma } from "@/lib/prisma";
import sharp from "sharp";
import {
  clientIpFromRequest,
  rateLimit,
} from "@/lib/rate-limit";
import {
  classifyUploadMime,
  isAllowedUploadPrefix,
} from "@/lib/upload-policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 15 * 1024 * 1024;
const UPLOAD_MAX = 50;
const UPLOAD_WINDOW_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = clientIpFromRequest(req);
  const rl = rateLimit(`upload:${ip}`, UPLOAD_MAX, UPLOAD_WINDOW_MS);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid multipart body" },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const prefixRaw = (formData.get("prefix") as string) || "uploads";
  if (!isAllowedUploadPrefix(prefixRaw)) {
    return NextResponse.json({ error: "Invalid upload category" }, { status: 400 });
  }
  const prefix = prefixRaw;

  const buf = Buffer.from(await file.arrayBuffer());
  const { fileTypeFromBuffer } = await import("file-type");
  const detected = await fileTypeFromBuffer(buf);
  const declared = (file.type || "application/octet-stream").split(";")[0]!.trim();

  const classified = classifyUploadMime(detected, declared);
  if (!classified) {
    return NextResponse.json(
      { error: "Unsupported or unsafe file type" },
      { status: 400 },
    );
  }

  let outBuf: Buffer = buf;
  let outMime = classified.mime;
  let width: number | undefined;
  let height: number | undefined;

  if (classified.kind === "raster" || classified.kind === "gif") {
    try {
      const img = sharp(buf);
      const meta = await img.metadata();
      width = meta.width ?? undefined;
      height = meta.height ?? undefined;
      outBuf = Buffer.from(await img.rotate().webp({ quality: 85 }).toBuffer());
      outMime = "image/webp";
    } catch {
      return NextResponse.json({ error: "Invalid image" }, { status: 400 });
    }
  } else {
    outMime = classified.mime;
  }

  const { key, url } = await uploadBuffer({
    buffer: outBuf,
    mimeType: outMime,
    prefix,
  });

  const media = await prisma.media.create({
    data: {
      key,
      url,
      mimeType: outMime,
      size: outBuf.length,
      width,
      height,
    },
  });

  return NextResponse.json({
    id: media.id,
    key: media.key,
    url: media.url,
    mimeType: media.mimeType,
  });
}
