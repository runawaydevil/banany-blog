import { prisma } from "@/lib/prisma";
import type { SiteSettings } from "@prisma/client";
import {
  isThemePresetId,
  mergeTokens,
  typographyForPreset,
  type SemanticTokens,
  type ThemePresetId,
  type TypographyKeys,
} from "@/lib/themes";

const SINGLETON_ID = "singleton";

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return prisma.siteSettings.findUnique({ where: { id: SINGLETON_ID } });
}

export async function requireSiteSettings(): Promise<SiteSettings> {
  const s = await getSiteSettings();
  if (!s) throw new Error("Site not initialized");
  return s;
}

export function resolveThemeForSite(site: SiteSettings): SemanticTokens {
  const preset: ThemePresetId = isThemePresetId(site.themePreset)
    ? site.themePreset
    : "paper";
  const raw = site.themeOverrides as unknown as Partial<SemanticTokens> | null;
  return mergeTokens(preset, raw ?? undefined);
}

/** Typography from theme preset only (ignores legacy font*Key in DB for rendering). */
export function resolveTypographyForSite(site: SiteSettings): TypographyKeys {
  const preset: ThemePresetId = isThemePresetId(site.themePreset)
    ? site.themePreset
    : "paper";
  return typographyForPreset(preset);
}

export function siteNeedsSetup(site: SiteSettings | null): boolean {
  return !site?.setupComplete;
}
