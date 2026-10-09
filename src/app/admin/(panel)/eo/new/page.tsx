import type { Metadata } from "next";
import Link from "next/link";
import { EOForm } from "@/components/admin/eo-form";

export const metadata: Metadata = { title: "Tambah EO" };

export default function NewEOPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/eo" className="text-sm text-ink-muted hover:text-ink">
        Kelola EO
      </Link>
      <h1 className="font-display mt-2 text-3xl font-bold tracking-tight">Tambah EO</h1>
      <div className="mt-8">
        <EOForm eo={null} />
      </div>
    </div>
  );
}
