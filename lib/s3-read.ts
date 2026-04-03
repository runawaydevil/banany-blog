import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

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

export async function getObjectFromS3(key: string): Promise<{
  body: Uint8Array;
  contentType: string;
} | null> {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) return null;
  try {
    const out = await client().send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    if (!out.Body) return null;
    const buf = await out.Body.transformToByteArray();
    return {
      body: buf,
      contentType: out.ContentType || "application/octet-stream",
    };
  } catch {
    return null;
  }
}
