import { tokensToCssVars } from "@/lib/themes";
import type { SemanticTokens } from "@/lib/themes";
import { fontStackForKey } from "@/lib/fonts-registry";

export function ThemeInject({
  tokens,
  fontBodyKey,
  fontHeadingKey,
  fontMonoKey,
  customCss,
}: {
  tokens: SemanticTokens;
  fontBodyKey: string;
  fontHeadingKey: string;
  fontMonoKey: string;
  customCss: string | null | undefined;
}) {
  const base = tokensToCssVars(tokens);
  const fb = fontStackForKey(fontBodyKey);
  const fh = fontStackForKey(fontHeadingKey);
  const fm = fontStackForKey(fontMonoKey);
  const css = `:root{${base};--bb-font-body:${fb};--bb-font-heading:${fh};--bb-font-mono:${fm};}`;
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {customCss ? (
        <style
          dangerouslySetInnerHTML={{
            __html: `/* custom */\n${customCss.slice(0, 120_000)}`,
          }}
        />
      ) : null}
    </>
  );
}
