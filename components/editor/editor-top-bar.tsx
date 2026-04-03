"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  SaveStateIndicator,
  type SaveUiState,
} from "@/components/editor/save-state-indicator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function EditorTopBar({
  backHref,
  backLabel,
  saveState,
  savedAt,
  onOpenMetadata,
  showMetadataButton,
  onSave,
  saving,
  publishLabel,
  onPublish,
  extraActions,
}: {
  backHref: string;
  backLabel: string;
  saveState: SaveUiState;
  savedAt: Date | null;
  onOpenMetadata: () => void;
  showMetadataButton: boolean;
  onSave: () => void;
  saving: boolean;
  publishLabel: string;
  onPublish: () => void;
  extraActions?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--bb-border)]/35 bg-[var(--bb-bg)]/88 px-4 py-2.5 backdrop-blur-md">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Link
          href={backHref}
          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-[var(--bb-text-muted)] transition-colors hover:bg-[var(--bb-surface-soft)] hover:text-[var(--bb-text)]"
        >
          {backLabel}
        </Link>
        <SaveStateIndicator state={saveState} savedAt={savedAt} />
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:gap-2">
        {extraActions}
        {showMetadataButton ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-[var(--bb-text-muted)] lg:hidden"
            onClick={onOpenMetadata}
          >
            Details
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button
          type="button"
          size="sm"
          className="h-8 bg-[var(--bb-heading)] px-3 text-xs text-[var(--bb-bg)] hover:bg-[var(--bb-text)]"
          onClick={onPublish}
          disabled={saving}
        >
          {publishLabel}
        </Button>
      </div>
    </header>
  );
}

/** Secondary actions in a minimal popover (no heavy dropdown dependency). */
export function EditorMoreMenu({ children }: { children: ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-[var(--bb-text-muted)]"
        >
          More
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-2 text-sm">
        {children}
      </PopoverContent>
    </Popover>
  );
}
