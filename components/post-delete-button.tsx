"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useCurrentLocale } from "@/components/locale-provider";
import { t, tm } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type PostDeleteButtonProps = {
  postId: string;
  postTitle?: string | null;
  redirectTo?: string;
  label?: string;
  fullWidth?: boolean;
} & Pick<ButtonProps, "variant" | "size" | "className">;

function deleteConfirmMessage(
  locale: string,
  postTitle?: string | null,
) {
  const title = postTitle?.trim();
  return title
    ? tm(locale, "delete.confirmTitled", { title })
    : t(locale, "delete.confirmUntitled");
}

export function PostDeleteButton({
  postId,
  postTitle,
  redirectTo,
  label,
  fullWidth = false,
  variant = "outline",
  size = "sm",
  className,
}: PostDeleteButtonProps) {
  const router = useRouter();
  const locale = useCurrentLocale();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (deleting) return;
    if (!window.confirm(deleteConfirmMessage(locale, postTitle))) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error || "Delete failed");
      }

      toast.success(t(locale, "delete.success"));

      if (redirectTo) {
        router.replace(redirectTo);
        setTimeout(() => {
          router.refresh();
        }, 0);
        return;
      }

      router.refresh();
    } catch (e) {
      const message =
        e instanceof Error && e.message
          ? e.message
          : t(locale, "delete.error");
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={() => void handleDelete()}
      disabled={deleting}
      className={cn(
        fullWidth && "w-full justify-start",
        variant === "ghost" &&
          "text-[var(--bb-danger)] hover:bg-[var(--bb-surface-soft)] hover:text-[var(--bb-danger)]",
        variant === "outline" &&
          "text-[var(--bb-danger)] hover:bg-[var(--bb-surface-soft)] hover:text-[var(--bb-danger)]",
        className,
      )}
    >
      {deleting ? t(locale, "delete.deleting") : label ?? t(locale, "delete.button")}
    </Button>
  );
}
