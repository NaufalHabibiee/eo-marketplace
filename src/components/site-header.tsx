"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { AccountMenu } from "./auth/account-menu";
import { BrandMark } from "./site-chrome";

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const isScrolled = () => window.scrollY > 24;
const serverScrolled = () => false;

const NAV = [
  { href: "/", label: "Beranda" },
  { href: "/explore", label: "Cari EO" },
  { href: "/#cara-kerja", label: "Cara kerja" },
  { href: "/daftar-eo", label: "Untuk EO" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(subscribe, isScrolled, serverScrolled);
  // Only the homepage has a photo hero for the bar to sit on.
  const overlay = pathname === "/" && !scrolled;

  const link = overlay ? "text-white/80 hover:text-white" : "text-ink-soft hover:text-ink";
  const activeLink = overlay ? "text-white" : "text-ink";

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
        overlay
          ? "border-transparent bg-transparent"
          : "border-line/70 bg-paper/90 shadow-[0_8px_24px_-20px_rgba(22,24,58,0.5)] backdrop-blur-md"
      }`}
    >
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:gap-4 px-4 sm:px-6 lg:h-20 lg:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="flex min-w-0 items-center gap-2 justify-self-start rounded-lg sm:gap-2.5" aria-label="EO Marketplace, ke beranda">
          <BrandMark className="size-8 shrink-0 sm:size-9" tone={overlay ? "light" : "dark"} />
          <span className={`font-poppins truncate text-[1.05rem] font-semibold sm:text-[1.2rem] tracking-tight transition-colors ${overlay ? "text-white" : "text-ink"}`}>
            EO Marketplace
          </span>
        </Link>

        <nav className="font-poppins hidden items-center gap-1 text-[0.92rem] font-medium lg:flex" aria-label="Navigasi utama">
          {NAV.map((item) => {
            const active = item.href === pathname;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 transition-colors ${active ? activeLink : link}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 justify-self-end">
          <Link href="/explore" className={`grid size-9 place-items-center rounded-full transition-colors lg:hidden ${link}`} aria-label="Cari EO">
            <Search className="size-5" />
          </Link>
          <AccountMenu overlay={overlay} />
          <Link
            href="/request"
            className={`font-poppins inline-flex items-center whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium sm:px-5 transition-colors lg:px-7 lg:py-3 lg:text-[0.95rem] ${
              overlay ? "bg-white text-ink hover:bg-cobalt hover:text-white" : "bg-ink text-paper hover:bg-cobalt"
            }`}
          >
            <span className="sm:hidden">Penawaran</span>
            <span className="hidden sm:inline">Minta penawaran</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
