export type ThemePresetId =
  | "paper"
  | "ink"
  | "catppuccin-latte"
  | "catppuccin-frappe"
  | "catppuccin-macchiato"
  | "catppuccin-mocha";

export type SemanticTokens = {
  bg: string;
  surface: string;
  surfaceSoft: string;
  surfaceElevated: string;
  text: string;
  textMuted: string;
  heading: string;
  border: string;
  link: string;
  linkHover: string;
  accent: string;
  accentForeground: string;
  inputBg: string;
  inputText: string;
  focusRing: string;
  success: string;
  warning: string;
  danger: string;
};

export const THEME_PRESETS: Record<ThemePresetId, SemanticTokens> = {
  paper: {
    bg: "#faf8f5",
    surface: "#ffffff",
    surfaceSoft: "#f3f0ea",
    surfaceElevated: "#ffffff",
    text: "#2c2825",
    textMuted: "#6b6560",
    heading: "#1a1715",
    border: "#e5e0d8",
    link: "#6b5c4c",
    linkHover: "#4a3f35",
    accent: "#c4a574",
    accentForeground: "#2c2825",
    inputBg: "#ffffff",
    inputText: "#2c2825",
    focusRing: "#c4a574",
    success: "#4a7c59",
    warning: "#b8860b",
    danger: "#a94442",
  },
  ink: {
    bg: "#121110",
    surface: "#1a1918",
    surfaceSoft: "#222120",
    surfaceElevated: "#262524",
    text: "#e8e4de",
    textMuted: "#9a948a",
    heading: "#f5f2ec",
    border: "#3a3835",
    link: "#d4c4a8",
    linkHover: "#e8dcc8",
    accent: "#8b7355",
    accentForeground: "#f5f2ec",
    inputBg: "#1a1918",
    inputText: "#e8e4de",
    focusRing: "#8b7355",
    success: "#7cb87c",
    warning: "#d4a574",
    danger: "#c97c7c",
  },
  "catppuccin-latte": {
    bg: "#eff1f5",
    surface: "#e6e9ef",
    surfaceSoft: "#dce0e8",
    surfaceElevated: "#ccd0da",
    text: "#4c4f69",
    textMuted: "#6c6f85",
    heading: "#303446",
    border: "#bcc0cc",
    link: "#1e66f5",
    linkHover: "#7287fd",
    accent: "#8839ef",
    accentForeground: "#eff1f5",
    inputBg: "#e6e9ef",
    inputText: "#4c4f69",
    focusRing: "#8839ef",
    success: "#40a02b",
    warning: "#df8e1d",
    danger: "#d20f39",
  },
  "catppuccin-frappe": {
    bg: "#303446",
    surface: "#292c3c",
    surfaceSoft: "#232634",
    surfaceElevated: "#414559",
    text: "#c6d0f5",
    textMuted: "#a5adce",
    heading: "#c6d0f5",
    border: "#51576d",
    link: "#8caaee",
    linkHover: "#babbf1",
    accent: "#ca9ee6",
    accentForeground: "#303446",
    inputBg: "#292c3c",
    inputText: "#c6d0f5",
    focusRing: "#ca9ee6",
    success: "#a6d189",
    warning: "#e5c890",
    danger: "#e78284",
  },
  "catppuccin-macchiato": {
    bg: "#24273a",
    surface: "#1e2030",
    surfaceSoft: "#181926",
    surfaceElevated: "#363a4f",
    text: "#cad3f5",
    textMuted: "#a5adcb",
    heading: "#cad3f5",
    border: "#494d64",
    link: "#8aadf4",
    linkHover: "#b7bdf8",
    accent: "#c6a0f6",
    accentForeground: "#24273a",
    inputBg: "#1e2030",
    inputText: "#cad3f5",
    focusRing: "#c6a0f6",
    success: "#a6da95",
    warning: "#eed49f",
    danger: "#ed8796",
  },
  "catppuccin-mocha": {
    bg: "#1e1e2e",
    surface: "#181825",
    surfaceSoft: "#11111b",
    surfaceElevated: "#313244",
    text: "#cdd6f4",
    textMuted: "#a6adc8",
    heading: "#cdd6f4",
    border: "#45475a",
    link: "#89b4fa",
    linkHover: "#b4befe",
    accent: "#cba6f7",
    accentForeground: "#1e1e2e",
    inputBg: "#181825",
    inputText: "#cdd6f4",
    focusRing: "#cba6f7",
    success: "#a6e3a1",
    warning: "#f9e2af",
    danger: "#f38ba8",
  },
};

export const PRESET_LABELS: Record<ThemePresetId, string> = {
  paper: "Paper",
  ink: "Ink",
  "catppuccin-latte": "Catppuccin Latte",
  "catppuccin-frappe": "Catppuccin Frappé",
  "catppuccin-macchiato": "Catppuccin Macchiato",
  "catppuccin-mocha": "Catppuccin Mocha",
};

export function isThemePresetId(s: string): s is ThemePresetId {
  return s in THEME_PRESETS;
}

/** Curated type stacks per preset — no user-uploaded fonts in the product UX. */
export type TypographyKeys = {
  body: string;
  heading: string;
  mono: string;
};

export const TYPOGRAPHY_BY_PRESET: Record<ThemePresetId, TypographyKeys> = {
  paper: { body: "newsreader", heading: "newsreader", mono: "ibm-plex-mono" },
  ink: { body: "newsreader", heading: "newsreader", mono: "ibm-plex-mono" },
  "catppuccin-latte": {
    body: "atkinson",
    heading: "space-grotesk",
    mono: "ibm-plex-mono",
  },
  "catppuccin-frappe": {
    body: "ibm-plex-sans",
    heading: "space-grotesk",
    mono: "ibm-plex-mono",
  },
  "catppuccin-macchiato": {
    body: "ibm-plex-sans",
    heading: "space-grotesk",
    mono: "ibm-plex-mono",
  },
  "catppuccin-mocha": {
    body: "ibm-plex-sans",
    heading: "space-grotesk",
    mono: "ibm-plex-mono",
  },
};

export function typographyForPreset(preset: ThemePresetId): TypographyKeys {
  return TYPOGRAPHY_BY_PRESET[preset] ?? TYPOGRAPHY_BY_PRESET.paper;
}

export function mergeTokens(
  preset: ThemePresetId,
  overrides: Partial<SemanticTokens> | null | undefined,
): SemanticTokens {
  const base = THEME_PRESETS[preset] ?? THEME_PRESETS.paper;
  if (!overrides) return { ...base };
  return { ...base, ...overrides };
}

export function tokensToCssVars(tokens: SemanticTokens): string {
  const entries: [keyof SemanticTokens, string][] = [
    ["bg", "--bb-bg"],
    ["surface", "--bb-surface"],
    ["surfaceSoft", "--bb-surface-soft"],
    ["surfaceElevated", "--bb-surface-elevated"],
    ["text", "--bb-text"],
    ["textMuted", "--bb-text-muted"],
    ["heading", "--bb-heading"],
    ["border", "--bb-border"],
    ["link", "--bb-link"],
    ["linkHover", "--bb-link-hover"],
    ["accent", "--bb-accent"],
    ["accentForeground", "--bb-accent-fg"],
    ["inputBg", "--bb-input-bg"],
    ["inputText", "--bb-input-text"],
    ["focusRing", "--bb-focus-ring"],
    ["success", "--bb-success"],
    ["warning", "--bb-warning"],
    ["danger", "--bb-danger"],
  ];
  return entries.map(([k, v]) => `${v}: ${tokens[k]};`).join("\n");
}
