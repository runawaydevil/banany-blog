import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteSettings, resolveThemeForSite, resolveTypographyForSite } from "@/lib/site";
import { ThemeInject } from "@/components/theme-inject";
import { PublicChrome } from "@/components/public-chrome";
import { mediaUrlById } from "@/lib/media";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getSiteSettings();
  if (!site?.setupComplete) {
    redirect("/setup");
  }

  const tokens = resolveThemeForSite(site);
  const typo = resolveTypographyForSite(site);
  const nav = await prisma.navItem.findMany({ orderBy: { order: "asc" } });
  const logoUrl = await mediaUrlById(site.logoMediaId);

  return (
    <>
      <ThemeInject
        tokens={tokens}
        fontBodyKey={typo.body}
        fontHeadingKey={typo.heading}
        fontMonoKey={typo.mono}
        customCss={site.customCss}
      />
      <PublicChrome site={site} nav={nav} logoUrl={logoUrl}>
        {children}
      </PublicChrome>
    </>
  );
}
