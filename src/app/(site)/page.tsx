import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { CategoryBento } from "@/components/category-bento";
import { EOPass } from "@/components/eo-pass";
import { HowItWorks } from "@/components/how-it-works";
import { FAQ, ForEOs, PopularCities } from "@/components/home-sections";
import { EVENT_TYPES } from "@/lib/constants";
import { getDirectoryStats, getFeaturedEOs } from "@/lib/eo-data";
import { formatNumber, formatRating } from "@/lib/format";
import heroImage from "../../../public/hero-event.jpg";

export default async function HomePage() {
  const [featured, stats] = await Promise.all([getFeaturedEOs(8), getDirectoryStats()]);

  return (
    <>
      <section className="relative -mt-16 overflow-hidden bg-ink text-white lg:-mt-20">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-[center_40%]"
        />
        <div className="absolute inset-0 bg-linear-to-r from-ink/92 via-ink/65 to-ink/25" aria-hidden />
        <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-transparent to-ink/55" aria-hidden />

        <div className="relative mx-auto flex min-h-[640px] max-w-7xl flex-col px-4 pt-16 sm:px-6 lg:min-h-[min(100svh,880px)] lg:pt-20">
          <div className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1.25fr_1fr] lg:gap-16 lg:py-20">
            <div>
              <h1 className="font-poppins max-w-[18ch] text-[clamp(2.3rem,4.4vw,3.6rem)] font-semibold leading-[1.18] tracking-[-0.01em]">
                Temukan event organizer yang tepat untuk acaramu
              </h1>
              <p className="font-poppins mt-6 max-w-[52ch] text-base leading-relaxed text-white/80 sm:text-[1.05rem]">
                Bandingkan profil, rating, dan spesialisasi EO di Jakarta dan sekitarnya. Kirim kebutuhan sekali, EO pilihanmu yang
                menghubungi.
              </p>
              <div className="font-poppins mt-9 flex flex-wrap gap-3 text-[0.95rem]">
                <Link href="/explore" className="inline-flex items-center rounded-full bg-white px-6 py-3 font-medium text-ink transition-colors hover:bg-cobalt hover:text-white">
                  Jelajahi semua EO
                </Link>
                <Link
                  href="/#cara-kerja"
                  className="inline-flex items-center rounded-full px-6 py-3 font-medium text-white ring-1 ring-white/40 transition-colors hover:bg-white/10 hover:ring-white"
                >
                  Lihat cara kerja
                </Link>
              </div>
            </div>

            <form
              action="/explore"
              className="w-full rounded-3xl bg-surface p-6 text-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] sm:p-7 lg:justify-self-end lg:max-w-md"
            >
              <h2 className="font-display text-xl font-semibold">Cari EO untuk acaramu</h2>
              <p className="mt-1 text-sm text-ink-muted">Saring dari {formatNumber(stats.total)} EO terdaftar.</p>
              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">Jenis acara</span>
                  <select name="type" defaultValue="" className="field h-12">
                    <option value="">Semua jenis acara</option>
                    {EVENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">Lokasi</span>
                  <select name="city" defaultValue="" className="field h-12">
                    <option value="">Semua kota</option>
                    {stats.cities.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">Nama EO</span>
                  <span className="relative block">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
                    <input name="q" type="search" placeholder="Opsional, contoh: wedding planner" className="field h-12 pl-10" />
                  </span>
                </label>
              </div>
              <button type="submit" className="mt-6 h-12 w-full rounded-full bg-cobalt font-semibold text-white transition-colors hover:bg-cobalt-deep">
                Cari EO
              </button>
            </form>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/15 py-7 sm:grid-cols-4">
            {[
              { value: formatNumber(stats.total), label: "EO terdaftar" },
              { value: formatNumber(stats.cities.length), label: "kota di Jabodetabek" },
              { value: stats.avgRating ? formatRating(stats.avgRating) : "–", label: "rata-rata rating" },
              { value: `${formatNumber(Math.floor(stats.totalReviews / 1000) * 1000)}+`, label: "ulasan klien di Google" },
            ].map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-3xl font-bold tracking-tight">{s.value}</dd>
                <dd className="mt-0.5 text-sm text-white/60">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="kategori" className="scroll-mt-16 bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display max-w-[20ch] text-3xl font-bold tracking-tight sm:text-4xl">Mulai dari jenis acaramu</h2>
            <p className="max-w-sm text-ink-soft">Pilih jenis acara untuk melihat EO yang biasa menanganinya.</p>
          </div>
          <div className="mt-10">
            <CategoryBento stats={stats} />
          </div>
        </div>
      </section>

      <section className="border-y border-line py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Paling banyak diulas</h2>
              <p className="mt-2 max-w-md text-ink-soft">EO dengan rating tinggi dari ratusan ulasan klien di Google Maps.</p>
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-semibold transition-colors hover:border-ink"
            >
              Lihat semua {formatNumber(stats.total)} EO
            </Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((eo, i) => (
              <EOPass key={eo.id} eo={eo} priority={i < 4} position={i} />
            ))}
          </div>
        </div>
      </section>

      <section id="cara-kerja" className="scroll-mt-20 bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display max-w-[18ch] text-3xl font-bold tracking-tight sm:text-4xl">Cara kerjanya sederhana</h2>
            <p className="max-w-md text-ink-soft">Tidak perlu akun. Kirim kebutuhan sekali, tim kami pastikan EO menerimanya dan menghubungimu.</p>
          </div>

          <div className="mt-12">
            <HowItWorks eos={featured.slice(0, 3)} total={stats.total} />
          </div>
        </div>
      </section>

      <PopularCities stats={stats} />
      <ForEOs />
      <FAQ />

      <section className="pt-20 sm:pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[28px] bg-cobalt px-6 py-14 text-white sm:px-12">
            <div
              className="absolute inset-y-0 right-0 hidden w-1/3 sm:block"
              style={{
                background:
                  "repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0 14px, transparent 14px 28px)",
                maskImage: "linear-gradient(90deg, transparent, #000 70%)",
                WebkitMaskImage: "linear-gradient(90deg, transparent, #000 70%)",
                opacity: 0.55,
              }}
              aria-hidden
            />
            <div className="relative max-w-xl">
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Belum tahu EO mana yang cocok?</h2>
              <p className="mt-4 text-lg text-white/80">
                Kirim kebutuhan acaramu tanpa memilih EO. Tim kami mencocokkan dengan EO yang sesuai jenis acara, lokasi, dan anggaranmu.
              </p>
              <Link
                href="/request"
                className="mt-8 inline-flex items-center rounded-full bg-white px-6 py-3 font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
              >
                Kirim kebutuhan acara
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
