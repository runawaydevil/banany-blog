/** Bundled font keys — self-hosted via @fontsource or /public/fonts */
export type BundledFontKey =
  | "newsreader"
  | "space-grotesk"
  | "atkinson"
  | "ibm-plex-sans"
  | "ibm-plex-mono"
  | "ibm-plex-serif";

export const BUNDLED_FONTS: {
  key: BundledFontKey;
  label: string;
  group: string;
  cssImport: string;
  stack: string;
}[] = [
  {
    key: "newsreader",
    label: "Newsreader",
    group: "Editorial",
    cssImport: "@fontsource/newsreader/400.css",
    stack: '"Newsreader", Georgia, serif',
  },
  {
    key: "space-grotesk",
    label: "Space Grotesk",
    group: "Display / Sans",
    cssImport: "@fontsource/space-grotesk/400.css",
    stack: '"Space Grotesk", system-ui, sans-serif',
  },
  {
    key: "atkinson",
    label: "Atkinson Hyperlegible Next",
    group: "Readable sans",
    cssImport: "@fontsource/atkinson-hyperlegible-next/400.css",
    stack: '"Atkinson Hyperlegible Next", system-ui, sans-serif',
  },
  {
    key: "ibm-plex-sans",
    label: "IBM Plex Sans",
    group: "IBM / Retro",
    cssImport: "@fontsource/ibm-plex-sans/400.css",
    stack: '"IBM Plex Sans", system-ui, sans-serif',
  },
  {
    key: "ibm-plex-serif",
    label: "IBM Plex Serif",
    group: "IBM / Retro",
    cssImport: "@fontsource/ibm-plex-serif/400.css",
    stack: '"IBM Plex Serif", Georgia, serif',
  },
  {
    key: "ibm-plex-mono",
    label: "IBM Plex Mono",
    group: "IBM / Retro (mono)",
    cssImport: "@fontsource/ibm-plex-mono/400.css",
    stack: '"IBM Plex Mono", ui-monospace, monospace',
  },
];

/** Value for font*Key when using an uploaded @font-face (see ThemeInject). */
export function customFontKeyFromFamily(familyName: string) {
  return `custom:${familyName.trim().replace(/\s+/g, "_")}`;
}

export function fontStackForKey(key: string | null | undefined): string {
  const f = BUNDLED_FONTS.find((x) => x.key === key);
  if (f) return f.stack;
  if (key?.startsWith("custom:")) {
    const name = key.slice("custom:".length).replace(/_/g, " ");
    return `"${name}", system-ui, sans-serif`;
  }
  return BUNDLED_FONTS[0].stack;
}
