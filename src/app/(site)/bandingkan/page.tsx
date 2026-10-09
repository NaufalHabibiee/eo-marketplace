import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { BadgeCheck, Check, Minus, Star } from "lucide-react";
import { EOAvatar } from "@/components/eo-avatar";
import { getEOBySlug } from "@/lib/eo-data";
import { displayUrl, formatNumber, formatRating, formatRupiah, safeExternalUrl, whatsappNumber } from "@/lib/format";
import { coverPhoto } from "@/lib/sample-photos";
import type { EO } from "@/lib/types";

export const metadata: Metadata = { title: "Bandingkan EO", robots: { index: false } };

export default function ComparePage(props: PageProps<"/bandingkan">) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <Suspense fallback={<div className="h-[60vh] animate-pulse rounded-3xl bg-line/40" aria-busy="true" />}>
        <Comparison searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function Comparison({ searchParams }: Pick<PageProps<"/bandingkan">, "searchParams">) {
  const params = await searchParams;
  const slugs = typeof params.eo === "string" ? [...new Set(params.eo.split(",").map((s) => s.trim()).filter(Boolean))].slice(0, 3) : [];
  const eos = (await Promise.all(slugs.map((s) => getEOBySlug(s)))).filter((e): e is EO => e !== null);

  if (eos.length < 2) {
    return (
      <div className="rounded-3xl border border-dashed border-line-strong bg-surface px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold">Pilih minimal 2 EO untuk dibandingkan</h1>
        <p className="mx-auto mt-2 max-w-md text-ink-soft">Tekan tombol “Bandingkan” di kartu EO pada halaman direktori. Kamu bisa memilih hingga 3 EO.</p>
        <Link href="/explore" className="mt-6 inline-flex rounded-full bg-cobalt px-6 py-3 font-semibold text-white hover:bg-cobalt-deep">
          Buka direktori EO
        </Link>
      </div>
    );
  }

  const bestRating = Math.max(...eos.map((e) => e.rating ?? 0));
  const mostReviews = Math.max(...eos.map((e) => e.review_count));
  const yes = <Check className="size-5 text-cobalt" strokeWidth={2.5} aria-label="Ya" />;
  const no = <Minus className="size-5 text-ink-muted/50" aria-label="Tidak ada" />;

  const rows: { label: string; render: (eo: EO) => ReactNode }[] = [
    {
      label: "Rating Google",
      render: (eo) => (
        <span className="inline-flex items-center gap-1.5">
          <Star className="size-4" fill="var(--marigold)" stroke="var(--marigold)" aria-hidden />
          <strong className="font-semibold">{formatRating(eo.rating)}</strong>
          {eo.rating === bestRating && <Best />}
        </span>
      ),
    },
    {
      label: "Jumlah ulasan",
      render: (eo) => (
        <span className="inline-flex items-center gap-2">
          {formatNumber(eo.review_count)}
          {eo.review_count === mostReviews && <Best />}
        </span>
      ),
    },
    { label: "Lokasi", render: (eo) => [eo.city, eo.province].filter(Boolean).join(", ") || "–" },
    { label: "Jenis acara", render: (eo) => eo.event_types.join(", ") || "–" },
    { label: "Terverifikasi", render: (eo) => (eo.verified ? yes : no) },
    { label: "Bisa WhatsApp", render: (eo) => (whatsappNumber(eo.phone) ? yes : no) },
    {
      label: "Website",
      render: (eo) => {
        const url = safeExternalUrl(eo.website);
        return url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-cobalt hover:underline">
            {displayUrl(url)}
          </a>
        ) : (
          no
        );
      },
    },
    { label: "Kapasitas maksimal", render: (eo) => (eo.capacity ? `${formatNumber(eo.capacity)} peserta` : <Empty />) },
    { label: "Anggaran mulai", render: (eo) => (eo.min_budget ? formatRupiah(eo.min_budget) : <Empty />) },
    { label: "Berdiri sejak", render: (eo) => (eo.year_established ? String(eo.year_established) : <Empty />) },
  ];

  const cols =
    eos.length === 2 ? "grid-cols-[140px_1fr_1fr] md:grid-cols-[200px_1fr_1fr]" : "grid-cols-[140px_1fr_1fr_1fr] md:grid-cols-[200px_1fr_1fr_1fr]";

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Bandingkan {eos.length} EO</h1>
          <p className="mt-2 text-ink-soft">Lihat perbedaan rating, lokasi, dan layanan secara berdampingan.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/explore" className="inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold ring-1 ring-line-strong hover:bg-surface">
            Ubah pilihan
          </Link>
          <Link
            href={`/request?eo=${eos.map((e) => e.slug).join(",")}`}
            className="inline-flex h-11 items-center rounded-full bg-cobalt px-5 text-sm font-semibold text-white hover:bg-cobalt-deep"
          >
            Minta penawaran ke {eos.length} EO
          </Link>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-3xl bg-surface ring-1 ring-line">
        <div className="min-w-[640px]">
          <div className={`grid ${cols} border-b border-line`}>
            <div className="p-5" />
            {eos.map((eo, i) => (
              <div key={eo.id} className="border-l border-line p-5">
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
                  <Image src={coverPhoto(eo.slug, eo.event_types, i).src} alt="" fill sizes="360px" className="object-cover" />
                  <span className="absolute bottom-2 right-2 text-[0.6rem] text-white/80">Foto ilustrasi</span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <EOAvatar name={eo.company_name} logo={eo.logo} primaryType={eo.event_types[0]} size="sm" />
                  <div className="min-w-0">
                    <Link href={`/eo/${eo.slug}`} className="font-display line-clamp-2 font-semibold leading-snug hover:text-cobalt">
                      {eo.company_name}
                    </Link>
                    {eo.verified && (
                      <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-cobalt">
                        <BadgeCheck className="size-3.5" aria-hidden />
                        Terverifikasi
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {rows.map((row) => (
            <div key={row.label} className={`grid ${cols} border-b border-line last:border-b-0`}>
              <div className="bg-paper/60 px-5 py-4 text-sm font-medium text-ink-muted">{row.label}</div>
              {eos.map((eo) => (
                <div key={eo.id} className="border-l border-line px-5 py-4 text-sm text-ink">
                  {row.render(eo)}
                </div>
              ))}
            </div>
          ))}

          <div className={`grid ${cols} border-t border-line bg-paper/40`}>
            <div />
            {eos.map((eo) => (
              <div key={eo.id} className="flex flex-col gap-2 border-l border-line p-5">
                <Link
                  href={`/request?eo=${eo.slug}`}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-ink text-sm font-semibold text-paper hover:bg-cobalt"
                >
                  Minta penawaran
                </Link>
                <Link href={`/eo/${eo.slug}`} className="text-center text-sm font-semibold text-cobalt hover:text-cobalt-deep">
                  Lihat profil
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-muted">“Belum diisi” berarti EO belum melengkapi data tersebut di profilnya.</p>
    </>
  );
}

function Best() {
  return <span className="rounded-full bg-cobalt-wash px-2 py-0.5 text-[0.65rem] font-semibold text-cobalt-deep">Tertinggi</span>;
}

function Empty() {
  return <span className="text-ink-muted/70">Belum diisi</span>;
}
