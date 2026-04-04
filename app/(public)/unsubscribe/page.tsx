import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let title = "Unsubscribe";
  let copy = "That unsubscribe link is invalid or has already been used.";

  if (token?.trim()) {
    const subscriber = await prisma.subscriber.findUnique({
      where: { unsubscribeToken: token.trim() },
    });

    if (subscriber) {
      if (!subscriber.unsubscribedAt) {
        await prisma.subscriber.update({
          where: { id: subscriber.id },
          data: { unsubscribedAt: new Date() },
        });
      }

      title = "You are unsubscribed";
      copy = `${subscriber.email} will not receive future Banany Blog newsletters unless subscribed again.`;
    }
  }

  return (
    <section className="mx-auto max-w-xl space-y-4">
      <h1 className="font-[family-name:var(--bb-font-heading)] text-3xl text-[var(--bb-heading)]">
        {title}
      </h1>
      <p className="text-sm leading-relaxed text-[var(--bb-text-muted)]">
        {copy}
      </p>
    </section>
  );
}
