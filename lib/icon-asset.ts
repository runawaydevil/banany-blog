import sharp from "sharp";

export const ICON_SIZE = 180;

export async function normalizeIconAssetToPng(
  body: Uint8Array | Buffer,
  size = ICON_SIZE,
): Promise<Buffer> {
  return sharp(Buffer.from(body))
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}
