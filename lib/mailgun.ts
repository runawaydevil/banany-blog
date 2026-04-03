export type MailgunRegion = "us" | "eu";

export function mailgunBaseUrl(region: MailgunRegion | null | undefined): string {
  return region === "eu"
    ? "https://api.eu.mailgun.net"
    : "https://api.mailgun.net";
}

export async function sendMailgunEmail(opts: {
  apiKey: string;
  domain: string;
  region?: MailgunRegion | null;
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string | null;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const base = mailgunBaseUrl(opts.region);
  const url = `${base}/v3/${opts.domain}/messages`;
  const form = new FormData();
  form.append("from", opts.from);
  form.append("to", opts.to);
  form.append("subject", opts.subject);
  form.append("text", opts.text);
  if (opts.html) form.append("html", opts.html);
  if (opts.replyTo) form.append("h:Reply-To", opts.replyTo);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + Buffer.from(`api:${opts.apiKey}`).toString("base64"),
      },
      body: form,
    });
    const text = await res.text();
    if (!res.ok) {
      return { ok: false, message: text || res.statusText };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Mailgun request failed",
    };
  }
}

