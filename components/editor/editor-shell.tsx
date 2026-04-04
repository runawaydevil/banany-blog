"use client";

import type { ReactNode } from "react";
import { useCurrentLocale } from "@/components/locale-provider";
import { t } from "@/lib/i18n";

/**
 * Writing-first layout: top bar + scrollable canvas + optional desktop metadata column.
 */
export function EditorShell({
  topBar,
  canvas,
  metadataPanel,
  metadataMobileOpen,
  onMetadataMobileClose,
}: {
  topBar: ReactNode;
  canvas: ReactNode;
  metadataPanel: ReactNode;
  metadataMobileOpen: boolean;
  onMetadataMobileClose: () => void;
}) {
  const locale = useCurrentLocale();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {topBar}
      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[42rem] px-5 py-10 sm:px-6 sm:py-14">
            {canvas}
          </div>
        </div>
        <aside className="hidden w-[min(20rem,28vw)] shrink-0 overflow-y-auto border-l border-[var(--bb-border)]/50 bg-[var(--bb-bg)] lg:block">
          <div className="sticky top-0 space-y-6 p-5 text-sm">
            <h2 className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-[var(--bb-text-muted)]">
              {t(locale, "editor.details")}
            </h2>
            {metadataPanel}
          </div>
        </aside>
      </div>

      {metadataMobileOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px] lg:hidden"
            aria-label={t(locale, "editor.details")}
            onClick={onMetadataMobileClose}
          />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[var(--bb-border)] bg-[var(--bb-surface)] shadow-xl lg:hidden">
            <div className="flex items-center justify-between border-b border-[var(--bb-border)]/80 px-4 py-3">
              <h2 className="text-sm font-medium text-[var(--bb-heading)]">
                {t(locale, "editor.details")}
              </h2>
              <button
                type="button"
                className="rounded-md px-3 py-1.5 text-sm text-[var(--bb-link)] hover:bg-[var(--bb-surface-soft)]"
                onClick={onMetadataMobileClose}
              >
                {t(locale, "common.done")}
              </button>
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto p-4 text-sm">
              {metadataPanel}
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
