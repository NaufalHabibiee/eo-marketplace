import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { EOPass } from "@/components/eo-pass";
import { ExploreFilters } from "@/components/explore-filters";
import { BUDGET_RANGES, CAPACITY_OPTIONS, PAGE_SIZE } from "@/lib/constants";
import { getDirectoryStats, parseFilters, searchEOs, type EOFilters } from "@/lib/eo-data";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Cari EO",
  description: "Direktori event organizer di Jakarta dan sekitarnya. Saring berdasarkan jenis acara, kota, kapasitas, dan anggaran.",
};

export default function ExplorePage(props: PageProps<"/explore">) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Cari event organizer</h1>
      <p className="mt-3 max-w-xl text-ink-soft">Saring berdasarkan jenis acara dan lokasi, lalu buka profil untuk minta penawaran.</p>
      <Suspense fallback={<DirectorySkeleton />}>
        <Directory searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function Directory({ searchParams }: Pick<PageProps<"/explore">, "searchParams">) {
  const filters = parseFilters(await searchParams);
  const [{ items, total }, stats] = await Promise.all([searchEOs(filters), getDirectoryStats()]);
  const page = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-10">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <ExploreFilters key={filters.q ?? ""} filters={filters} provinces={stats.provinces} cities={stats.cities} />
      </aside>

      <section aria-labelledby="results-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="results-heading" className="text-sm text-ink-soft" aria-live="polite">
            <strong className="font-display text-lg font-semibold text-ink">{formatNumber(total)}</strong> EO ditemukan
          </h2>
          <ActiveChips filters={filters} />
        </div>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((eo, i) => (
              <EOPass key={eo.id} eo={eo} priority={i < 3} position={i} />
            ))}
          </div>
        )}

        {totalPages > 1 && <Pagination filters={filters} page={page} totalPages={totalPages} />}
      </section>
    </div>
  );
}

function hrefWith(filters: EOFilters, patch: Partial<Record<keyof EOFilters, string | undefined>>): string {
  const p = new URLSearchParams();
  const merged: Record<string, string | undefined> = {
    q: filters.q,
    type: filters.type,
    province: filters.province,
    city: filters.city,
    budget: filters.budget,
    capacity: filters.capacity,
    verified: filters.verified ? "1" : undefined,
    sort: filters.sort && filters.sort !== "recommended" ? filters.sort : undefined,
    page: filters.page && filters.page > 1 ? String(filters.page) : undefined,
    ...patch,
  };
  for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
  const qs = p.toString();
  return qs ? `/explore?${qs}` : "/explore";
}

function ActiveChips({ filters }: { filters: EOFilters }) {
  const chips: { label: string; href: string }[] = [];
  if (filters.q) chips.push({ label: `“${filters.q}”`, href: hrefWith(filters, { q: undefined, page: undefined }) });
  if (filters.type) chips.push({ label: filters.type, href: hrefWith(filters, { type: undefined, page: undefined }) });
  if (filters.province) chips.push({ label: filters.province, href: hrefWith(filters, { province: undefined, city: undefined, page: undefined }) });
  if (filters.city) chips.push({ label: filters.city, href: hrefWith(filters, { city: undefined, page: undefined }) });
  if (filters.budget)
    chips.push({
      label: BUDGET_RANGES.find((b) => b.value === filters.budget)?.label ?? filters.budget,
      href: hrefWith(filters, { budget: undefined, page: undefined }),
    });
  if (filters.capacity)
    chips.push({
      label: CAPACITY_OPTIONS.find((c) => c.value === filters.capacity)?.label ?? `${filters.capacity}+ peserta`,
      href: hrefWith(filters, { capacity: undefined, page: undefined }),
    });
  if (filters.verified) chips.push({ label: "Terverifikasi", href: hrefWith(filters, { verified: undefined, page: undefined }) });
  if (chips.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Filter aktif">
      {chips.map((c) => (
        <li key={c.label}>
          <Link
            href={c.href}
            scroll={false}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-paper hover:bg-cobalt"
          >
            {c.label}
            <X className="size-3.5" aria-label="hapus" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Pagination({ filters, page, totalPages }: { filters: EOFilters; page: number; totalPages: number }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );
  const base = "grid size-10 place-items-center rounded-full text-sm font-semibold transition-colors";
  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Halaman">
      {page > 1 ? (
        <Link href={hrefWith(filters, { page: String(page - 1) })} className={`${base} border border-line hover:border-ink`} aria-label="Halaman sebelumnya">
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={`${base} border border-line text-ink-muted/50`} aria-hidden>
          <ChevronLeft className="size-4" />
        </span>
      )}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-ink-muted">…</span>}
          <Link
            href={hrefWith(filters, { page: p > 1 ? String(p) : undefined })}
            aria-current={p === page ? "page" : undefined}
            className={`${base} ${p === page ? "bg-ink text-paper" : "hover:bg-surface"}`}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < totalPages ? (
        <Link href={hrefWith(filters, { page: String(page + 1) })} className={`${base} border border-line hover:border-ink`} aria-label="Halaman berikutnya">
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={`${base} border border-line text-ink-muted/50`} aria-hidden>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}

function EmptyState() {
  return (
    <div className="mt-6 rounded-[24px] border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
      <h3 className="font-display text-xl font-semibold">Belum ada EO yang cocok dengan filter ini</h3>
      <p className="mx-auto mt-2 max-w-md text-ink-soft">
        Coba longgarkan filter, atau kirim kebutuhanmu dan tim kami carikan EO yang sesuai.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/explore" className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold hover:border-ink">
          Hapus semua filter
        </Link>
        <Link href="/request" className="rounded-full bg-cobalt px-5 py-2.5 text-sm font-semibold text-white hover:bg-cobalt-deep">
          Kirim kebutuhan acara
        </Link>
      </div>
    </div>
  );
}

function DirectorySkeleton() {
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-10" aria-busy="true" aria-label="Memuat direktori">
      <div className="space-y-4">
        <div className="h-13 animate-pulse rounded-2xl bg-line/60" />
        <div className="hidden h-72 animate-pulse rounded-2xl bg-line/40 lg:block" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-60 animate-pulse rounded-[22px] bg-line/40" />
        ))}
      </div>
    </div>
  );
}
