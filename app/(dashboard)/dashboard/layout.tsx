import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  getSiteSettings,
  resolveThemeForSite,
  resolveTypographyForSite,
} from "@/lib/site";
import { mediaUrlById, runMediaRolloutCleanupOnce } from "@/lib/media";
import { ThemeInject } from "@/components/theme-inject";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardToaster } from "@/components/dashboard-toaster";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    const h = await headers();
    const callbackPath =
      h.get("x-bb-callback-path") ?? "/dashboard";
    redirect(
      `/login?callbackUrl=${encodeURIComponent(callbackPath)}`,
    );
  }

  const site = await getSiteSettings();
  if (!site?.setupComplete) {
    redirect("/setup");
  }

  await runMediaRolloutCleanupOnce();

  const tokens = resolveThemeForSite(site);
  const typo = resolveTypographyForSite(site);
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
      <div className="min-h-screen bg-[var(--bb-bg)]">
        <DashboardToaster />
        <DashboardHeader site={site} logoUrl={logoUrl} />
        <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
      </div>
    </>
  );
}
