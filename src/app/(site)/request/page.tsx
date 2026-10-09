import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { MapPin } from "lucide-react";
import { Rating, VerifiedBadge } from "@/components/badges";
import { EOAvatar } from "@/components/eo-avatar";
import { RequestForm } from "@/components/request-form";
import { EVENT_TYPE_VALUES } from "@/lib/constants";
import { getEOBySlug } from "@/lib/eo-data";
import { createServerSupabase } from "@/lib/supabase/server";
import type { EO } from "@/lib/types";

export const metadata: Metadata = {
  title: "Minta penawaran",
  description: "Kirim kebutuhan acaramu ke event organizer pilihan dan dapatkan penawaran.",
};

export default function RequestPage(props: PageProps<"/request">) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">
      <Suspense fallback={<div className="h-[70vh] animate-pulse rounded-[28px] bg-line/40" aria-busy="true" />}>
        <RequestContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function RequestContent({ searchParams }: Pick<PageProps<"/request">, "searchParams">) {
  const params = await searchParams;
  await connection();
  const slugs = typeof params.eo === "string" ? [...new Set(params.eo.split(",").map((s) => s.trim().slice(0, 120)).filter(Boolean))].slice(0, 3) : [];
  const type = typeof params.type === "string" && EVENT_TYPE_VALUES.includes(params.type) ? params.type : null;
  const eos = (await Promise.all(slugs.map((s) => getEOBySlug(s)))).filter((e): e is EO => e !== null);
  const eo = eos[0] ?? null;
  const supabase = await createServerSupabase();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  const meta = (claims?.user_metadata as { full_name?: string; name?: string } | undefined) ?? {};
  const account = claims ? { name: meta.full_name || meta.name || "", email: (claims.email as string | undefined) ?? "" } : null;
  const minDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());

  const selected = eos.length ? (
    <SelectedEOs eos={eos} />
  ) : (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-xs font-semibold text-ink-muted">Dikirim ke</p>
      <p className="font-display mt-1 font-semibold text-ink">Tim EO Marketplace</p>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">Kami cocokkan kebutuhanmu dengan EO yang sesuai lalu meneruskannya.</p>
      {slugs.length > 0 && <p className="mt-3 text-sm text-danger">EO yang dipilih tidak ditemukan atau sudah tidak aktif.</p>}
      <Link href="/explore" className="mt-3 inline-block text-sm font-semibold text-cobalt hover:text-cobalt-deep">
        Pilih EO dari direktori
      </Link>
    </div>
  );

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
        <Link href="/" className="hover:text-ink">
          Beranda
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-ink-soft">Minta penawaran</span>
      </nav>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Minta penawaran</h1>
          <p className="mt-2 max-w-xl text-ink-soft">
            {eos.length > 1
              ? `Satu formulir dikirim ke ${eos.length} EO sekaligus.`
              : eo
                ? `Ceritakan kebutuhan acaramu ke ${eo.company_name}.`
                : "Ceritakan kebutuhan acaramu, kami bantu temukan EO yang tepat."} Sekitar 2 menit, tanpa
            membuat akun.
          </p>
        </div>
        <p className="text-sm text-ink-muted">Semua kolom wajib diisi kecuali yang ditandai opsional.</p>
      </div>
      <div className="mt-8">
        <RequestForm
          eoSlugs={eos.map((e) => e.slug)}
          eoName={eos.length > 1 ? `${eos.length} EO pilihanmu` : (eo?.company_name ?? null)}
          defaultType={type ?? eo?.event_types[0] ?? null}
          minDate={minDate}
          selectedEO={selected}
          account={account}
        />
      </div>
    </>
  );
}

function SelectedEOs({ eos }: { eos: EO[] }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-xs font-semibold text-ink-muted">Dikirim ke {eos.length > 1 ? `${eos.length} EO` : ""}</p>
      <ul className="mt-3 space-y-3">
        {eos.map((eo) => (
          <li key={eo.id} className="flex items-start gap-3">
            <EOAvatar name={eo.company_name} logo={eo.logo} primaryType={eo.event_types[0]} size="sm" />
            <div className="min-w-0">
              <p className="font-display font-semibold leading-snug text-ink">
                {eo.company_name} {eo.verified && <VerifiedBadge compact />}
              </p>
              {eo.city && (
                <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-soft">
                  <MapPin className="size-3.5" aria-hidden />
                  {eo.city}
                </p>
              )}
              <div className="mt-1">
                <Rating rating={eo.rating} reviews={eo.review_count} />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Link href="/explore" className="mt-4 inline-block text-sm font-semibold text-cobalt hover:text-cobalt-deep">
        {eos.length > 1 ? "Ubah pilihan EO" : "Ganti EO"}
      </Link>
    </div>
  );
}
