"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { COMPARE_MAX, useCompare } from "@/lib/compare-store";
import { initials } from "@/lib/format";

/** Floating bar listing EOs picked for comparison; hidden on pages where it would get in the way. */
export function CompareTray() {
  const pathname = usePathname();
  const { items, remove, clear } = useCompare();
  if (items.length === 0 || pathname.startsWith("/bandingkan") || pathname.startsWith("/request")) return null;

  const slugs = items.map((i) => i.slug).join(",");

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 px-4 pb-[env(safe-area-inset-bottom)] lg:bottom-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl bg-ink p-3 text-paper shadow-[0_24px_60px_-20px_rgba(10,12,40,0.8)] ring-1 ring-white/10 sm:flex-row sm:items-center sm:p-3 sm:pl-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="hidden text-sm font-semibold sm:inline">
            {items.length}/{COMPARE_MAX}
          </span>
          <ul className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
            {items.map((item) => (
              <li key={item.slug} className="flex shrink-0 items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-2 text-sm">
                <span className="font-display grid size-7 place-items-center rounded-full bg-cobalt text-[0.65rem] font-semibold">{initials(item.name)}</span>
                <span className="max-w-32 truncate">{item.name}</span>
                <button type="button" onClick={() => remove(item.slug)} className="text-paper/60 hover:text-white" aria-label={`Hapus ${item.name}`}>
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={clear} className="px-2 text-xs text-paper/60 hover:text-white">
            Kosongkan
          </button>
          <Link
            href={`/request?eo=${slugs}`}
            className="hidden h-10 items-center rounded-full px-4 text-sm font-semibold ring-1 ring-white/25 hover:bg-white/10 sm:inline-flex"
          >
            Minta penawaran ke semua
          </Link>
          <Link
            href={`/bandingkan?eo=${slugs}`}
            aria-disabled={items.length < 2}
            className={`inline-flex h-10 flex-1 items-center justify-center rounded-full px-5 text-sm font-semibold sm:flex-none ${
              items.length < 2 ? "pointer-events-none bg-white/20 text-paper/60" : "bg-white text-ink hover:bg-cobalt hover:text-white"
            }`}
          >
            {items.length < 2 ? "Pilih 1 EO lagi" : `Bandingkan ${items.length} EO`}
          </Link>
        </div>
      </div>
    </div>
  );
}
