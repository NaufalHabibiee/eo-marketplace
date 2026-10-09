import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EVENT_TYPES } from "@/lib/constants";
import type { DirectoryStats } from "@/lib/eo-data";
import { formatNumber } from "@/lib/format";

const PHOTOS: Record<string, string> = {
  "Corporate Event": "/portfolio/3884732.jpg",
  Entertainment: "/portfolio/1853662.jpg",
  Wedding: "/portfolio/1854074.jpg",
  Conference: "/portfolio/1597531.jpg",
  Exhibition: "/portfolio/1853361.jpg",
  "Government Event": "/portfolio/7693055.jpg",
  Festival: "/portfolio/1850119.jpg",
};

export function CategoryBento({ stats }: { stats: DirectoryStats }) {
  const types = [...EVENT_TYPES].sort((a, b) => (stats.typeCounts[b.value] ?? 0) - (stats.typeCounts[a.value] ?? 0));

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:auto-rows-[220px] lg:grid-cols-4">
      {types.map((t, i) => {
        const count = stats.typeCounts[t.value] ?? 0;
        const size = i === 0 ? "big" : i === 1 ? "wide" : "small";
        const span = size === "big" ? "min-h-72 sm:col-span-2 lg:row-span-2" : size === "wide" ? "min-h-56 sm:col-span-2" : "min-h-56";
        const soon = count === 0;

        return (
          <Link
            key={t.value}
            href={`/explore?type=${encodeURIComponent(t.value)}`}
            className={`group relative isolate flex flex-col justify-between overflow-hidden rounded-3xl bg-ink p-6 text-white ${span}`}
          >
            <Image
              src={PHOTOS[t.value]}
              alt=""
              fill
              sizes={size === "big" ? "(min-width: 1024px) 620px, 100vw" : "(min-width: 1024px) 310px, 50vw"}
              className={`-z-10 object-cover transition-transform duration-700 group-hover:scale-105 ${soon ? "grayscale" : ""}`}
            />
            <div
              className={`absolute inset-0 -z-10 bg-linear-to-t ${soon ? "from-ink via-ink/85 to-ink/60" : "from-ink/95 via-ink/45 to-ink/10"}`}
              aria-hidden
            />

            <span className="flex items-start justify-between gap-3">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-md">
                {soon ? "Segera hadir" : `${formatNumber(count)} EO`}
              </span>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur-md transition-colors group-hover:bg-white group-hover:text-ink">
                <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:rotate-45" aria-hidden />
              </span>
            </span>

            <span>
              <span className={`font-display block font-semibold leading-tight ${size === "big" ? "text-3xl sm:text-4xl" : "text-xl"}`}>{t.label}</span>
              <span className={`mt-1.5 block text-white/75 ${size === "big" ? "text-base" : "text-sm"}`}>{t.blurb}</span>
            </span>
          </Link>
        );
      })}

      <Link
        href="/request"
        className="group relative flex min-h-56 flex-col justify-between overflow-hidden rounded-3xl bg-cobalt p-6 text-white transition-colors hover:bg-cobalt-deep"
      >
        <span className="font-display text-xl font-semibold leading-tight">Jenis acaramu tidak ada di sini?</span>
        <span className="flex items-end justify-between gap-3">
          <span className="text-sm text-white/80">Ceritakan saja, kami carikan EO yang cocok.</span>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-ink">
            <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:rotate-45" aria-hidden />
          </span>
        </span>
      </Link>
    </div>
  );
}
