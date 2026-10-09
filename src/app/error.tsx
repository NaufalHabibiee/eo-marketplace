"use client";

import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start justify-center px-4 py-24 sm:px-6">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Halaman gagal dimuat</h1>
      <p className="mt-3 max-w-md text-ink-soft">
        Koneksi ke server data sedang bermasalah. Coba muat ulang; jika masih gagal, tunggu beberapa menit.
      </p>
      {error.digest && <p className="mt-2 text-xs text-ink-muted">Kode: {error.digest}</p>}
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="rounded-full bg-ink px-6 py-3 font-semibold text-paper hover:bg-cobalt">
          Muat ulang
        </button>
        <Link href="/" className="rounded-full border border-line-strong px-6 py-3 font-semibold hover:border-ink">
          Ke beranda
        </Link>
      </div>
    </main>
  );
}
