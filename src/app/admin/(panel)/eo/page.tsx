import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BadgeCheck, Plus, Search } from "lucide-react";
import { CsvImport } from "@/components/admin/csv-import";
import { EOActions, EOToggles } from "@/components/admin/eo-row-controls";
import { EOAvatar } from "@/components/eo-avatar";
import { formatNumber, formatRating } from "@/lib/format";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Kelola EO" };

const PER_PAGE = 20;

export default function AdminEOPage(props: PageProps<"/admin/eo">) {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Kelola EO</h1>
          <p className="mt-1 text-ink-soft">Tambah, ubah, verifikasi, atau sembunyikan EO dari direktori.</p>
        </div>
        <Link href="/admin/eo/new" className="inline-flex items-center gap-2 rounded-xl bg-cobalt px-4 py-2.5 text-sm font-semibold text-white hover:bg-cobalt-deep">
          <Plus className="size-4" aria-hidden />
          Tambah EO
        </Link>
      </div>
      <Suspense fallback={<div className="mt-8 h-[60vh] animate-pulse rounded-2xl bg-line/40" />}>
        <EOTable searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function EOTable({ searchParams }: Pick<PageProps<"/admin/eo">, "searchParams">) {
  const params = await searchParams;
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim() : "");
  const q = str(params.q).slice(0, 80);
  const status = ["active", "inactive"].includes(str(params.status)) ? str(params.status) : "";
  const verified = str(params.verified) === "1";
  const page = Math.max(1, Math.min(999, Number(str(params.page)) || 1));
  const saved = str(params.saved).slice(0, 200);

  const supabase = await createServerSupabase();
  let query = supabase
    .from("eo")
    .select("id, company_name, slug, logo, city, rating, review_count, event_types, verified, status, source, contact_person", { count: "exact" });
  if (q) {
    const safe = q.replace(/[%_,.()*\\:"']/g, " ").trim();
    if (safe) query = query.or(`company_name.ilike.%${safe}%,city.ilike.%${safe}%,slug.ilike.%${safe}%`);
  }
  if (status) query = query.eq("status", status);
  if (verified) query = query.eq("verified", true);
  const from = (page - 1) * PER_PAGE;
  const { data, count, error } = await query.order("verified", { ascending: false }).order("review_count", { ascending: false }).order("id").range(from, from + PER_PAGE - 1);
  if (error && error.code !== "PGRST103") throw new Error(`Gagal memuat EO: ${error.message}`);
  const rows = data ?? [];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const href = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { q: q || undefined, status: status || undefined, verified: verified ? "1" : undefined, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/admin/eo?${s}` : "/admin/eo";
  };

  return (
    <>
      {saved && (
        <p role="status" className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          “{saved}” tersimpan.
        </p>
      )}

      <div className="mt-6">
        <CsvImport />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <form className="relative min-w-60 flex-1" action="/admin/eo">
          {status && <input type="hidden" name="status" value={status} />}
          {verified && <input type="hidden" name="verified" value="1" />}
          <label htmlFor="admin-q" className="sr-only">
            Cari EO
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
          <input id="admin-q" name="q" defaultValue={q} placeholder="Cari nama, kota, atau slug" className="field pl-10" />
        </form>
        <nav className="flex flex-wrap gap-1.5" aria-label="Filter EO">
          <Chip href={href({ status: undefined, verified: undefined })} active={!status && !verified} label="Semua" />
          <Chip href={href({ status: "active", page: undefined })} active={status === "active"} label="Aktif" />
          <Chip href={href({ status: "inactive", page: undefined })} active={status === "inactive"} label="Nonaktif" />
          <Chip href={href({ verified: verified ? undefined : "1", page: undefined })} active={verified} label="Terverifikasi" />
        </nav>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-line bg-paper/60 text-xs text-ink-muted">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">
                EO ({formatNumber(total)})
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Kota
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Rating
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Terverifikasi
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Tampil
              </th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center text-ink-soft">
                  Tidak ada EO yang cocok. <Link href="/admin/eo" className="font-semibold text-cobalt">Reset filter</Link>
                </td>
              </tr>
            )}
            {rows.map((eo) => (
              <tr key={eo.id} className={eo.status === "inactive" ? "bg-paper/60 text-ink-muted" : ""}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <EOAvatar name={eo.company_name} logo={eo.logo} primaryType={eo.event_types?.[0]} size="sm" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 truncate font-semibold text-ink">
                        <span className="truncate">{eo.company_name}</span>
                        {eo.verified && <BadgeCheck className="size-4 shrink-0 text-cobalt" aria-label="Terverifikasi" />}
                      </p>
                      <p className="truncate text-xs text-ink-muted">
                        /{eo.slug}
                        {eo.source === "self_registered" && (
                          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-semibold text-amber-800">
                            Pendaftar baru{eo.contact_person ? `, ${eo.contact_person}` : ""}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-ink-soft">{eo.city ?? "–"}</td>
                <td className="px-3 py-3 text-ink-soft">
                  {formatRating(eo.rating)} <span className="text-xs text-ink-muted">({formatNumber(eo.review_count)})</span>
                </td>
                <EOToggles id={eo.id} name={eo.company_name} verified={eo.verified} active={eo.status === "active"} />
                <td className="px-5 py-3">
                  <EOActions id={eo.id} name={eo.company_name} slug={eo.slug} active={eo.status === "active"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-between text-sm" aria-label="Halaman">
          <span className="text-ink-muted">
            Halaman {page} dari {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={href({ page: String(page - 1) })} className="rounded-lg border border-line-strong px-3 py-1.5 font-semibold hover:border-ink">
                Sebelumnya
              </Link>
            )}
            {page < totalPages && (
              <Link href={href({ page: String(page + 1) })} className="rounded-lg border border-line-strong px-3 py-1.5 font-semibold hover:border-ink">
                Berikutnya
              </Link>
            )}
          </div>
        </nav>
      )}
    </>
  );
}

function Chip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${active ? "bg-ink text-paper" : "bg-surface text-ink-soft ring-1 ring-line hover:text-ink"}`}
    >
      {label}
    </Link>
  );
}
