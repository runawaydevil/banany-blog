import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";
import "@fontsource/newsreader/400.css";
import "@fontsource/newsreader/600.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/atkinson-hyperlegible-next/400.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-serif/400.css";
import "@fontsource/ibm-plex-mono/400.css";
import { getSiteSettings } from "@/lib/site";
import { getEffectivePublicOrigin } from "@/lib/public-origin";
import { buildFaviconCacheBust, buildFaviconHref } from "@/lib/favicon";
import { htmlLang, t } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  let site: Awaited<ReturnType<typeof getSiteSettings>> = null;
  try {
    site = await getSiteSettings();
  } catch {
    /* build/CI sem DATABASE_URL ou DB indisponível */
  }
  const bust = buildFaviconCacheBust({
    updatedAt: site?.updatedAt,
    faviconMediaId: site?.faviconMediaId,
  });
  const faviconHref = buildFaviconHref(bust);
  const title =
    site?.browserTitle?.trim() ||
    site?.siteTitle?.trim() ||
    "Banany Blog";
  const description =
    site?.seoDescription?.trim() ||
    t(site?.locale, "site.defaultDescription");

  let metadataBase: URL | undefined;
  try {
    const origin = getEffectivePublicOrigin(site);
    metadataBase = new URL(`${origin}/`);
  } catch {
    metadataBase = undefined;
  }

  return {
    metadataBase,
    title,
    description,
    icons: {
      icon: faviconHref,
      shortcut: faviconHref,
      apple: faviconHref,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let site: Awaited<ReturnType<typeof getSiteSettings>> = null;
  try {
    site = await getSiteSettings();
  } catch {
    site = null;
  }

  return (
    <html lang={htmlLang(site?.locale)} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Providers locale={site?.locale}>{children}</Providers>
      </body>
    </html>
  );
}
