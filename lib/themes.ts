export const THEME_PRESET_IDS = [
  "paper",
  "ink",
  "terracotta-dawn",
  "fjord-night",
  "matcha-milk",
  "laser-grid",
  "catppuccin-latte",
  "catppuccin-frappe",
  "catppuccin-macchiato",
  "catppuccin-mocha",
] as const;

export type ThemePresetId = (typeof THEME_PRESET_IDS)[number];

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
  "terracotta-dawn": {
    bg: "#fff7f1",
    surface: "#fffdf9",
    surfaceSoft: "#f7e7dc",
    surfaceElevated: "#fffaf5",
    text: "#392b25",
    textMuted: "#7a6258",
    heading: "#241815",
    border: "#e8cfc0",
    link: "#9a4f38",
    linkHover: "#6f3524",
    accent: "#d97757",
    accentForeground: "#fff7f1",
    inputBg: "#fffdf9",
    inputText: "#392b25",
    focusRing: "#d97757",
    success: "#4f8a5b",
    warning: "#d49b2d",
    danger: "#b34a3c",
  },
  "fjord-night": {
    bg: "#0f1a24",
    surface: "#142230",
    surfaceSoft: "#10202c",
    surfaceElevated: "#1b2d3f",
    text: "#dce8f2",
    textMuted: "#93a7b7",
    heading: "#f3f8fb",
    border: "#294152",
    link: "#77c3ff",
    linkHover: "#a6dbff",
    accent: "#2aa198",
    accentForeground: "#0f1a24",
    inputBg: "#142230",
    inputText: "#dce8f2",
    focusRing: "#2aa198",
    success: "#68c28a",
    warning: "#f3b562",
    danger: "#ef7d7d",
  },
  "matcha-milk": {
    bg: "#f6f6ee",
    surface: "#fffef8",
    surfaceSoft: "#ecebdc",
    surfaceElevated: "#faf8f0",
    text: "#283127",
    textMuted: "#667062",
    heading: "#172016",
    border: "#d8dcc8",
    link: "#4f6b39",
    linkHover: "#395027",
    accent: "#90b36b",
    accentForeground: "#172016",
    inputBg: "#fffef8",
    inputText: "#283127",
    focusRing: "#90b36b",
    success: "#4d8755",
    warning: "#c08b2c",
    danger: "#b05353",
  },
  "laser-grid": {
    bg: "#0a0f14",
    surface: "#101720",
    surfaceSoft: "#0d141c",
    surfaceElevated: "#18222e",
    text: "#d8e6f2",
    textMuted: "#7e95a6",
    heading: "#f7fbff",
    border: "#253646",
    link: "#4cc9f0",
    linkHover: "#90f7ff",
    accent: "#b8ff5a",
    accentForeground: "#0a0f14",
    inputBg: "#101720",
    inputText: "#d8e6f2",
    focusRing: "#b8ff5a",
    success: "#5fe1a3",
    warning: "#ffc857",
    danger: "#ff6b6b",
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
    link: "#8839ef",
    linkHover: "#7287fd",
    accent: "#179299",
    accentForeground: "#eff1f5",
    inputBg: "#e6e9ef",
    inputText: "#4c4f69",
    focusRing: "#179299",
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
    link: "#ca9ee6",
    linkHover: "#babbf1",
    accent: "#85c1dc",
    accentForeground: "#303446",
    inputBg: "#292c3c",
    inputText: "#c6d0f5",
    focusRing: "#85c1dc",
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
    link: "#8bd5ca",
    linkHover: "#91d7e3",
    accent: "#f5a97f",
    accentForeground: "#24273a",
    inputBg: "#1e2030",
    inputText: "#cad3f5",
    focusRing: "#f5a97f",
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
    border: "#585b70",
    link: "#89b4fa",
    linkHover: "#b4befe",
    accent: "#f5c2e7",
    accentForeground: "#1e1e2e",
    inputBg: "#181825",
    inputText: "#cdd6f4",
    focusRing: "#f5c2e7",
    success: "#a6e3a1",
    warning: "#f9e2af",
    danger: "#f38ba8",
  },
};

export const PRESET_LABELS: Record<ThemePresetId, string> = {
  paper: "Paper",
  ink: "Ink",
  "terracotta-dawn": "Terracotta Dawn",
  "fjord-night": "Fjord Night",
  "matcha-milk": "Matcha Milk",
  "laser-grid": "Laser Grid",
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
  "terracotta-dawn": {
    body: "ibm-plex-serif",
    heading: "space-grotesk",
    mono: "ibm-plex-mono",
  },
  "fjord-night": {
    body: "ibm-plex-sans",
    heading: "ibm-plex-serif",
    mono: "ibm-plex-mono",
  },
  "matcha-milk": {
    body: "atkinson",
    heading: "newsreader",
    mono: "ibm-plex-mono",
  },
  "laser-grid": {
    body: "ibm-plex-sans",
    heading: "space-grotesk",
    mono: "ibm-plex-mono",
  },
  "catppuccin-latte": {
    body: "atkinson",
    heading: "space-grotesk",
    mono: "ibm-plex-mono",
  },
  "catppuccin-frappe": {
    body: "atkinson",
    heading: "ibm-plex-sans",
    mono: "ibm-plex-mono",
  },
  "catppuccin-macchiato": {
    body: "ibm-plex-serif",
    heading: "newsreader",
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
