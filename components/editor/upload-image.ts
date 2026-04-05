"use client";

export async function pickAndUploadImage(): Promise<{
  url: string;
  fileName: string;
} | null> {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  const file = await new Promise<File | null>((resolve) => {
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.click();
  });

  if (!file) return null;

  const fd = new FormData();
  fd.append("file", file);
  fd.append("prefix", "uploads");

  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) return null;

  const data = (await res.json()) as { url: string };
  return {
    url: data.url,
    fileName: file.name,
  };
}
