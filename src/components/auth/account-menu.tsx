"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardList, LogOut, UserRound } from "lucide-react";
import { initials } from "@/lib/format";
import { createBrowserSupabase } from "@/lib/supabase/browser";

type SessionUser = { name: string; email: string } | null;

function toUser(user: { email?: string; user_metadata?: Record<string, unknown> } | null | undefined): SessionUser {
  if (!user) return null;
  const meta = user.user_metadata ?? {};
  const email = user.email ?? "";
  const name = String(meta.full_name || meta.name || email.split("@")[0] || "Akun");
  return { name, email };
}

/** Header slot: "Masuk" for guests, an initials button with a small menu for signed-in users. */
export function AccountMenu() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    supabase.auth.getSession().then(({ data }) => setUser(toUser(data.session?.user)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(toUser(session?.user)));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (user === undefined) return <span className="w-9 sm:w-16" aria-hidden />;

  const tone = "text-(--h-muted) hover:text-(--h-text)";

  if (!user) {
    return (
      <Link href="/masuk" className={`font-poppins inline-flex items-center gap-1.5 rounded-full px-2 py-2 text-[0.92rem] font-medium transition-colors sm:px-3 ${tone}`}>
        <UserRound className="size-5 sm:hidden" aria-hidden />
        <span className="sr-only sm:not-sr-only">Masuk</span>
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Akun ${user.name}`}
        className={`font-display grid size-10 place-items-center rounded-full text-sm font-semibold transition-colors ${
          "bg-(--h-avatar-bg) text-(--h-avatar-fg) ring-1 ring-(--h-avatar-ring) hover:bg-cobalt hover:text-white"
        }`}
      >
        {initials(user.name)}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl bg-surface text-ink shadow-[0_24px_48px_-20px_rgba(22,24,58,0.45)] ring-1 ring-line">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="truncate text-xs text-ink-muted">{user.email}</p>
          </div>
          <div className="p-1.5">
            <Link role="menuitem" href="/akun" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-paper">
              <ClipboardList className="size-4 text-ink-muted" aria-hidden />
              Permintaan saya
            </Link>
            <button
              role="menuitem"
              type="button"
              onClick={async () => {
                setOpen(false);
                await createBrowserSupabase().auth.signOut();
                router.refresh();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-danger hover:bg-danger/5"
            >
              <LogOut className="size-4" aria-hidden />
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
