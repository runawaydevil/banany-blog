/**
 * Safe date parsing for DB/JSON values. Prevents archive and list crashes.
 */
export function toValidDate(value: unknown): Date | null {
  if (value == null) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "object" && value !== null && "toISOString" in value) {
    try {
      const d = new Date((value as { toISOString: () => string }).toISOString());
      return Number.isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  }
  return null;
}

export function toISOStringSafe(value: unknown): string | null {
  const d = toValidDate(value);
  return d ? d.toISOString() : null;
}

/** Calendar year in UTC (legacy / explicit UTC grouping). */
export function getYearSafe(value: unknown): number | null {
  const d = toValidDate(value);
  return d ? d.getUTCFullYear() : null;
}

export function getDefaultTimeZone(): string {
  const tz = process.env.TZ?.trim();
  return tz && tz.length > 0 ? tz : "UTC";
}

export function getCalendarYearInTimeZone(date: Date, timeZone: string): number {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
    }).formatToParts(date);
    const y = parts.find((p) => p.type === "year")?.value;
    if (y) return parseInt(y, 10);
  } catch {
    /* invalid TZ */
  }
  return date.getUTCFullYear();
}

/** Group/list headings: same calendar year as `toLocaleDateString` under `TZ`. */
export function getYearSafeInDefaultTz(value: unknown): number | null {
  const d = toValidDate(value);
  if (!d) return null;
  return getCalendarYearInTimeZone(d, getDefaultTimeZone());
}
