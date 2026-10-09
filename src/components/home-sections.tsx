import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Bell, HelpCircle, Inbox, MapPin, MessageCircle, Plus } from "lucide-react";
import type { DirectoryStats } from "@/lib/eo-data";
import { formatNumber } from "@/lib/format";

export function PopularCities({ stats }: { stats: DirectoryStats }) {
  const cities = stats.cities.slice(0, 6);
  const max = cities[0]?.count ?? 1;

  return (
    <section className="border-y border-line py-20 sm:py-24" aria-labelledby="lokasi-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="lokasi-title" className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            EO di sekitar lokasi acaramu
          </h2>
          <p className="max-w-md text-ink-soft">Pilih kota untuk melihat EO yang berkantor paling dekat dengan venue acaramu.</p>
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((c, i) => (
            <li key={c.name}>
              <Link
                href={`/explore?city=${encodeURIComponent(c.name)}`}
                className={`group flex h-full flex-col justify-between rounded-3xl p-6 transition-colors ${
                  i === 0 ? "bg-ink text-paper hover:bg-cobalt-deep" : "bg-surface ring-1 ring-line hover:ring-ink"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xl font-semibold">{c.name}</p>
                    <p className={`mt-0.5 flex items-center gap-1 text-sm ${i === 0 ? "text-paper/60" : "text-ink-muted"}`}>
                      <MapPin className="size-3.5" aria-hidden />
                      {c.province}
                    </p>
                  </div>
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-full transition-colors ${
                      i === 0 ? "bg-white/10 group-hover:bg-white group-hover:text-ink" : "bg-paper group-hover:bg-ink group-hover:text-paper"
                    }`}
                  >
                    <ArrowUpRight className="size-5" aria-hidden />
                  </span>
                </div>
                <div className="mt-8">
                  <p className="font-display text-4xl font-bold tracking-tight">
                    {formatNumber(c.count)}
                    <span className={`ml-1.5 text-base font-medium ${i === 0 ? "text-paper/60" : "text-ink-muted"}`}>EO</span>
                  </p>
                  <div className={`mt-3 h-1.5 overflow-hidden rounded-full ${i === 0 ? "bg-white/15" : "bg-line"}`} aria-hidden>
                    <div className={`h-full rounded-full ${i === 0 ? "bg-white" : "bg-cobalt"}`} style={{ width: `${Math.max(8, (c.count / max) * 100)}%` }} />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ForEOs() {
  return (
    <section className="bg-surface py-20 sm:py-24" aria-labelledby="untuk-eo-title">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div className="relative order-2 lg:order-1">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-ink">
            <Image src="/portfolio/2576185.jpg" alt="" fill sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-ink/60 via-transparent to-transparent" aria-hidden />
          </div>
          <div className="absolute -bottom-6 left-4 right-4 rounded-2xl bg-surface p-4 shadow-[0_24px_48px_-20px_rgba(22,24,58,0.5)] ring-1 ring-line sm:left-6 sm:right-auto sm:w-80">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-cobalt text-white" aria-hidden>
                <Bell className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Permintaan penawaran baru</p>
                <p className="truncate text-xs text-ink-muted">Gala dinner, 350 peserta, Jakarta Pusat</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2 text-xs">
              <span className="rounded-full bg-cobalt-wash px-2.5 py-1 font-semibold text-cobalt-deep">Rp150–500 jt</span>
              <span className="rounded-full bg-paper px-2.5 py-1 text-ink-soft ring-1 ring-line">21 Nov 2026</span>
            </div>
          </div>
          <span className="absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs text-white/85 backdrop-blur">Ilustrasi</span>
        </div>

        <div className="order-1 lg:order-2">
          <h2 id="untuk-eo-title" className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Punya EO? Terima klien baru dari sini.
          </h2>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-ink-soft">
            Daftarkan EO-mu, lengkapi profil, dan terima permintaan penawaran dari klien yang sudah tahu tanggal, lokasi, dan anggarannya.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              { icon: <Inbox className="size-5" />, title: "Lead yang siap dibahas", body: "Setiap permintaan berisi detail acara lengkap, bukan sekadar nomor telepon." },
              { icon: <MessageCircle className="size-5" />, title: "Langsung ke WhatsApp", body: "Lead diteruskan ke WhatsApp tim sales-mu agar bisa direspons cepat." },
              { icon: <BadgeCheck className="size-5" />, title: "Badge terverifikasi", body: "Profil yang lolos peninjauan tampil lebih atas di hasil pencarian." },
            ].map((b) => (
              <li key={b.title} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-cobalt-wash text-cobalt" aria-hidden>
                  {b.icon}
                </span>
                <div>
                  <p className="font-semibold">{b.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{b.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/daftar-eo" className="inline-flex h-12 items-center rounded-full bg-ink px-6 font-semibold text-paper transition-colors hover:bg-cobalt">
              Daftarkan EO gratis
            </Link>
            <span className="text-sm text-ink-muted">Tanpa biaya selama masa peluncuran.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "Apakah klien dikenai biaya?",
    a: "Tidak. Mencari EO, membandingkan profil, dan mengirim permintaan penawaran sepenuhnya gratis untuk klien. Harga acara dibahas langsung dengan EO.",
  },
  {
    q: "Berapa lama EO akan menghubungi saya?",
    a: "Umumnya 1–2 hari kerja. Jika EO yang kamu pilih belum merespons, tim kami membantu meneruskan atau mencarikan EO lain yang sesuai.",
  },
  {
    q: "Bisakah saya meminta penawaran ke beberapa EO sekaligus?",
    a: "Bisa. Tekan tombol “Bandingkan” di kartu EO, pilih hingga 3 EO, lalu kirim satu formulir ke semuanya. Setiap EO menerima permintaan yang sama.",
  },
  {
    q: "Apa arti badge “Terverifikasi”?",
    a: "Badge diberikan setelah tim kami memeriksa identitas usaha dan kontak EO. EO tanpa badge tetap bisa dihubungi, tetapi datanya masih bersumber dari informasi publik.",
  },
  {
    q: "Bagaimana data saya digunakan?",
    a: "Data kontak dan kebutuhan acaramu hanya dibagikan ke EO yang kamu pilih, atau ke EO yang kami cocokkan bila kamu belum memilih.",
  },
  {
    q: "Saya pemilik EO, bagaimana cara bergabung?",
    a: "Isi formulir di halaman Daftarkan EO. Setelah ditinjau, profilmu tampil di direktori dan mulai bisa menerima permintaan penawaran.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-line py-20 sm:py-24" aria-labelledby="faq-title">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <span className="inline-flex items-center gap-2 rounded-full bg-cobalt-wash px-3 py-1 text-sm font-medium text-cobalt-deep">
            <HelpCircle className="size-4" aria-hidden />
            Bantuan
          </span>
          <h2 id="faq-title" className="font-display mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Pertanyaan yang sering diajukan
          </h2>
          <p className="mt-4 max-w-sm text-ink-soft">Jawaban singkat untuk hal yang paling sering ditanyakan klien dan pemilik EO.</p>

          <div className="relative mt-8 overflow-hidden rounded-3xl bg-ink p-6 text-paper">
            <div className="absolute -right-10 -top-10 size-40 rounded-full bg-cobalt/40 blur-2xl" aria-hidden />
            <div className="relative">
              <div className="flex -space-x-2" aria-hidden>
                {["RK", "AP", "DH"].map((i) => (
                  <span key={i} className="font-display grid size-10 place-items-center rounded-full bg-cobalt text-xs font-semibold ring-2 ring-ink">
                    {i}
                  </span>
                ))}
              </div>
              <p className="font-display mt-4 text-lg font-semibold">Masih ada pertanyaan?</p>
              <p className="mt-1 text-sm leading-relaxed text-paper/70">Kirim pertanyaan atau kebutuhan acaramu, tim kami membantu di jam kerja.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/request" className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-ink hover:bg-cobalt hover:text-white">
                  <MessageCircle className="size-4" aria-hidden />
                  Hubungi tim kami
                </Link>
                <Link href="/explore" className="inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold ring-1 ring-white/25 hover:bg-white/10">
                  Cari EO
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <details
              key={f.q}
              open={i === 0}
              className="group rounded-2xl bg-surface ring-1 ring-line transition-[box-shadow,background-color] open:bg-surface open:shadow-[0_20px_40px_-28px_rgba(22,24,58,0.45)] open:ring-cobalt/30"
            >
              <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-5 sm:px-6 [&::-webkit-details-marker]:hidden">
                <span className="font-display grid size-10 shrink-0 place-items-center rounded-xl bg-paper text-sm font-semibold text-ink-muted transition-colors group-open:bg-cobalt group-open:text-white">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display flex-1 text-base font-semibold sm:text-lg">{f.q}</span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full ring-1 ring-line transition-transform duration-300 group-open:rotate-45 group-open:bg-ink group-open:text-paper group-open:ring-ink" aria-hidden>
                  <Plus className="size-4" />
                </span>
              </summary>
              <p className="pb-5 pl-[4.75rem] pr-6 leading-relaxed text-ink-soft sm:pl-[5rem]">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
