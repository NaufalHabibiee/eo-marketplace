import { cacheLife, cacheTag } from "next/cache";
import { BUDGET_RANGES, EVENT_TYPE_VALUES, PAGE_SIZE } from "./constants";
import { createPublicClient } from "./supabase/public";
import type { EO, EOCardData } from "./types";

const CARD_COLUMNS = "id, company_name, slug, logo, city, rating, review_count, event_types, total_events, verified";

export type EOFilters = {
  q?: string;
  type?: string;
  province?: string;
  city?: string;
  budget?: string;
  capacity?: string;
  verified?: boolean;
  sort?: "recommended" | "rating" | "reviews" | "name";
  page?: number;
};

type SearchParamsRecord = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v?.trim() || undefined;
}

export function parseFilters(params: SearchParamsRecord): EOFilters {
  const type = first(params.type);
  const budget = first(params.budget);
  const capacity = first(params.capacity);
  const sort = first(params.sort);
  const page = Number(first(params.page) ?? "1");
  return {
    q: first(params.q)?.slice(0, 80),
    type: type && EVENT_TYPE_VALUES.includes(type) ? type : undefined,
    province: first(params.province)?.slice(0, 60),
    city: first(params.city)?.slice(0, 60),
    budget: BUDGET_RANGES.some((b) => b.value === budget) ? budget : undefined,
    capacity: capacity && /^\d{1,6}$/.test(capacity) ? capacity : undefined,
    verified: first(params.verified) === "1" || undefined,
    sort: sort === "rating" || sort === "reviews" || sort === "name" ? sort : "recommended",
    page: Number.isInteger(page) && page > 0 && page < 1000 ? page : 1,
  };
}

/** Strips characters that carry meaning in PostgREST filter syntax. */
function sanitizeSearch(q: string): string {
  return q.replace(/[%_,.()*\\:"']/g, " ").replace(/\s+/g, " ").trim();
}

export async function searchEOs(filters: EOFilters): Promise<{ items: EOCardData[]; total: number }> {
  "use cache";
  cacheLife("minutes");
  cacheTag("eo");

  const supabase = createPublicClient();
  let query = supabase.from("eo").select(CARD_COLUMNS, { count: "exact" }).eq("status", "active");

  if (filters.q) {
    const q = sanitizeSearch(filters.q);
    if (q) query = query.or(`company_name.ilike.%${q}%,city.ilike.%${q}%,description.ilike.%${q}%`);
  }
  if (filters.type) query = query.contains("event_types", [filters.type]);
  if (filters.province) query = query.eq("province", filters.province);
  if (filters.city) query = query.eq("city", filters.city);
  if (filters.verified) query = query.eq("verified", true);
  if (filters.capacity) query = query.gte("capacity", Number(filters.capacity));
  if (filters.budget) {
    const range = BUDGET_RANGES.find((b) => b.value === filters.budget);
    if (range) query = query.lte("min_budget", range.max);
  }

  switch (filters.sort) {
    case "rating":
      query = query.order("rating", { ascending: false, nullsFirst: false }).order("review_count", { ascending: false });
      break;
    case "reviews":
      query = query.order("review_count", { ascending: false });
      break;
    case "name":
      query = query.order("company_name", { ascending: true });
      break;
    default:
      query = query
        .order("verified", { ascending: false })
        .order("rating", { ascending: false, nullsFirst: false })
        .order("review_count", { ascending: false });
  }

  const page = filters.page ?? 1;
  const from = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await query.order("id").range(from, from + PAGE_SIZE - 1);
  if (error) {
    // An out-of-range page returns 416 from PostgREST; treat it as empty.
    if (error.code === "PGRST103") return { items: [], total: count ?? 0 };
    throw new Error(`Gagal memuat daftar EO: ${error.message}`);
  }
  return { items: (data ?? []) as EOCardData[], total: count ?? 0 };
}

export async function getFeaturedEOs(limit = 8): Promise<EOCardData[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("eo");

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("eo")
    .select(CARD_COLUMNS)
    .eq("status", "active")
    .gte("rating", 4.7)
    .order("verified", { ascending: false })
    .order("review_count", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Gagal memuat EO unggulan: ${error.message}`);
  return (data ?? []) as EOCardData[];
}

export async function getEOBySlug(slug: string): Promise<EO | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("eo");

  const supabase = createPublicClient();
  const { data, error } = await supabase.from("eo").select("*").eq("slug", slug).eq("status", "active").maybeSingle();
  if (error) throw new Error(`Gagal memuat profil EO: ${error.message}`);
  return data as EO | null;
}

export async function getActiveSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("eo");

  const supabase = createPublicClient();
  const { data, error } = await supabase.from("eo").select("slug").eq("status", "active").limit(1000);
  if (error) throw new Error(`Gagal memuat daftar slug: ${error.message}`);
  return (data ?? []).map((r) => r.slug as string);
}

export type DirectoryStats = {
  total: number;
  cities: { name: string; province: string; count: number }[];
  provinces: string[];
  typeCounts: Record<string, number>;
  typeSamples: Record<string, { name: string; logo: string | null }[]>;
  avgRating: number | null;
  totalReviews: number;
};

export async function getDirectoryStats(): Promise<DirectoryStats> {
  "use cache";
  cacheLife("minutes");
  cacheTag("eo");

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("eo")
    .select("company_name, logo, city, province, event_types, rating, review_count")
    .eq("status", "active")
    .order("review_count", { ascending: false })
    .limit(5000);
  if (error) throw new Error(`Gagal memuat statistik: ${error.message}`);

  const cityMap = new Map<string, { name: string; province: string; count: number }>();
  const provinces = new Set<string>();
  const typeCounts: Record<string, number> = {};
  const typeSamples: Record<string, { name: string; logo: string | null }[]> = {};
  let ratingSum = 0;
  let ratingCount = 0;
  let totalReviews = 0;
  for (const row of data ?? []) {
    if (row.rating != null) {
      ratingSum += Number(row.rating);
      ratingCount += 1;
    }
    totalReviews += Number(row.review_count ?? 0);
    for (const t of (row.event_types as string[]) ?? []) {
      const list = (typeSamples[t] ??= []);
      if (list.length < 3) list.push({ name: row.company_name as string, logo: (row.logo as string | null) ?? null });
    }
    if (row.city) {
      const entry = cityMap.get(row.city) ?? { name: row.city, province: row.province ?? "", count: 0 };
      entry.count += 1;
      cityMap.set(row.city, entry);
    }
    if (row.province) provinces.add(row.province);
    for (const t of (row.event_types as string[]) ?? []) typeCounts[t] = (typeCounts[t] ?? 0) + 1;
  }
  return {
    total: data?.length ?? 0,
    cities: [...cityMap.values()].sort((a, b) => b.count - a.count),
    provinces: [...provinces].sort(),
    typeCounts,
    typeSamples,
    avgRating: ratingCount ? Math.round((ratingSum / ratingCount) * 10) / 10 : null,
    totalReviews,
  };
}

export async function getSimilarEOs(eo: Pick<EO, "id" | "event_types" | "city">, limit = 3): Promise<EOCardData[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("eo");

  const supabase = createPublicClient();
  const mainType = eo.event_types[0];
  let query = supabase.from("eo").select(CARD_COLUMNS).eq("status", "active").neq("id", eo.id);
  if (mainType) query = query.contains("event_types", [mainType]);
  const { data, error } = await query.order("review_count", { ascending: false }).limit(limit);
  if (error) return [];
  return (data ?? []) as EOCardData[];
}
