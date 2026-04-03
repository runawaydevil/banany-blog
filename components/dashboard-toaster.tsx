"use client";

import { Toaster } from "sonner";

export function DashboardToaster() {
  return (
    <Toaster
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        className:
          "border-[var(--bb-border)] bg-[var(--bb-surface)] text-[var(--bb-text)]",
      }}
    />
  );
}
