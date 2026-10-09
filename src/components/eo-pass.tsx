import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { eventTypeColor } from "@/lib/constants";
import { formatNumber, formatRating } from "@/lib/format";
import { coverPhoto } from "@/lib/sample-photos";
import type { EOCardData } from "@/lib/types";
import { EOAvatar } from "./eo-avatar";
import { CompareButton, FavoriteButton } from "./eo-actions";

/** Thin accent split between the EO's categories (used on profile and request pages). */
export function strapGradient(types: string[]): string {
  const list = types.length ? types : ["Corporate Event"];
  const step = 100 / list.length;
  const stops = list.map((t, i) => `${eventTypeColor(t)} ${i * step}% ${(i + 1) * step}%`);
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

export function EOPass({ eo, priority = false, position }: { eo: EOCardData; priority?: boolean; position?: number }) {
  const cover = coverPhoto(eo.slug, eo.event_types, position);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[box-shadow,border-color] duration-300 hover:border-line-strong hover:shadow-[0_24px_48px_-28px_rgba(22,24,58,0.45)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-line">
        <Image
          src={cover.src}
          alt=""
          fill
          sizes="(min-width: 1280px) 320px, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-ink/55 via-transparent to-transparent" aria-hidden />
        {eo.verified && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-cobalt-deep">
            <BadgeCheck className="size-3.5" aria-hidden />
            Terverifikasi
          </span>
        )}
        <span className="absolute bottom-2.5 right-3 text-[0.65rem] font-medium text-white/75">Foto ilustrasi</span>
        <span className="absolute right-3 top-3">
          <FavoriteButton id={eo.id} name={eo.company_name} />
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5">
        <div className="-mt-7 mb-3">
          <span className="inline-block rounded-[14px] bg-surface p-1">
            <EOAvatar name={eo.company_name} logo={eo.logo} primaryType={eo.event_types[0]} size="sm" />
          </span>
        </div>
        <h3 className="font-display line-clamp-2 text-[1.05rem] font-semibold leading-snug text-ink">
          <Link
            href={`/eo/${eo.slug}`}
            prefetch={priority ? true : undefined}
            className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none"
          >
            {eo.company_name}
          </Link>
        </h3>
        {eo.city && (
          <p className="mt-1 flex items-center gap-1 text-sm text-ink-soft">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            {eo.city}
          </p>
        )}
        <p className="mt-3 line-clamp-1 text-sm text-ink-muted">{eo.event_types.join(", ") || "Event organizer"}</p>

        <div className="mt-auto pt-5">
        <div className="flex items-center justify-between gap-2 border-t border-line pt-4">
          {eo.rating != null ? (
            <span className="inline-flex items-center gap-1.5 text-sm">
              <Star className="size-4" fill="var(--marigold)" stroke="var(--marigold)" aria-hidden />
              <span className="font-semibold text-ink">{formatRating(eo.rating)}</span>
              <span className="text-ink-muted">({formatNumber(eo.review_count)})</span>
            </span>
          ) : (
            <span className="text-sm text-ink-muted">Belum ada rating</span>
          )}
          <CompareButton slug={eo.slug} name={eo.company_name} />
        </div>
        </div>
      </div>
    </article>
  );
}
