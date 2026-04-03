import { prisma } from "@/lib/prisma";
import { resolveThemeForSite, resolveTypographyForSite } from "@/lib/site";
import { THEME_PRESETS, typographyForPreset } from "@/lib/themes";
import { ThemeInject } from "@/components/theme-inject";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const row = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });
  const tokens = row ? resolveThemeForSite(row) : THEME_PRESETS.paper;
  const typo = row ? resolveTypographyForSite(row) : typographyForPreset("paper");

  return (
    <>
      <ThemeInject
        tokens={tokens}
        fontBodyKey={typo.body}
        fontHeadingKey={typo.heading}
        fontMonoKey={typo.mono}
        customCss={row?.customCss}
      />
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </>
  );
}
