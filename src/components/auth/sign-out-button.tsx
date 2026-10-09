"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export function SignOutButton({ className = "", redirectTo = "/" }: { className?: string; redirectTo?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await createBrowserSupabase().auth.signOut();
        router.replace(redirectTo);
        router.refresh();
      }}
      className={`inline-flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-60 ${className}`}
    >
      <LogOut className="size-4" aria-hidden />
      Keluar
    </button>
  );
}
