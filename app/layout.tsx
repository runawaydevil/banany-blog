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

export async function generateMetadata(): Promise<Metadata> {
  let site: Awaited<ReturnType<typeof getSiteSettings>> = null;
  try {
    site = await getSiteSettings();
  } catch {
    /* build/CI sem DATABASE_URL ou DB indisponível */
  }
  const ts = site?.updatedAt ? site.updatedAt.getTime() : 0;
  const bust = site?.faviconMediaId
    ? `${ts}-${site.faviconMediaId.slice(0, 12)}`
    : String(ts);
  const q = encodeURIComponent(bust);
  const title =
    site?.browserTitle?.trim() ||
    site?.siteTitle?.trim() ||
    "Banany Blog";
  const description =
    site?.seoDescription?.trim() ||
    "A self-hosted small-web publishing engine";

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
      icon: `/icon?v=${q}`,
      apple: `/icon?v=${q}`,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
