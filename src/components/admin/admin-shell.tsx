"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, ExternalLink, LayoutDashboard, LogOut } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { BrandMark } from "../site-chrome";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/eo", label: "Kelola EO", icon: Building2, exact: false },
];

export function SignOutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await createBrowserSupabase().auth.signOut();
        router.replace("/admin/login");
        router.refresh();
      }}
      className={`inline-flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-ink disabled:opacity-60 ${className}`}
    >
      <LogOut className="size-4" aria-hidden />
      Keluar
    </button>
  );
}

export function AdminShell({ email, children }: { email: string | null; children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="border-b border-line bg-surface lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:py-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <BrandMark className="size-8" />
            <span className="font-display font-bold">Admin</span>
          </Link>
          <SignOutButton className="lg:hidden" />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0" aria-label="Menu admin">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper hover:text-ink"
                }`}
              >
                <Icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-paper hover:text-ink"
          >
            <ExternalLink className="size-4" aria-hidden />
            Lihat situs
          </Link>
        </nav>
        <div className="mt-auto hidden border-t border-line px-5 py-5 lg:block">
          <p className="truncate text-xs text-ink-muted" title={email ?? undefined}>
            {email}
          </p>
          <SignOutButton className="mt-3" />
        </div>
      </aside>
      <div className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:py-10">{children}</div>
    </div>
  );
}
