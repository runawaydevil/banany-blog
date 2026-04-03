import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/settings-form";
import {
  getTrustedAppUrl,
  normalizePublicOrigin,
} from "@/lib/public-origin";

export default async function SettingsPage() {
  const [site, navItems, pages] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    prisma.navItem.findMany({ orderBy: { order: "asc" } }),
    prisma.page.findMany({
      select: { slug: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);
  if (!site) redirect("/setup");

  const trustedPublicUrl = getTrustedAppUrl();
  let publicUrlEnvMismatch = false;
  if (trustedPublicUrl) {
    try {
      publicUrlEnvMismatch =
        normalizePublicOrigin(site.publicUrl) !== trustedPublicUrl;
    } catch {
      publicUrlEnvMismatch = true;
    }
  }

  return (
    <SettingsForm
      site={site}
      navItems={navItems}
      pages={pages}
      trustedPublicUrl={trustedPublicUrl}
      publicUrlEnvMismatch={publicUrlEnvMismatch}
      isProduction={process.env.NODE_ENV === "production"}
    />
  );
}
