"use client";

import { useCurrentLocale } from "@/components/locale-provider";
import { intlLocale, tm, t } from "@/lib/i18n";

export type SaveUiState = "saved" | "saving" | "unsaved" | "idle";

export function SaveStateIndicator({
  state,
  savedAt,
}: {
  state: SaveUiState;
  savedAt: Date | null;
}) {
  const locale = useCurrentLocale();
  if (state === "saving") {
    return (
      <span className="text-xs tabular-nums text-[var(--bb-text-muted)]">
        {t(locale, "editor.saving")}
      </span>
    );
  }
  if (state === "unsaved") {
    return (
      <span className="text-xs text-[var(--bb-warning)]">
        {t(locale, "editor.unsavedChanges")}
      </span>
    );
  }
  if (state === "saved" && savedAt) {
    return (
      <span
        className="text-xs tabular-nums text-[var(--bb-text-muted)]"
        title={savedAt.toLocaleString(intlLocale(locale))}
      >
        {tm(locale, "editor.savedAt", {
          time: savedAt.toLocaleTimeString(intlLocale(locale), {
            timeStyle: "short",
          }),
        })}
      </span>
    );
  }
  return (
    <span className="text-xs text-[var(--bb-text-muted)]">
      {t(locale, "editor.draft")}
    </span>
  );
}
