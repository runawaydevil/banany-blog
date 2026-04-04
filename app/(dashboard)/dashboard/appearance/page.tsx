import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppearanceForm } from "@/components/appearance-form";
import { mediaUrlById } from "@/lib/media";

export default async function AppearancePage() {
  const site = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });
  if (!site) redirect("/setup");
  const [faviconUrl, logoUrl] = await Promise.all([
    mediaUrlById(site.faviconMediaId),
    mediaUrlById(site.logoMediaId),
  ]);
  return (
    <AppearanceForm
      site={site}
      faviconUrl={faviconUrl}
      logoUrl={logoUrl}
    />
  );
}
