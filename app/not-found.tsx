import Link from "next/link";
import {
  getSiteSettings,
  resolveThemeForSite,
  resolveTypographyForSite,
} from "@/lib/site";
import { ThemeInject } from "@/components/theme-inject";
import { mergeTokens, typographyForPreset } from "@/lib/themes";

export default async function NotFound() {
  let site: Awaited<ReturnType<typeof getSiteSettings>> = null;
  try {
    site = await getSiteSettings();
  } catch {
    /* DB unavailable or missing in build */
  }

  const themed = site?.setupComplete === true;
  const tokens = themed
    ? resolveThemeForSite(site)
    : mergeTokens("paper", undefined);
  const typo = themed
    ? resolveTypographyForSite(site)
    : typographyForPreset("paper");
  const customCss = themed ? site.customCss : null;

  return (
    <>
      <ThemeInject
        tokens={tokens}
        fontBodyKey={typo.body}
        fontHeadingKey={typo.heading}
        fontMonoKey={typo.mono}
        customCss={customCss}
      />
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bb-bg)] px-4 py-16">
        <h1 className="text-center font-[family-name:var(--bb-font-heading)] text-2xl text-[var(--bb-heading)]">
          Page not found
        </h1>
        <p className="mt-3 max-w-md text-center text-sm text-[var(--bb-text-muted)]">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-9 items-center justify-center rounded-md bg-[var(--bb-accent)] px-4 text-sm font-medium text-[var(--bb-accent-fg)] transition-opacity hover:opacity-90"
        >
          Back to home
        </Link>
      </div>
    </>
  );
}
