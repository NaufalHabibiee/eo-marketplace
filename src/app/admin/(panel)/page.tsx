import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronDown, Mail, MessageCircle, Send } from "lucide-react";
import { LeadCharts, chartWindow } from "@/components/admin/lead-charts";
import { LeadStatusSelect } from "@/components/admin/lead-status-select";
import { LEAD_STATUSES } from "@/lib/constants";
import { budgetLabel, formatDate, formatNumber, whatsappLink } from "@/lib/format";
import { createServerSupabase } from "@/lib/supabase/server";
import type { LeadRow } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard" };

export default function AdminDashboardPage(props: PageProps<"/admin">) {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-ink-soft">Ringkasan direktori dan permintaan acara terbaru.</p>
      <Suspense fallback={<div className="mt-8 h-96 animate-pulse rounded-2xl bg-line/40" />}>
        <DashboardContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function DashboardContent({ searchParams }: Pick<PageProps<"/admin">, "searchParams">) {
  const params = await searchParams;
  const statusFilter = typeof params.status === "string" && LEAD_STATUSES.some((s) => s.value === params.status) ? params.status : null;
  const supabase = await createServerSupabase();

  const count = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0);
  let leadsQuery = supabase
    .from("leads")
    .select("id, status, created_at, request:event_requests(*), eo:eo(id, company_name, slug, phone)")
    .order("created_at", { ascending: false })
    .limit(30);
  if (statusFilter) leadsQuery = leadsQuery.eq("status", statusFilter);

  const { now, since } = chartWindow();
  const [totalEO, verifiedEO, activeEO, totalRequests, newLeads, leadsResult, chartResult, pendingEO] = await Promise.all([
    count(supabase.from("eo").select("id", { count: "exact", head: true })),
    count(supabase.from("eo").select("id", { count: "exact", head: true }).eq("verified", true)),
    count(supabase.from("eo").select("id", { count: "exact", head: true }).eq("status", "active")),
    count(supabase.from("event_requests").select("id", { count: "exact", head: true })),
    count(supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "NEW")),
    leadsQuery,
    supabase.from("leads").select("created_at, status").gte("created_at", since).limit(5000),
    count(supabase.from("eo").select("id", { count: "exact", head: true }).eq("source", "self_registered").eq("status", "inactive")),
  ]);
  const chartLeads = (chartResult.data ?? []) as { created_at: string; status: string }[];

  if (leadsResult.error) throw new Error(`Gagal memuat lead: ${leadsResult.error.message}`);
  const leads = (leadsResult.data ?? []) as unknown as LeadRow[];

  const kpis = [
    { label: "Total EO", value: totalEO, href: "/admin/eo" },
    { label: "EO terverifikasi", value: verifiedEO, href: "/admin/eo?verified=1" },
    { label: "EO aktif", value: activeEO, href: "/admin/eo?status=active" },
    { label: "Permintaan acara", value: totalRequests, href: "/admin" },
    { label: "Lead baru", value: newLeads, href: "/admin?status=NEW", highlight: newLeads > 0 },
    { label: "Pendaftar EO", value: pendingEO, href: "/admin/eo?status=inactive", highlight: false },
  ];

  return (
    <>
      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className={`rounded-2xl border px-5 py-4 transition-colors ${
              k.highlight ? "border-cobalt bg-cobalt text-white hover:bg-cobalt-deep" : "border-line bg-surface hover:border-line-strong"
            }`}
          >
            <dt className={`text-sm ${k.highlight ? "text-white/80" : "text-ink-muted"}`}>{k.label}</dt>
            <dd className="font-display mt-1 text-3xl font-bold tracking-tight">{formatNumber(k.value)}</dd>
          </Link>
        ))}
      </dl>

      <LeadCharts leads={chartLeads} now={now} />

      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold">Permintaan terbaru</h2>
          <nav className="flex flex-wrap gap-1.5" aria-label="Filter status">
            <FilterLink href="/admin" active={!statusFilter} label="Semua" />
            {LEAD_STATUSES.map((s) => (
              <FilterLink key={s.value} href={`/admin?status=${s.value}`} active={statusFilter === s.value} label={s.label} />
            ))}
          </nav>
        </div>

        {leads.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
            <p className="font-display text-lg font-semibold">{statusFilter ? "Tidak ada lead dengan status ini" : "Belum ada permintaan acara"}</p>
            <p className="mt-1 text-sm text-ink-soft">
              Permintaan dari formulir{" "}
              <Link href="/request" target="_blank" className="font-semibold text-cobalt">
                Minta penawaran
              </Link>{" "}
              akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr_0.8fr_auto] gap-4 border-b border-line bg-paper/60 px-5 py-3 text-xs font-semibold text-ink-muted lg:grid">
              <span>Klien</span>
              <span>Jenis acara</span>
              <span>Lokasi</span>
              <span>Anggaran</span>
              <span>EO dipilih</span>
              <span>Masuk</span>
              <span>Status</span>
            </div>
            <ul className="divide-y divide-line">
              {leads.map((lead) => (
                <LeadItem key={lead.id} lead={lead} />
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}

function FilterLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? "bg-ink text-paper" : "bg-surface text-ink-soft ring-1 ring-line hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}

function LeadItem({ lead }: { lead: LeadRow }) {
  const r = lead.request;
  if (!r) return null;
  const summary = [
    `Halo, ada permintaan penawaran baru dari EO Marketplace (ref ${r.id.slice(0, 8).toUpperCase()}):`,
    `Klien: ${r.name} (${r.company})`,
    `Acara: ${r.event_type}, ${r.participants} peserta`,
    `Tanggal: ${formatDate(r.event_date)}`,
    `Lokasi: ${r.location}`,
    `Anggaran: ${budgetLabel(r.budget)}`,
    `Kebutuhan: ${r.description}`,
    `Kontak klien: ${r.phone} / ${r.email}`,
  ].join("\n");
  const waClient = whatsappLink(r.phone, `Halo ${r.name}, kami dari EO Marketplace terkait permintaan acara ${r.event_type} Anda.`);
  const waEO = lead.eo ? whatsappLink(lead.eo.phone, summary) : null;

  return (
    <li>
      <details className="group">
        <summary className="grid cursor-pointer list-none gap-2 px-5 py-4 transition-colors hover:bg-paper/60 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr_0.8fr_auto] lg:items-center lg:gap-4">
          <span className="min-w-0">
            <span className="block truncate font-semibold text-ink">{r.name}</span>
            <span className="block truncate text-xs text-ink-muted">{r.company}</span>
          </span>
          <span className="text-sm text-ink-soft">{r.event_type}</span>
          <span className="truncate text-sm text-ink-soft">{r.location}</span>
          <span className="text-sm text-ink-soft">{budgetLabel(r.budget)}</span>
          <span className="truncate text-sm">
            {lead.eo ? (
              <span className="text-ink">{lead.eo.company_name}</span>
            ) : (
              <span className="text-ink-muted">Perlu dicocokkan</span>
            )}
          </span>
          <span className="text-sm text-ink-muted">{formatDate(lead.created_at)}</span>
          <span className="flex items-center gap-2">
            <LeadStatusSelect leadId={lead.id} requestId={r.id} status={lead.status} />
            <ChevronDown className="size-4 text-ink-muted transition-transform group-open:rotate-180" aria-hidden />
          </span>
        </summary>
        <div className="grid gap-6 border-t border-dashed border-line bg-paper/50 px-5 py-5 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-xs font-semibold text-ink-muted">Kebutuhan acara</p>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">{r.description}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <Detail label="Tanggal acara" value={formatDate(r.event_date)} />
              <Detail label="Peserta" value={`${formatNumber(r.participants)} orang`} />
              <Detail label="Ref" value={r.id.slice(0, 8).toUpperCase()} />
              <Detail label="Email" value={r.email} />
              <Detail label="WhatsApp" value={r.phone} />
            </dl>
          </div>
          <div className="flex flex-col gap-2 lg:items-stretch">
            {waEO ? (
              <a href={waEO} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:bg-cobalt">
                <Send className="size-4" aria-hidden />
                Teruskan ke {lead.eo?.company_name} via WhatsApp
              </a>
            ) : lead.eo ? (
              <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800">Nomor EO bukan WhatsApp. Hubungi lewat telepon {lead.eo.phone ?? "-"}.</p>
            ) : null}
            {waClient && (
              <a href={waClient} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold hover:border-ink">
                <MessageCircle className="size-4" aria-hidden />
                Chat klien
              </a>
            )}
            <a href={`mailto:${r.email}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold hover:border-ink">
              <Mail className="size-4" aria-hidden />
              Email klien
            </a>
            {lead.eo && (
              <Link href={`/eo/${lead.eo.slug}`} target="_blank" className="text-center text-sm font-semibold text-cobalt hover:text-cobalt-deep">
                Lihat profil EO
              </Link>
            )}
          </div>
        </div>
      </details>
    </li>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="truncate font-medium text-ink" title={value}>
        {value}
      </dd>
    </div>
  );
}
