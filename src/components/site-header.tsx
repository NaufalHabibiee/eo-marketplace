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
  // Transparent-over-photo vs solid is decided in CSS (globals.css, .site-header): the shell is
  // prerendered without knowing the route, so a pathname check here would mismatch on hydration.
  const link = "text-(--h-muted) hover:text-(--h-text)";
  const activeLink = "text-(--h-text)";

  return (
    <header
      data-scrolled={scrolled ? "true" : "false"}
      className="site-header sticky top-0 z-40 border-b border-(--h-border) bg-(--h-bg) shadow-(--h-shadow) backdrop-blur-(--h-blur) transition-[background-color,border-color,box-shadow] duration-300"
    >
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:gap-4 px-4 sm:px-6 lg:h-20 lg:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="flex min-w-0 items-center gap-2 justify-self-start rounded-lg sm:gap-2.5" aria-label="EO Marketplace, ke beranda">
          <BrandMark className="size-8 shrink-0 sm:size-9" tone="header" />
          <span className={`font-poppins truncate text-[1.05rem] font-semibold sm:text-[1.2rem] tracking-tight text-(--h-text) transition-colors`}>
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
          <AccountMenu />
          <Link
            href="/request"
            className={`font-poppins inline-flex items-center whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium sm:px-5 transition-colors lg:px-7 lg:py-3 lg:text-[0.95rem] ${
              "bg-(--h-btn-bg) text-(--h-btn-fg) hover:bg-cobalt hover:text-white"
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
