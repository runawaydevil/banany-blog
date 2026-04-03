import type { MailgunRegion } from "@/lib/mailgun";

export type MailgunEnvConfig = {
  apiKey: string;
  domain: string;
  from: string;
  replyTo: string | null;
  region: MailgunRegion;
};

function parseRegion(raw: string | undefined): MailgunRegion {
  const r = raw?.trim().toLowerCase();
  return r === "eu" ? "eu" : "us";
}

export function getMailgunConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): MailgunEnvConfig | null {
  const apiKey = env.MAILGUN_API_KEY?.trim();
  const domain = env.MAILGUN_DOMAIN?.trim();
  const from = env.MAILGUN_FROM?.trim();
  if (!apiKey || !domain || !from) return null;
  const replyTo = env.MAILGUN_REPLY_TO?.trim() || null;
  return {
    apiKey,
    domain,
    from,
    replyTo,
    region: parseRegion(env.MAILGUN_REGION),
  };
}

export function mailgunConfiguredFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return getMailgunConfigFromEnv(env) !== null;
}
