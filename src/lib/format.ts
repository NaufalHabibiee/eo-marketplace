import { BUDGET_RANGES } from "./constants";

export function initials(name: string): string {
  const words = name
    .replace(/^(pt|cv)\.?\s+/i, "")
    .split(/[\s\-&]+/)
    .filter((w) => /[a-z0-9]/i.test(w));
  const letters = words.slice(0, 2).map((w) => w.replace(/[^a-z0-9]/gi, "")[0] ?? "");
  return letters.join("").toUpperCase() || "EO";
}

export function formatRating(rating: number | null): string {
  if (rating == null) return "–";
  return Number(rating).toFixed(1).replace(".", ",");
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("id-ID").format(n);
}

export function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }).format(
    new Date(iso),
  );
}

export function budgetLabel(value: string): string {
  return BUDGET_RANGES.find((b) => b.value === value)?.label ?? value;
}

/** Indonesian mobile numbers (08xx / 628xx) can receive WhatsApp; landlines (021...) cannot. */
export function whatsappNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  if (!digits.startsWith("628")) return null;
  return digits.length >= 10 && digits.length <= 15 ? digits : null;
}

export function whatsappLink(phone: string | null | undefined, message?: string): string | null {
  const number = whatsappNumber(phone);
  if (!number) return null;
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function telLink(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/g, "");
}

export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

export function safeExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}
