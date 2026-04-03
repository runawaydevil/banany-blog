"use client";

export type SaveUiState = "saved" | "saving" | "unsaved" | "idle";

export function SaveStateIndicator({
  state,
  savedAt,
}: {
  state: SaveUiState;
  savedAt: Date | null;
}) {
  if (state === "saving") {
    return (
      <span className="text-xs tabular-nums text-[var(--bb-text-muted)]">
        Saving…
      </span>
    );
  }
  if (state === "unsaved") {
    return (
      <span className="text-xs text-[var(--bb-warning)]">Unsaved changes</span>
    );
  }
  if (state === "saved" && savedAt) {
    return (
      <span
        className="text-xs tabular-nums text-[var(--bb-text-muted)]"
        title={savedAt.toLocaleString()}
      >
        Saved {savedAt.toLocaleTimeString([], { timeStyle: "short" })}
      </span>
    );
  }
  return (
    <span className="text-xs text-[var(--bb-text-muted)]">Draft</span>
  );
}
