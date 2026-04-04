import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { ICON_SIZE, normalizeIconAssetToPng } from "@/lib/icon-asset";

describe("normalizeIconAssetToPng", () => {
  it("converts a webp image into a png favicon payload", async () => {
    const source = await sharp({
      create: {
        width: 24,
        height: 24,
        channels: 4,
        background: { r: 255, g: 204, b: 0, alpha: 1 },
      },
    })
      .webp()
      .toBuffer();

    const png = await normalizeIconAssetToPng(source);
    const meta = await sharp(png).metadata();

    expect(meta.format).toBe("png");
    expect(meta.width).toBe(ICON_SIZE);
    expect(meta.height).toBe(ICON_SIZE);
  });
});
