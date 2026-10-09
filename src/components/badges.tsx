import { BadgeCheck, Star } from "lucide-react";
import { formatNumber, formatRating } from "@/lib/format";

export function VerifiedBadge({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <span title="Terverifikasi" className="inline-flex text-cobalt">
        <BadgeCheck className="size-[18px]" aria-hidden />
        <span className="sr-only">Terverifikasi</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-cobalt-wash px-2.5 py-1 text-xs font-semibold text-cobalt-deep">
      <BadgeCheck className="size-3.5" aria-hidden />
      Terverifikasi
    </span>
  );
}

export function Rating({ rating, reviews, size = "sm" }: { rating: number | null; reviews: number; size?: "sm" | "lg" }) {
  if (rating == null) {
    return <span className="text-sm text-ink-muted">Belum ada rating</span>;
  }
  const big = size === "lg";
  return (
    <span className="inline-flex items-center gap-1.5">
      <Star className={big ? "size-5" : "size-4"} fill="var(--marigold)" stroke="var(--marigold)" aria-hidden />
      <span className={`font-semibold text-ink ${big ? "text-lg" : "text-sm"}`}>{formatRating(rating)}</span>
      <span className={`text-ink-muted ${big ? "text-sm" : "text-xs"}`}>({formatNumber(reviews)} ulasan)</span>
    </span>
  );
}

export function TypeChip({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-paper px-3 py-1 text-xs font-medium text-ink-soft ring-1 ring-line">
      {type}
    </span>
  );
}
