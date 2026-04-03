import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppearanceForm } from "@/components/appearance-form";

export default async function AppearancePage() {
  const site = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });
  if (!site) redirect("/setup");
  return <AppearanceForm site={site} />;
}
