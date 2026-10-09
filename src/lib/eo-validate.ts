import { EVENT_TYPE_VALUES } from "./constants";
import { slugify } from "./format";

export type EOInput = {
  company_name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  google_maps_url: string | null;
  year_established: number | null;
  event_types: string[];
  services: string[];
  capacity: number | null;
  min_budget: number | null;
  portfolio_images: string[];
  rating: number | null;
  review_count: number;
  total_events: number | null;
  verified: boolean;
  status: "active" | "inactive";
};

export const CSV_COLUMNS = [
  "company_name",
  "slug",
  "logo",
  "description",
  "city",
  "province",
  "phone",
  "email",
  "website",
  "year_established",
  "event_types",
  "services",
  "capacity",
  "portfolio_images",
  "rating",
  "total_events",
  "verified",
  "status",
  "address",
  "review_count",
  "instagram",
  "google_maps_url",
  "min_budget",
] as const;

type Raw = Record<string, unknown>;

const text = (raw: Raw, key: string, max: number): string | null => {
  const v = raw[key];
  if (v == null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
};

const list = (raw: Raw, key: string): string[] => {
  const v = raw[key];
  const parts = Array.isArray(v) ? v.map(String) : String(v ?? "").split(/[|;\n]/);
  return [...new Set(parts.map((s) => s.trim()).filter(Boolean))];
};

function url(value: string | null): string | null | "invalid" {
  if (!value) return null;
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : "invalid";
  } catch {
    return "invalid";
  }
}

function int(raw: Raw, key: string, label: string, min: number, max: number, errors: string[]): number | null {
  const s = text(raw, key, 30);
  if (!s) return null;
  const n = Number(s.replace(/[.\s]/g, "").replace(",", "."));
  if (!Number.isInteger(n) || n < min || n > max) {
    errors.push(`${label} harus angka bulat ${min}–${max}`);
    return null;
  }
  return n;
}

function bool(value: unknown): boolean {
  return ["true", "1", "yes", "ya", "on", "verified"].includes(String(value ?? "").trim().toLowerCase());
}

/** Turns a form submission or CSV row into a validated EO record. */
export function normalizeEO(raw: Raw): { data: EOInput | null; errors: string[] } {
  const errors: string[] = [];
  const company_name = text(raw, "company_name", 200);
  if (!company_name || company_name.length < 2) errors.push("Nama perusahaan wajib diisi");

  const slug = slugify(text(raw, "slug", 120) ?? company_name ?? "");
  if (!slug) errors.push("Slug tidak valid");

  const email = text(raw, "email", 200);
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push("Format email tidak valid");

  const urlFields = { logo: "Logo", website: "Website", instagram: "Instagram", google_maps_url: "Link Google Maps" } as const;
  const urls: Record<keyof typeof urlFields, string | null> = { logo: null, website: null, instagram: null, google_maps_url: null };
  for (const [key, label] of Object.entries(urlFields) as [keyof typeof urlFields, string][]) {
    const u = url(text(raw, key, 500));
    if (u === "invalid") errors.push(`${label} harus berupa URL`);
    else urls[key] = u;
  }

  const portfolio: string[] = [];
  for (const item of list(raw, "portfolio_images").slice(0, 12)) {
    const u = url(item);
    if (u === "invalid" || u === null) errors.push(`URL portofolio tidak valid: ${item.slice(0, 40)}`);
    else portfolio.push(u);
  }

  const event_types: string[] = [];
  for (const t of list(raw, "event_types")) {
    const match = EVENT_TYPE_VALUES.find((v) => v.toLowerCase() === t.toLowerCase());
    if (match) event_types.push(match);
    else errors.push(`Jenis acara tidak dikenal: ${t}`);
  }

  let rating: number | null = null;
  const ratingText = text(raw, "rating", 10);
  if (ratingText) {
    const r = Number(ratingText.replace(",", "."));
    if (Number.isNaN(r) || r < 0 || r > 5) errors.push("Rating harus 0–5");
    else rating = Math.round(r * 10) / 10;
  }

  const statusText = (text(raw, "status", 20) ?? "active").toLowerCase();
  const status = statusText === "inactive" || statusText === "nonaktif" ? "inactive" : "active";

  const data: EOInput = {
    company_name: company_name ?? "",
    slug,
    logo: urls.logo,
    description: text(raw, "description", 3000),
    address: text(raw, "address", 500),
    city: text(raw, "city", 100),
    province: text(raw, "province", 100),
    phone: text(raw, "phone", 40),
    email,
    website: urls.website,
    instagram: urls.instagram,
    google_maps_url: urls.google_maps_url,
    year_established: int(raw, "year_established", "Tahun berdiri", 1900, 2100, errors),
    event_types,
    services: list(raw, "services").map((s) => s.slice(0, 80)).slice(0, 30),
    capacity: int(raw, "capacity", "Kapasitas", 0, 10_000_000, errors),
    min_budget: int(raw, "min_budget", "Anggaran minimum", 0, 1_000_000_000_000, errors),
    portfolio_images: portfolio,
    rating,
    review_count: int(raw, "review_count", "Jumlah ulasan", 0, 10_000_000, errors) ?? 0,
    total_events: int(raw, "total_events", "Total acara", 0, 10_000_000, errors),
    verified: bool(raw.verified),
    status,
  };

  return errors.length ? { data: null, errors } : { data, errors };
}
