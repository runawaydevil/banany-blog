"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PostDeleteButtonProps = {
  postId: string;
  postTitle?: string | null;
  redirectTo?: string;
  label?: string;
  fullWidth?: boolean;
} & Pick<ButtonProps, "variant" | "size" | "className">;

function deleteConfirmMessage(postTitle?: string | null) {
  const title = postTitle?.trim();
  return title
    ? `Delete "${title}"? This action cannot be undone.`
    : "Delete this post? This action cannot be undone.";
}

export function PostDeleteButton({
  postId,
  postTitle,
  redirectTo,
  label = "Delete",
  fullWidth = false,
  variant = "outline",
  size = "sm",
  className,
}: PostDeleteButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (deleting) return;
    if (!window.confirm(deleteConfirmMessage(postTitle))) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error || "Delete failed");
      }

      toast.success("Post deleted.");

      if (redirectTo) {
        router.replace(redirectTo);
        setTimeout(() => {
          router.refresh();
        }, 0);
        return;
      }

      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Delete failed";
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
      {deleting ? "Deleting..." : label}
    </Button>
  );
}
