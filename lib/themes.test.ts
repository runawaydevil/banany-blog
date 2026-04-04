import { describe, expect, it } from "vitest";
import {
  PRESET_LABELS,
  THEME_PRESETS,
  THEME_PRESET_IDS,
  TYPOGRAPHY_BY_PRESET,
} from "@/lib/themes";

describe("theme presets", () => {
  it("keeps labels, tokens, and typography in sync for every preset", () => {
    for (const preset of THEME_PRESET_IDS) {
      expect(THEME_PRESETS[preset]).toBeDefined();
      expect(PRESET_LABELS[preset]).toBeTruthy();
      expect(TYPOGRAPHY_BY_PRESET[preset]).toBeDefined();
    }
  });

  it("adds four visually distinct preset families beyond paper and ink", () => {
    const extraPresets = [
      "terracotta-dawn",
      "fjord-night",
      "matcha-milk",
      "laser-grid",
    ] as const;

    const accentSet = new Set(extraPresets.map((preset) => THEME_PRESETS[preset].accent));
    const backgroundSet = new Set(extraPresets.map((preset) => THEME_PRESETS[preset].bg));

    expect(accentSet.size).toBe(extraPresets.length);
    expect(backgroundSet.size).toBe(extraPresets.length);
  });

  it("registers vaporwave neon with its dedicated label, typography, and neon tokens", () => {
    expect(THEME_PRESET_IDS).toContain("vaporwave-neon");
    expect(PRESET_LABELS["vaporwave-neon"]).toBe("Vaporwave Neon");
    expect(THEME_PRESETS["vaporwave-neon"]).toMatchObject({
      bg: "#12091f",
      accent: "#ff4fd8",
      link: "#4de7ff",
      focusRing: "#44f7ff",
    });
    expect(TYPOGRAPHY_BY_PRESET["vaporwave-neon"]).toEqual({
      body: "ibm-plex-sans",
      heading: "space-grotesk",
      mono: "ibm-plex-mono",
    });
  });

  it("keeps Catppuccin flavors visually distinct inside the same family", () => {
    const catppuccinPresets = [
      "catppuccin-latte",
      "catppuccin-frappe",
      "catppuccin-macchiato",
      "catppuccin-mocha",
    ] as const;

    const accentSet = new Set(
      catppuccinPresets.map((preset) => THEME_PRESETS[preset].accent),
    );
    const linkSet = new Set(
      catppuccinPresets.map((preset) => THEME_PRESETS[preset].link),
    );
    const typographySet = new Set(
      catppuccinPresets.map(
        (preset) =>
          `${TYPOGRAPHY_BY_PRESET[preset].body}|${TYPOGRAPHY_BY_PRESET[preset].heading}`,
      ),
    );

    expect(accentSet.size).toBe(catppuccinPresets.length);
    expect(linkSet.size).toBe(catppuccinPresets.length);
    expect(typographySet.size).toBeGreaterThanOrEqual(3);
  });
});
