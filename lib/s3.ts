import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

function client() {
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION || "us-east-1";
  return new S3Client({
    region,
    endpoint: endpoint || undefined,
    forcePathStyle: !!endpoint,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    },
  });
}

export async function uploadBuffer(params: {
  buffer: Buffer;
  mimeType: string;
  prefix?: string;
}): Promise<{ key: string; url: string }> {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error("S3_BUCKET is not configured");

  const ext =
    params.mimeType === "image/png"
      ? "png"
      : params.mimeType === "image/jpeg" || params.mimeType === "image/jpg"
        ? "jpg"
        : params.mimeType === "image/webp"
          ? "webp"
          : params.mimeType === "image/gif"
            ? "gif"
            : "bin";

  const key = `${params.prefix || "uploads"}/${nanoid(16)}.${ext}`;
  const publicBase = process.env.S3_PUBLIC_URL?.replace(/\/$/, "") || "";

  await client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: params.buffer,
      ContentType: params.mimeType,
    }),
  );

  const url = publicBase
    ? `${publicBase}/${key}`
    : `/api/media/raw?key=${encodeURIComponent(key)}`;

  return { key, url };
}

export async function deleteObjectKey(key: string) {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) return;
  await client().send(
    new DeleteObjectCommand({ Bucket: bucket, Key: key }),
  );
}
