import { TripDraft } from "./types";

const vndFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
});

/**
 * Formats integer VND amount in standard Vietnamese locale, e.g. "1.450.000 ₫"
 */
export function formatVND(amount: number): string {
  return vndFormatter.format(Math.round(amount));
}

/**
 * Formats compact VND for tight mobile badges/axes, e.g. "2,45 tr ₫" or "850k ₫"
 */
export function formatCompactVND(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded >= 1_000_000) {
    const millions = rounded / 1_000_000;
    const formatted = millions
      .toFixed(millions >= 10 ? 1 : 2)
      .replace(/\.?0+$/, "")
      .replace(".", ",");
    return `${formatted} tr ₫`;
  }
  if (rounded >= 1_000) {
    return `${Math.round(rounded / 1_000)}k ₫`;
  }
  return `${numberFormatter.format(rounded)} ₫`;
}

export function formatNumberVN(amount: number): string {
  return numberFormatter.format(Math.round(amount));
}

/**
 * Parses YYYY-MM-DD strictly in local calendar terms without UTC timezone drift
 */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0, 0);
}

/**
 * Converts a Date to YYYY-MM-DD
 */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Formats YYYY-MM-DD as dd/MM/yyyy (vi-VN standard)
 */
export function formatDateVN(iso: string): string {
  if (!iso || !iso.includes("-")) return iso;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/**
 * Formats ISO timestamp as HH:mm dd/MM/yyyy
 */
export function formatDateTimeVN(isoTimestamp: string): string {
  const d = new Date(isoTimestamp);
  if (Number.isNaN(d.getTime())) return isoTimestamp;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${hh}:${mm} ${day}/${month}/${year}`;
}

/**
 * Adds `days` to a YYYY-MM-DD string and returns YYYY-MM-DD
 */
export function addDaysISO(iso: string, offsetDays: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + offsetDays);
  return toISODate(d);
}

/**
 * Computes nights and days from startDate and endDate (YYYY-MM-DD).
 * Enforces minimum 1 night if dates are equal/invalid in pure math helpers,
 * while UI validation explicitly flags endDate <= startDate.
 */
export function computeTripDuration(
  startDate: string,
  endDate: string
): { nights: number; days: number; isValid: boolean } {
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);
  const rawDiff = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  if (rawDiff <= 0) {
    return { nights: 1, days: 2, isValid: false };
  }
  return {
    nights: rawDiff,
    days: rawDiff + 1,
    isValid: true,
  };
}

/**
 * Returns every YYYY-MM-DD date in [startDate, endDate] inclusive
 */
export function listDatesInclusive(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);
  if (end < start) return [startDate];
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(toISODate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

/**
 * Encodes a TripDraft into a compact URL-safe base64 string for sharing
 */
export function encodeTripShareParam(draft: TripDraft): string {
  try {
    const json = JSON.stringify(draft);
    if (typeof window !== "undefined") {
      return btoa(encodeURIComponent(json));
    }
    return Buffer.from(encodeURIComponent(json), "utf-8").toString("base64");
  } catch {
    return "";
  }
}

export function decodeTripShareParam(encoded: string): Partial<TripDraft> | null {
  try {
    const decodedUri =
      typeof window !== "undefined"
        ? atob(encoded)
        : Buffer.from(encoded, "base64").toString("utf-8");
    const parsed = JSON.parse(decodeURIComponent(decodedUri));
    if (parsed && typeof parsed === "object" && parsed.destinationId) {
      return parsed as Partial<TripDraft>;
    }
    return null;
  } catch {
    return null;
  }
}
