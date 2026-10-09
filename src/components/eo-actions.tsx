"use client";

import { usePathname, useRouter } from "next/navigation";
import { Check, Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCompare } from "@/lib/compare-store";
import { useFavorites } from "@/lib/favorites-store";

export function FavoriteButton({ id, name, variant = "overlay" }: { id: string; name: string; variant?: "overlay" | "outline" }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isFavorite, toggle, status } = useFavorites();
  const on = isFavorite(id);

  const base =
    variant === "overlay"
      ? `grid size-9 place-items-center rounded-full backdrop-blur-md transition-colors ${on ? "bg-white text-danger" : "bg-black/30 text-white hover:bg-white hover:text-ink"}`
      : `inline-flex h-12 items-center gap-2 rounded-full px-5 font-semibold ring-1 transition-colors ${on ? "text-danger ring-danger/40 bg-danger/5" : "text-ink ring-line-strong hover:bg-paper hover:ring-ink"}`;

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Hapus ${name} dari tersimpan` : `Simpan ${name}`}
      disabled={status === "loading"}
      onClick={async () => {
        const ok = await toggle(id);
        if (!ok) {
          toast("Masuk dulu untuk menyimpan EO favorit.");
          router.push(`/masuk?next=${encodeURIComponent(pathname)}`);
          return;
        }
        toast.success(on ? "Dihapus dari EO tersimpan." : "Disimpan ke EO tersimpan.");
      }}
      className={`relative z-10 ${base}`}
    >
      <Heart className="size-[18px]" fill={on ? "currentColor" : "none"} aria-hidden />
      {variant === "outline" && (on ? "Tersimpan" : "Simpan")}
    </button>
  );
}

export function CompareButton({ slug, name, variant = "chip" }: { slug: string; name: string; variant?: "chip" | "outline" }) {
  const { has, toggle, full } = useCompare();
  const on = has(slug);
  const disabled = !on && full;

  const cls =
    variant === "chip"
      ? `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
          on ? "bg-cobalt text-white" : "bg-paper text-ink-soft ring-1 ring-line hover:text-ink hover:ring-line-strong"
        }`
      : `inline-flex h-12 items-center gap-2 rounded-full px-5 font-semibold ring-1 transition-colors ${
          on ? "bg-cobalt-wash text-cobalt-deep ring-cobalt/40" : "text-ink ring-line-strong hover:bg-paper hover:ring-ink"
        }`;

  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      title={disabled ? "Maksimal 3 EO untuk dibandingkan" : undefined}
      onClick={() => {
        toggle({ slug, name });
        if (!on) toast.success(`${name} ditambahkan ke perbandingan.`);
      }}
      className={`relative z-10 disabled:cursor-not-allowed disabled:opacity-50 ${cls}`}
    >
      {on ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : <Plus className="size-3.5" strokeWidth={3} aria-hidden />}
      {on ? "Dibandingkan" : "Bandingkan"}
    </button>
  );
}
