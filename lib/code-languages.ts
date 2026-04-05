import hljs from "highlight.js/lib/core";
import type { LanguageFn } from "highlight.js";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import diff from "highlight.js/lib/languages/diff";
import go from "highlight.js/lib/languages/go";
import html from "highlight.js/lib/languages/xml";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import plaintext from "highlight.js/lib/languages/plaintext";
import python from "highlight.js/lib/languages/python";
import ruby from "highlight.js/lib/languages/ruby";
import rust from "highlight.js/lib/languages/rust";
import scss from "highlight.js/lib/languages/scss";
import sql from "highlight.js/lib/languages/sql";
import toml from "highlight.js/lib/languages/ini";
import typescript from "highlight.js/lib/languages/typescript";
import yaml from "highlight.js/lib/languages/yaml";
import { createLowlight } from "lowlight";

type LanguageRegistration = LanguageFn;

export const CODE_LANGUAGE_OPTIONS = [
  { value: "plaintext", label: "Plain text" },
  { value: "bash", label: "Bash" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "jsx", label: "JSX" },
  { value: "tsx", label: "TSX" },
  { value: "json", label: "JSON" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "markdown", label: "Markdown" },
  { value: "yaml", label: "YAML" },
  { value: "toml", label: "TOML" },
  { value: "sql", label: "SQL" },
  { value: "diff", label: "Diff" },
  { value: "python", label: "Python" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
] as const;

export type SupportedCodeLanguage = (typeof CODE_LANGUAGE_OPTIONS)[number]["value"];

export const DEFAULT_CODE_LANGUAGE: SupportedCodeLanguage = "plaintext";

const LANGUAGE_REGISTRATIONS: Record<SupportedCodeLanguage, LanguageRegistration> = {
  plaintext,
  bash,
  javascript,
  typescript,
  jsx: javascript,
  tsx: typescript,
  json,
  html,
  css,
  scss,
  markdown,
  yaml,
  toml,
  sql,
  diff,
  python,
  ruby,
  go,
  rust,
};

export const lowlight = createLowlight();

for (const [language, registration] of Object.entries(
  LANGUAGE_REGISTRATIONS,
) as Array<[SupportedCodeLanguage, LanguageRegistration]>) {
  hljs.registerLanguage(language, registration);
  lowlight.register(language, registration);
}

export function normalizeCodeLanguage(
  language: string | null | undefined,
): SupportedCodeLanguage {
  if (!language) return DEFAULT_CODE_LANGUAGE;
  const normalized = language.toLowerCase();
  const exists = CODE_LANGUAGE_OPTIONS.some(
    (option) => option.value === normalized,
  );
  return exists
    ? (normalized as SupportedCodeLanguage)
    : DEFAULT_CODE_LANGUAGE;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function highlightCodeToHtml(
  source: string,
  language: string | null | undefined,
): { html: string; language: SupportedCodeLanguage } {
  const normalizedLanguage = normalizeCodeLanguage(language);
  if (normalizedLanguage === "plaintext") {
    return {
      html: escapeHtml(source),
      language: normalizedLanguage,
    };
  }

  return {
    html: hljs.highlight(source, {
      language: normalizedLanguage,
      ignoreIllegals: true,
    }).value,
    language: normalizedLanguage,
  };
}
