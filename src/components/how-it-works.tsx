"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Check, FileText, MapPin, Search, Star } from "lucide-react";
import { formatNumber, formatRating, initials } from "@/lib/format";
import { coverPhoto } from "@/lib/sample-photos";
import type { EOCardData } from "@/lib/types";

const DURATION = 3500;

const STEPS = [
  { title: "Cari dan saring", body: "Pilih jenis acara dan kota. Direktori langsung menampilkan EO yang cocok.", time: "± 1 menit", url: "eomarketplace.id/explore" },
  { title: "Bandingkan profil", body: "Lihat rating Google, spesialisasi, portofolio, dan lokasi kantor tiap EO.", time: "± 3 menit", url: "eomarketplace.id/eo/profil" },
  { title: "Kirim kebutuhan acara", body: "Isi tanggal, lokasi, peserta, dan anggaran dalam satu formulir singkat.", time: "± 2 menit", url: "eomarketplace.id/request" },
  { title: "Terima penawaran", body: "EO menghubungimu lewat WhatsApp atau email untuk membahas detail dan harga.", time: "1–2 hari kerja", url: "WhatsApp" },
];

export function HowItWorks({ eos, total }: { eos: EOCardData[]; total: number }) {
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    mq.addEventListener("change", update);
    const id = window.setTimeout(update, 0);
    return () => {
      mq.removeEventListener("change", update);
      window.clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    if (reduced) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % STEPS.length), DURATION);
    return () => window.clearTimeout(id);
  }, [active, cycle, reduced]);

  const autoplay = !reduced;

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
      <div>
        <div role="tablist" aria-label="Langkah penggunaan" aria-orientation="vertical" className="space-y-2">
          {STEPS.map((step, i) => {
            const on = i === active;
            return (
              <button
                key={step.title}
                role="tab"
                id={`step-tab-${i}`}
                aria-selected={on}
                aria-controls={`step-panel-${i}`}
                onClick={() => {
                  setActive(i);
                  setCycle((c) => c + 1);
                }}
                className={`relative w-full overflow-hidden rounded-2xl px-5 py-4 text-left transition-colors ${
                  on ? "bg-paper ring-1 ring-line" : "hover:bg-paper/70"
                }`}
              >
                <span className="flex items-baseline gap-4">
                  <span className={`font-display text-sm font-semibold tabular-nums ${on ? "text-cobalt" : "text-ink-muted"}`}>0{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`font-display text-lg font-semibold ${on ? "text-ink" : "text-ink-soft"}`}>{step.title}</span>
                      {on && <span className="text-xs text-ink-muted">{step.time}</span>}
                    </span>
                    <span className={`grid transition-[grid-template-rows] duration-300 ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                      <span className="overflow-hidden">
                        <span className="block pt-1.5 text-sm leading-relaxed text-ink-soft">{step.body}</span>
                      </span>
                    </span>
                  </span>
                </span>
                {on && (
                  <span className="absolute inset-x-5 bottom-0 h-0.5 overflow-hidden rounded-full bg-line" aria-hidden>
                    <span
                      key={`${active}-${cycle}-${autoplay}`}
                      className="block h-full origin-left bg-cobalt"
                      style={autoplay ? { animation: `step-progress ${DURATION}ms linear forwards` } : { transform: "scaleX(1)" }}
                    />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-4 pl-5">
          <Link href="/explore" className="inline-flex h-12 items-center rounded-full bg-cobalt px-6 font-semibold text-white transition-colors hover:bg-cobalt-deep">
            Mulai cari EO
          </Link>
          <span className="text-sm text-ink-muted">Gratis untuk klien, tanpa akun.</span>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -inset-6 -z-10 hidden rounded-[40px] lg:block bg-linear-to-br from-cobalt-wash via-paper to-transparent" aria-hidden />
        <div className="overflow-hidden rounded-2xl bg-surface shadow-[0_40px_80px_-40px_rgba(22,24,58,0.55)] ring-1 ring-line">
          <div className="flex items-center gap-3 border-b border-line bg-paper px-4 py-3">
            <span className="flex gap-1.5" aria-hidden>
              <span className="size-2.5 rounded-full bg-line-strong" />
              <span className="size-2.5 rounded-full bg-line-strong" />
              <span className="size-2.5 rounded-full bg-line-strong" />
            </span>
            <span className="flex-1 truncate rounded-md bg-surface px-3 py-1 text-center text-xs text-ink-muted ring-1 ring-line">{STEPS[active].url}</span>
          </div>
          <div className="relative h-[400px] sm:h-[430px]">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                role="tabpanel"
                id={`step-panel-${i}`}
                aria-labelledby={`step-tab-${i}`}
                hidden={i !== active}
                className="absolute inset-0 animate-[fade-in_400ms_ease-out]"
              >
                {i === 0 && <ExploreMock eos={eos} total={total} />}
                {i === 1 && eos[0] && <ProfileMock eo={eos[0]} />}
                {i === 2 && <FormMock eo={eos[0]} />}
                {i === 3 && <ChatMock eo={eos[0]} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExploreMock({ eos, total }: { eos: EOCardData[]; total: number }) {
  return (
    <div className="h-full bg-paper p-5">
      <div className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2.5 text-sm text-ink-muted ring-1 ring-line">
        <Search className="size-4" aria-hidden />
        gathering kantor
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
        <Pill active>Corporate Event</Pill>
        <Pill active>Jakarta</Pill>
        <Pill>Terverifikasi</Pill>
        <Pill>Rp50–150 jt</Pill>
      </div>
      <p className="mt-4 text-xs text-ink-muted">
        <strong className="text-ink">{formatNumber(total)}</strong> EO ditemukan
      </p>
      <div className="mt-2 grid grid-cols-3 gap-3">
        {eos.slice(0, 3).map((eo, i) => (
          <div key={eo.id} className="overflow-hidden rounded-xl bg-surface ring-1 ring-line">
            <div className="relative aspect-[4/3]">
              <Image src={coverPhoto(eo.slug, eo.event_types, i).src} alt="" fill sizes="160px" className="object-cover" />
            </div>
            <div className="p-2.5">
              <p className="line-clamp-1 text-xs font-semibold">{eo.company_name}</p>
              <p className="mt-0.5 line-clamp-1 text-[0.65rem] text-ink-muted">{eo.city}</p>
              <p className="mt-1.5 flex items-center gap-1 text-[0.65rem]">
                <Star className="size-3" fill="var(--marigold)" stroke="var(--marigold)" aria-hidden />
                <strong>{formatRating(eo.rating)}</strong>
                <span className="text-ink-muted">({formatNumber(eo.review_count)})</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileMock({ eo }: { eo: EOCardData }) {
  return (
    <div className="h-full bg-paper">
      <div className="relative h-24">
        <Image src={coverPhoto(eo.slug, eo.event_types, 1).src} alt="" fill sizes="600px" className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-ink/60 to-transparent" />
      </div>
      <div className="relative mx-5 -mt-10 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line">
        <div className="flex items-center gap-3">
          <span className="font-display grid size-12 place-items-center rounded-xl bg-cobalt text-sm font-semibold text-white">{initials(eo.company_name)}</span>
          <div className="min-w-0">
            <p className="flex items-center gap-1 truncate font-display font-semibold">
              {eo.company_name}
              {eo.verified && <BadgeCheck className="size-4 shrink-0 text-cobalt" aria-hidden />}
            </p>
            <p className="flex items-center gap-1 text-xs text-ink-muted">
              <MapPin className="size-3" aria-hidden />
              {eo.city}
            </p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            { v: formatRating(eo.rating), l: "Rating" },
            { v: formatNumber(eo.review_count), l: "Ulasan" },
            { v: String(eo.event_types.length), l: "Jenis acara" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg bg-paper py-2">
              <p className="font-display text-sm font-semibold">{s.v}</p>
              <p className="text-[0.6rem] text-ink-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-5 mt-3 grid grid-cols-4 gap-2">
        {[0, 2, 3, 4].map((n) => (
          <div key={n} className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image src={coverPhoto(eo.slug, eo.event_types, n).src} alt="" fill sizes="120px" className="object-cover" />
          </div>
        ))}
      </div>
      <div className="mx-5 mt-3 rounded-full bg-cobalt py-2.5 text-center text-xs font-semibold text-white">Minta penawaran</div>
    </div>
  );
}

function FormMock({ eo }: { eo?: EOCardData }) {
  return (
    <div className="h-full bg-paper p-5">
      <p className="text-xs text-ink-muted">Dikirim ke</p>
      <p className="font-display text-sm font-semibold">{eo?.company_name ?? "EO pilihanmu"}</p>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <MockField label="Jenis acara" value="Corporate Event" />
        <MockField label="Lokasi" value="Hotel Mulia, Senayan" />
        <MockField label="Tanggal" value="21 Nov 2026" />
        <MockField label="Peserta" value="350 orang" />
      </div>
      <p className="mt-4 text-[0.7rem] font-medium">Perkiraan anggaran</p>
      <div className="mt-1.5 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-surface px-3 py-2 text-[0.7rem] text-ink-muted ring-1 ring-line">Rp50 – 150 juta</div>
        <div className="flex items-center gap-1.5 rounded-lg bg-cobalt-wash px-3 py-2 text-[0.7rem] font-semibold text-cobalt-deep ring-1 ring-cobalt">
          <Check className="size-3" strokeWidth={3} aria-hidden />
          Rp150 – 500 juta
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
        <Pill active>Venue</Pill>
        <Pill active>Katering</Pill>
        <Pill>Dekorasi</Pill>
        <Pill active>Sound &amp; lighting</Pill>
      </div>
      <div className="mt-4 rounded-full bg-cobalt py-2.5 text-center text-xs font-semibold text-white">Kirim permintaan</div>
    </div>
  );
}

function ChatMock({ eo }: { eo?: EOCardData }) {
  const name = eo?.company_name ?? "EO";
  return (
    <div className="flex h-full flex-col bg-[#eef1f8]">
      <div className="flex items-center gap-3 bg-ink px-4 py-3 text-white">
        <span className="font-display grid size-9 place-items-center rounded-full bg-cobalt text-xs font-semibold">{initials(name)}</span>
        <div>
          <p className="text-sm font-semibold">{name}</p>
          <p className="text-[0.65rem] text-white/60">online</p>
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-hidden p-4 text-[0.78rem] leading-relaxed">
        <Bubble side="left">
          Halo Kak Rina, terima kasih sudah mengirim permintaan lewat EO Marketplace untuk gala dinner 350 orang di Hotel Mulia.
        </Bubble>
        <Bubble side="left">
          Berikut proposal dan estimasi biaya dari kami. Kapan Kakak ada waktu untuk diskusi singkat?
          <span className="mt-2 flex items-center gap-2 rounded-lg bg-paper px-3 py-2 text-ink">
            <FileText className="size-4 text-cobalt" aria-hidden />
            <span className="font-semibold">Proposal_Gala_Dinner.pdf</span>
          </span>
        </Bubble>
        <Bubble side="right">Siap, besok jam 10 bisa ya. Terima kasih!</Bubble>
      </div>
    </div>
  );
}

function Bubble({ side, children }: { side: "left" | "right"; children: ReactNode }) {
  return (
    <div className={`flex ${side === "right" ? "justify-end" : ""}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
          side === "right" ? "rounded-br-sm bg-cobalt text-white" : "rounded-bl-sm bg-surface text-ink"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function MockField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.65rem] text-ink-muted">{label}</p>
      <p className="mt-1 truncate rounded-lg bg-surface px-3 py-2 text-[0.72rem] font-medium ring-1 ring-line">{value}</p>
    </div>
  );
}

function Pill({ active, children }: { active?: boolean; children: ReactNode }) {
  return (
    <span className={`rounded-full px-2.5 py-1 ${active ? "bg-ink text-paper" : "bg-surface text-ink-soft ring-1 ring-line"}`}>{children}</span>
  );
}
