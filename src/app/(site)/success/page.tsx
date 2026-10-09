import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Check, MessageCircle } from "lucide-react";
import { strapGradient } from "@/components/eo-pass";
import { getEOBySlug } from "@/lib/eo-data";
import { whatsappLink } from "@/lib/format";

export const metadata: Metadata = {
  title: "Permintaan terkirim",
  robots: { index: false },
};

export default function SuccessPage(props: PageProps<"/success">) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-14 sm:px-6 sm:pt-20">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-[28px] bg-line/40" aria-busy="true" />}>
        <SuccessContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function SuccessContent({ searchParams }: Pick<PageProps<"/success">, "searchParams">) {
  const params = await searchParams;
  const ref = typeof params.ref === "string" && /^[A-Z0-9]{4,12}$/.test(params.ref) ? params.ref : null;
  const slugs = typeof params.eo === "string" ? params.eo.split(",").map((s) => s.trim().slice(0, 120)).filter(Boolean).slice(0, 3) : [];
  const eos = (await Promise.all(slugs.map((s) => getEOBySlug(s)))).filter((e) => e !== null);
  const eo = eos[0] ?? null;
  const chats = eos
    .map((e) => ({
      name: e.company_name,
      href: whatsappLink(e.phone, `Halo ${e.company_name}, saya baru mengirim permintaan penawaran lewat EO Marketplace${ref ? ` (ref ${ref})` : ""}. Boleh dibantu?`),
    }))
    .filter((c): c is { name: string; href: string } => c.href !== null);

  return (
    <>
      <div className="overflow-hidden rounded-[28px] border border-line bg-surface">
        <div className="h-4" style={{ background: strapGradient(eo?.event_types ?? ["Corporate Event", "Wedding", "Conference", "Festival"]) }} />
        <div className="px-6 py-10 sm:px-12">
          <span className="grid size-14 place-items-center rounded-full bg-cobalt text-white">
            <Check className="size-7" strokeWidth={3} aria-hidden />
          </span>
          <h1 className="font-display mt-6 text-4xl font-bold tracking-tight sm:text-5xl">Permintaan terkirim.</h1>
          <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-ink-soft">
            {eos.length > 1
              ? `Kebutuhan acaramu sudah dikirim ke ${eos.length} EO: ${eos.map((e) => e.company_name).join(", ")}. Mereka akan menghubungimu lewat WhatsApp atau email.`
              : eo
              ? `Kebutuhan acaramu sudah tercatat untuk ${eo.company_name}. Mereka akan menghubungimu lewat WhatsApp atau email.`
              : "Kebutuhan acaramu sudah tercatat. Tim kami akan mencocokkan dengan EO yang sesuai dan mereka akan menghubungimu."}
          </p>
        </div>
        <div className="perforation" aria-hidden />
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-12">
          <div>
            <p className="text-sm text-ink-muted">Nomor referensi</p>
            <p className="font-display text-2xl font-bold tracking-wider">{ref ?? "—"}</p>
          </div>
          {chats.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {chats.map((c) => (
                <a
                  key={c.href}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper hover:bg-cobalt"
                >
                  <MessageCircle className="size-4" aria-hidden />
                  Chat {c.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold">Setelah ini</h2>
        <ol className="mt-4 space-y-4">
          {[
            "EO meninjau tanggal, lokasi, dan anggaranmu.",
            "EO menghubungimu dalam 1–2 hari kerja untuk diskusi kebutuhan.",
            "Kamu menerima penawaran dan bebas membandingkan dengan EO lain.",
          ].map((text, i) => (
            <li key={text} className="flex gap-4">
              <span className="font-display grid size-7 shrink-0 place-items-center rounded-full border border-line-strong text-sm font-semibold">
                {i + 1}
              </span>
              <span className="pt-0.5 text-ink-soft">{text}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/explore" className="rounded-full bg-ink px-6 py-3 font-semibold text-paper hover:bg-cobalt">
          Bandingkan EO lain
        </Link>
        <Link href="/" className="rounded-full border border-line-strong px-6 py-3 font-semibold hover:border-ink">
          Ke beranda
        </Link>
      </div>
    </>
  );
}
