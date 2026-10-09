import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center px-4 py-24 sm:px-6">
        <p className="font-display text-7xl font-bold tracking-tight text-line-strong">404</p>
        <h1 className="font-display mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Halaman ini tidak ditemukan</h1>
        <p className="mt-3 max-w-md text-ink-soft">
          EO yang kamu cari mungkin sudah tidak aktif atau alamatnya berubah. Cari lewat direktori untuk menemukan yang serupa.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/explore" className="rounded-full bg-ink px-6 py-3 font-semibold text-paper hover:bg-cobalt">
            Buka direktori EO
          </Link>
          <Link href="/" className="rounded-full border border-line-strong px-6 py-3 font-semibold hover:border-ink">
            Ke beranda
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
