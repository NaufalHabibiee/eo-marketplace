"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { BUDGET_RANGES, CAPACITY_OPTIONS, EVENT_TYPES } from "@/lib/constants";
import type { EOFilters } from "@/lib/eo-data";

type Props = {
  filters: EOFilters;
  provinces: string[];
  cities: { name: string; province: string; count: number }[];
};

type Key = "q" | "type" | "province" | "city" | "budget" | "capacity" | "verified" | "sort";

function toParams(filters: EOFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.q) p.set("q", filters.q);
  if (filters.type) p.set("type", filters.type);
  if (filters.province) p.set("province", filters.province);
  if (filters.city) p.set("city", filters.city);
  if (filters.budget) p.set("budget", filters.budget);
  if (filters.capacity) p.set("capacity", filters.capacity);
  if (filters.verified) p.set("verified", "1");
  if (filters.sort && filters.sort !== "recommended") p.set("sort", filters.sort);
  return p;
}

export function ExploreFilters({ filters, provinces, cities }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(filters.q ?? "");

  function update(key: Key, value: string | undefined) {
    const params = toParams(filters);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key === "province") params.delete("city");
    const qs = params.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  const visibleCities = filters.province ? cities.filter((c) => c.province === filters.province) : cities;
  const activeCount = [filters.type, filters.province, filters.city, filters.budget, filters.capacity, filters.verified].filter(Boolean).length;

  const panel = (
    <div className="space-y-6">
      <fieldset>
        <legend className="font-display text-sm font-semibold text-ink">Jenis acara</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {EVENT_TYPES.map((t) => {
            const active = filters.type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                aria-pressed={active}
                onClick={() => update("type", active ? undefined : t.value)}
                className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                  active ? "border-ink bg-ink text-paper" : "border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <label className="block">
          <span className="font-display text-sm font-semibold text-ink">Provinsi</span>
          <select className="field mt-2" value={filters.province ?? ""} onChange={(e) => update("province", e.target.value || undefined)}>
            <option value="">Semua provinsi</option>
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="font-display text-sm font-semibold text-ink">Kota</span>
          <select className="field mt-2" value={filters.city ?? ""} onChange={(e) => update("city", e.target.value || undefined)}>
            <option value="">Semua kota</option>
            {visibleCities.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="font-display text-sm font-semibold text-ink">Anggaran acara</span>
          <select className="field mt-2" value={filters.budget ?? ""} onChange={(e) => update("budget", e.target.value || undefined)}>
            <option value="">Semua anggaran</option>
            {BUDGET_RANGES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="font-display text-sm font-semibold text-ink">Kapasitas peserta</span>
          <select className="field mt-2" value={filters.capacity ?? ""} onChange={(e) => update("capacity", e.target.value || undefined)}>
            <option value="">Semua kapasitas</option>
            {CAPACITY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {(filters.budget || filters.capacity) && (
        <p className="rounded-xl bg-cobalt-wash px-3 py-2 text-xs leading-relaxed text-cobalt-deep">
          Filter anggaran dan kapasitas hanya menampilkan EO yang sudah melengkapi data tersebut.
        </p>
      )}

      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3">
        <span className="text-sm font-medium text-ink">Hanya EO terverifikasi</span>
        <input
          type="checkbox"
          checked={!!filters.verified}
          onChange={(e) => update("verified", e.target.checked ? "1" : undefined)}
          className="size-5 accent-[var(--cobalt)]"
        />
      </label>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => startTransition(() => router.push(filters.q ? `${pathname}?q=${encodeURIComponent(filters.q)}` : pathname, { scroll: false }))}
          className="text-sm font-semibold text-cobalt hover:text-cobalt-deep"
        >
          Hapus semua filter
        </button>
      )}
    </div>
  );

  return (
    <div data-pending={pending ? "" : undefined} className="group/filters">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          update("q", q.trim() || undefined);
        }}
        className="relative"
      >
        <label htmlFor="explore-q" className="sr-only">
          Cari nama EO, kota, atau kata kunci
        </label>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-ink-muted" aria-hidden />
        <input
          id="explore-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nama EO atau kota"
          className="field h-13 rounded-2xl pl-11 pr-24 text-base"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              update("q", undefined);
            }}
            className="absolute right-[4.6rem] top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink-muted hover:bg-paper hover:text-ink"
            aria-label="Kosongkan pencarian"
          >
            <X className="size-4" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-cobalt"
        >
          Cari
        </button>
      </form>

      <details className="mt-4 rounded-2xl border border-line bg-surface lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold">
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="size-4" aria-hidden />
            Filter
            {activeCount > 0 && <span className="rounded-full bg-cobalt px-2 py-0.5 text-xs text-white">{activeCount}</span>}
          </span>
          <span className="text-ink-muted">Buka</span>
        </summary>
        <div className="border-t border-line p-4">{panel}</div>
      </details>

      <div className="mt-6 hidden lg:block">{panel}</div>

      <SortSelect value={filters.sort ?? "recommended"} onChange={(v) => update("sort", v === "recommended" ? undefined : v)} />

      {pending && (
        <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-cobalt-wash" role="status" aria-label="Memuat hasil">
          <div className="h-full w-1/3 animate-[pulse_1s_ease-in-out_infinite] bg-cobalt" />
        </div>
      )}
    </div>
  );
}

function SortSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="mt-6 block">
      <span className="font-display text-sm font-semibold text-ink">Urutkan</span>
      <select className="field mt-2" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="recommended">Rekomendasi</option>
        <option value="rating">Rating tertinggi</option>
        <option value="reviews">Ulasan terbanyak</option>
        <option value="name">Nama A–Z</option>
      </select>
    </label>
  );
}
