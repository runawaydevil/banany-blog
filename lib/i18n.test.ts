import { describe, expect, it } from "vitest";
import { htmlLang, intlLocale, normalizeLocale, t } from "@/lib/i18n";

describe("locale helpers", () => {
  it("maps pt to pt-BR for Intl formatting and html lang", () => {
    expect(normalizeLocale("pt")).toBe("pt");
    expect(intlLocale("pt")).toBe("pt-BR");
    expect(htmlLang("pt")).toBe("pt-BR");
  });

  it("uses the pt catalog when locale is pt", () => {
    expect(t("pt", "appearance.title")).toBe("Aparência");
    expect(t("pt", "common.done")).toBe("Concluir");
  });

  it("falls back to English when a key is missing from the pt catalog", () => {
    expect(t("pt", "i18n.fallbackProbe")).toBe("English fallback");
  });

  it("falls back to English when the locale is unsupported", () => {
    expect(normalizeLocale("fr")).toBe("en");
    expect(intlLocale("fr")).toBe("en-US");
    expect(htmlLang("fr")).toBe("en");
    expect(t("fr", "appearance.title")).toBe("Appearance");
  });
});
