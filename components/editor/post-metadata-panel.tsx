"use client";

import type { PostType } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentLocale } from "@/components/locale-provider";
import { t } from "@/lib/i18n";

const TYPES: PostType[] = [
  "POST",
  "NOTE",
  "PHOTO",
  "LINK",
  "QUOTE",
  "REPLY",
];

export function PostMetadataPanel({
  type,
  onTypeChange,
  tags,
  onTagsChange,
  linkUrl,
  onLinkUrlChange,
  scheduledAt,
  onScheduledAtChange,
  scheduledAtMin,
  published,
  onPublishedChange,
  pinned,
  onPinnedChange,
}: {
  type: PostType;
  onTypeChange: (t: PostType) => void;
  tags: string;
  onTagsChange: (v: string) => void;
  linkUrl: string;
  onLinkUrlChange: (v: string) => void;
  scheduledAt: string;
  onScheduledAtChange: (v: string) => void;
  scheduledAtMin?: string;
  published: boolean;
  onPublishedChange: (v: boolean) => void;
  pinned: boolean;
  onPinnedChange: (v: boolean) => void;
}) {
  const locale = useCurrentLocale();

  return (
    <>
      <div className="space-y-1.5">
        <Label className="text-[var(--bb-text-muted)]">
          {t(locale, "editor.type")}
        </Label>
        <select
          className="flex h-9 w-full rounded-md border border-[var(--bb-border)]/80 bg-[var(--bb-input-bg)] px-2 text-[var(--bb-input-text)]"
          value={type}
          onChange={(e) => onTypeChange(e.target.value as PostType)}
        >
          {TYPES.map((value) => (
            <option key={value} value={value}>
              {t(locale, `postType.${value.toLowerCase()}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-[var(--bb-text-muted)]">
          {t(locale, "editor.tags")}
        </Label>
        <Input
          value={tags}
          onChange={(e) => onTagsChange(e.target.value)}
          placeholder={t(locale, "editor.tagsPlaceholder")}
          className="border-[var(--bb-border)]/80"
        />
      </div>
      {type === "LINK" ? (
        <div className="space-y-1.5">
          <Label className="text-[var(--bb-text-muted)]">
            {t(locale, "editor.linkUrl")}
          </Label>
          <Input
            value={linkUrl}
            onChange={(e) => onLinkUrlChange(e.target.value)}
            placeholder="https://"
            className="border-[var(--bb-border)]/80"
          />
        </div>
      ) : null}
      <div className="space-y-1.5">
        <Label className="text-[var(--bb-text-muted)]">
          {t(locale, "editor.schedule")}
        </Label>
        <Input
          type="datetime-local"
          value={scheduledAt}
          min={scheduledAtMin}
          onChange={(e) => onScheduledAtChange(e.target.value)}
          className="border-[var(--bb-border)]/80"
        />
      </div>
      <div className="flex items-center gap-2 pt-1">
        <input
          id="pub-post"
          type="checkbox"
          checked={published}
          onChange={(e) => onPublishedChange(e.target.checked)}
          className="rounded border-[var(--bb-border)]"
        />
        <Label htmlFor="pub-post" className="font-normal text-[var(--bb-text)]">
          {t(locale, "editor.published")}
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="pin-post"
          type="checkbox"
          checked={pinned}
          onChange={(e) => onPinnedChange(e.target.checked)}
          className="rounded border-[var(--bb-border)]"
        />
        <Label htmlFor="pin-post" className="font-normal text-[var(--bb-text)]">
          {t(locale, "editor.pinned")}
        </Label>
      </div>
    </>
  );
}
