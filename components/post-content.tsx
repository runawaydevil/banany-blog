import { MarkdownContent } from "@/components/markdown-content";
import { normalizePostContentFormat } from "@/lib/excerpt-plain";
import { sanitizePostHtml } from "@/lib/sanitize-html";

type PostContentFormatLike =
  | "RICH_TEXT"
  | "MARKDOWN"
  | string
  | null
  | undefined;

export function PostContent({
  content,
  contentFormat,
  className,
}: {
  content: string;
  contentFormat: PostContentFormatLike;
  className?: string;
}) {
  const format = normalizePostContentFormat(contentFormat);

  if (format === "MARKDOWN") {
    return <MarkdownContent content={content} className={className} />;
  }

  return (
    <div
      className={["bb-content", className].filter(Boolean).join(" ")}
      dangerouslySetInnerHTML={{ __html: sanitizePostHtml(content) }}
    />
  );
}
