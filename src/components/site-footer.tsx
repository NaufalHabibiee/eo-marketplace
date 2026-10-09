import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUp, Search } from "lucide-react";
import { EVENT_TYPES } from "@/lib/constants";
import { getDirectoryStats } from "@/lib/eo-data";
import { formatNumber } from "@/lib/format";
import { BrandMark } from "./site-chrome";

export async function SiteFooter() {
  const stats = await getDirectoryStats();
  const cities = stats.cities.slice(0, 5);

  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="h-1 bg-linear-to-r from-cobalt-deep via-cobalt to-cobalt-deep" aria-hidden />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <section className="grid items-center gap-8 border-b border-white/10 py-14 lg:grid-cols-[1fr_1.15fr] lg:gap-16" aria-labelledby="footer-search">
          <div>
            <h2 id="footer-search" className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Cari EO untuk acara berikutnya
            </h2>
            <p className="mt-3 max-w-md text-paper/65">
              {formatNumber(stats.total)} event organizer di {stats.cities.length} kota siap menerima kebutuhan acaramu.
            </p>
          </div>
          <div>
            <form action="/explore" role="search" className="flex flex-col gap-2 rounded-2xl bg-white/5 p-2 ring-1 ring-white/10 focus-within:ring-cobalt sm:flex-row">
              <label className="relative flex-1">
                <span className="sr-only">Nama EO atau kota</span>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-paper/45" aria-hidden />
                <input
                  name="q"
                  type="search"
                  placeholder="Nama EO atau kota"
                  className="h-12 w-full rounded-xl bg-transparent pl-11 pr-3 text-paper outline-none placeholder:text-paper/45"
                />
              </label>
              <label className="sm:w-44">
                <span className="sr-only">Jenis acara</span>
                <select
                  name="type"
                  defaultValue=""
                  className="h-12 w-full cursor-pointer rounded-xl bg-white/10 px-3 text-sm text-paper outline-none focus-visible:ring-2 focus-visible:ring-cobalt [&>option]:text-ink"
                >
                  <option value="">Semua acara</option>
                  {EVENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="h-12 rounded-xl bg-cobalt px-6 font-semibold text-white transition-colors hover:bg-white hover:text-ink">
                Cari
              </button>
            </form>
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Kota populer">
              {cities.map((c) => (
                <li key={c.name}>
                  <Link
                    href={`/explore?city=${encodeURIComponent(c.name)}`}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-paper/75 ring-1 ring-white/15 transition-colors hover:bg-white hover:text-ink"
                  >
                    {c.name}
                    <span className="text-xs opacity-60">{c.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5" aria-label="EO Marketplace, ke beranda">
              <BrandMark className="size-8" tone="light" />
              <span className="font-display text-lg font-bold tracking-tight">
                EO<span className="font-medium text-paper/60"> Marketplace</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-paper/60">
              Direktori event organizer Jabodetabek. Bandingkan profil, lalu kirim kebutuhan acaramu ke EO yang paling cocok.
            </p>
            <Link
              href="/request"
              className="mt-6 inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-cobalt hover:text-white"
            >
              Minta penawaran
            </Link>
          </div>

          <FooterColumn title="Jenis acara">
            {EVENT_TYPES.slice(0, 6).map((t) => (
              <FooterLink key={t.value} href={`/explore?type=${encodeURIComponent(t.value)}`}>
                {t.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Kota">
            {stats.cities.slice(0, 6).map((c) => (
              <FooterLink key={c.name} href={`/explore?city=${encodeURIComponent(c.name)}`}>
                {c.name}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Platform">
            <FooterLink href="/explore">Semua EO</FooterLink>
            <FooterLink href="/request">Minta penawaran</FooterLink>
            <FooterLink href="/#cara-kerja">Cara kerja</FooterLink>
            <FooterLink href="/bandingkan">Bandingkan EO</FooterLink>
            <FooterLink href="/#faq">FAQ</FooterLink>
            <FooterLink href="/daftar-eo">Daftarkan EO</FooterLink>
            <FooterLink href="/admin">Masuk admin</FooterLink>
          </FooterColumn>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-xs text-paper/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 EO Marketplace. Data profil awal bersumber dari informasi publik Google Maps.</p>
          <a
            href="#"
            className="inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 font-medium text-paper/70 ring-1 ring-white/15 transition-colors hover:bg-white hover:text-ink sm:self-auto"
          >
            <ArrowUp className="size-3.5" aria-hidden />
            Kembali ke atas
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-sm font-semibold text-paper">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm">{children}</ul>
    </nav>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-paper/60 transition-colors hover:text-white">
        {children}
      </Link>
    </li>
  );
}
