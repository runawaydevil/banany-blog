"use client";

import { Label } from "@/components/ui/label";

export function PageMetadataPanel({
  published,
  onPublishedChange,
}: {
  published: boolean;
  onPublishedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <input
        id="pub-page"
        type="checkbox"
        checked={published}
        onChange={(e) => onPublishedChange(e.target.checked)}
        className="rounded border-[var(--bb-border)]"
      />
      <Label htmlFor="pub-page" className="font-normal text-[var(--bb-text)]">
        Published
      </Label>
    </div>
  );
}
