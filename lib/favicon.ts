export function buildFaviconCacheBust(params: {
  updatedAt?: Date | string | number | null;
  faviconMediaId?: string | null;
}): string {
  const ts = params.updatedAt ? new Date(params.updatedAt).getTime() : 0;
  return params.faviconMediaId
    ? `${ts}-${params.faviconMediaId.slice(0, 12)}`
    : String(ts);
}

export function buildFaviconHref(bust: string): string {
  return `/icon?v=${encodeURIComponent(bust)}`;
}
