import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { EOPass } from "@/components/eo-pass";
import { LEAD_STATUSES } from "@/lib/constants";
import { budgetLabel, formatDate, formatNumber, initials } from "@/lib/format";
import { createServerSupabase } from "@/lib/supabase/server";
import type { EOCardData } from "@/lib/types";

export const metadata: Metadata = { title: "Permintaan saya", robots: { index: false } };

type MyRequest = {
  id: string;
  event_type: string;
  location: string;
  event_date: string;
  participants: number;
  budget: string;
  status: string;
  created_at: string;
  leads: { eo: { company_name: string; slug: string } | null }[];
};

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-line/40" aria-busy="true" />}>
        <AccountContent />
      </Suspense>
    </div>
  );
}

async function AccountContent() {
  const supabase = await createServerSupabase();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims) redirect("/masuk?next=/akun");

  const email = (claims.email as string | undefined) ?? "";
  const meta = (claims.user_metadata as { full_name?: string; name?: string } | undefined) ?? {};
  const name = meta.full_name || meta.name || email.split("@")[0];

  const { data: favData } = await supabase
    .from("eo_favorites")
    .select("created_at, eo:eo(id, company_name, slug, logo, city, rating, review_count, event_types, total_events, verified)")
    .eq("user_id", claims.sub)
    .order("created_at", { ascending: false });
  const favorites = ((favData ?? []) as unknown as { eo: EOCardData | null }[]).map((f) => f.eo).filter((e): e is EOCardData => e !== null);

  const { data, error } = await supabase
    .from("event_requests")
    .select("id, event_type, location, event_date, participants, budget, status, created_at, leads(eo:eo(company_name, slug))")
    .eq("user_id", claims.sub)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Gagal memuat permintaan: ${error.message}`);
  const requests = (data ?? []) as unknown as MyRequest[];

  return (
    <>
      <div className="flex flex-col gap-6 rounded-3xl bg-ink p-6 text-paper sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-center gap-4">
          <span className="font-display grid size-14 place-items-center rounded-2xl bg-cobalt text-xl font-semibold" aria-hidden>
            {initials(name)}
          </span>
          <div className="min-w-0">
            <h1 className="font-display truncate text-2xl font-semibold">Halo, {name}</h1>
            <p className="truncate text-sm text-paper/60">{email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/request" className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-ink hover:bg-cobalt hover:text-white">
            Minta penawaran baru
          </Link>
          <SignOutButton className="h-11 rounded-full px-5 text-paper/80 ring-1 ring-white/25 hover:bg-white/10 hover:text-white" />
        </div>
      </div>

      <section className="mt-10" aria-labelledby="saved-eos">
        <div className="flex items-end justify-between gap-3">
          <h2 id="saved-eos" className="font-display text-xl font-semibold">
            EO tersimpan
          </h2>
          <span className="text-sm text-ink-muted">{formatNumber(favorites.length)} EO</span>
        </div>
        {favorites.length === 0 ? (
          <p className="mt-5 rounded-2xl bg-surface px-5 py-6 text-sm text-ink-soft ring-1 ring-line">
            Tekan ikon hati di kartu atau profil EO untuk menyimpannya di sini.{" "}
            <Link href="/explore" className="font-semibold text-cobalt hover:text-cobalt-deep">
              Cari EO
            </Link>
          </p>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((eo, i) => (
              <EOPass key={eo.id} eo={eo} position={i} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10" aria-labelledby="my-requests">
        <div className="flex items-end justify-between gap-3">
          <h2 id="my-requests" className="font-display text-xl font-semibold">
            Permintaan saya
          </h2>
          <span className="text-sm text-ink-muted">{formatNumber(requests.length)} permintaan</span>
        </div>

        {requests.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
            <p className="font-display text-lg font-semibold">Belum ada permintaan</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-soft">
              Permintaan penawaran yang kamu kirim saat masuk akan muncul di sini beserta statusnya.
            </p>
            <Link href="/explore" className="mt-6 inline-flex rounded-full bg-cobalt px-5 py-2.5 text-sm font-semibold text-white hover:bg-cobalt-deep">
              Cari EO
            </Link>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {requests.map((r) => {
              const status = LEAD_STATUSES.find((s) => s.value === r.status);
              const eo = r.leads[0]?.eo ?? null;
              return (
                <li key={r.id} className="rounded-2xl bg-surface p-5 ring-1 ring-line sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-ink-muted">
                        Ref {r.id.slice(0, 8).toUpperCase()}, dikirim {formatDate(r.created_at)}
                      </p>
                      <h3 className="font-display mt-1 text-lg font-semibold">{r.event_type}</h3>
                      <p className="mt-0.5 text-sm text-ink-soft">
                        {eo ? (
                          <>
                            Untuk{" "}
                            <Link href={`/eo/${eo.slug}`} className="font-medium text-cobalt hover:text-cobalt-deep">
                              {eo.company_name}
                            </Link>
                          </>
                        ) : (
                          "Sedang dicocokkan dengan EO oleh tim kami"
                        )}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status?.tone ?? ""}`}>{status?.label ?? r.status}</span>
                  </div>
                  <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-4 text-sm text-ink-soft">
                    <div className="flex items-center gap-1.5">
                      <dt className="sr-only">Tanggal acara</dt>
                      <CalendarDays className="size-4 text-ink-muted" aria-hidden />
                      <dd>{formatDate(r.event_date)}</dd>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <dt className="sr-only">Lokasi</dt>
                      <MapPin className="size-4 text-ink-muted" aria-hidden />
                      <dd>{r.location}</dd>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <dt className="sr-only">Peserta</dt>
                      <Users className="size-4 text-ink-muted" aria-hidden />
                      <dd>{formatNumber(r.participants)} orang</dd>
                    </div>
                    <div>
                      <dt className="sr-only">Anggaran</dt>
                      <dd>{budgetLabel(r.budget)}</dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
