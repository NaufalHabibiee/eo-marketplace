import type { ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "../site-chrome";

const SPHERE =
  "radial-gradient(circle at 30% 25%, #5b77ff 0%, #2c4bff 38%, #1b2fb8 72%, #121f80 100%)";

function Sphere({ className }: { className: string }) {
  return (
    <span
      className={`absolute rounded-full shadow-[0_30px_60px_-20px_rgba(10,16,70,0.7)] ${className}`}
      style={{ background: SPHERE }}
      aria-hidden
    />
  );
}

/** Split auth layout: blue welcome panel with spheres on the left, form card on the right. */
export function AuthShell({
  welcome,
  headline,
  blurb,
  children,
}: {
  welcome: string;
  headline: string;
  blurb: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper px-4 py-10 sm:px-6">
      <Sphere className="-bottom-24 -right-24 hidden size-72 lg:block" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[32px] bg-surface shadow-[0_40px_90px_-50px_rgba(22,24,58,0.55)] ring-1 ring-line grid-cols-1 lg:grid-cols-[1fr_1.05fr]">
        <div className="relative isolate overflow-hidden bg-cobalt-deep px-8 py-12 text-white sm:px-12 lg:min-h-[600px] lg:py-16">
          <Sphere className="-left-40 -top-48 -z-10 size-[560px]" />
          <Sphere className="-bottom-28 left-24 -z-10 size-72" />
          <Sphere className="-bottom-40 -left-24 -z-10 size-64 opacity-90" />

          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="EO Marketplace, ke beranda">
            <BrandMark className="size-9" tone="light" />
            <span className="font-display text-lg font-semibold">EO Marketplace</span>
          </Link>

          <div className="mt-14 max-w-sm lg:mt-24">
            <p className="font-display text-4xl font-bold uppercase tracking-wide sm:text-5xl">{welcome}</p>
            <p className="font-display mt-3 text-base font-semibold uppercase tracking-wider text-white/85">{headline}</p>
            <p className="mt-5 text-sm leading-relaxed text-white/75">{blurb}</p>
          </div>
        </div>

        <div className="flex min-w-0 items-center px-6 py-10 sm:px-12 lg:py-14">
          <div className="w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
