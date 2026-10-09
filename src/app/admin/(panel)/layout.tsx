import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShell, SignOutButton } from "@/components/admin/admin-shell";
import { createServerSupabase } from "@/lib/supabase/server";

export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

async function AdminGate({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/admin/login");
  const email = (data.claims.email as string | undefined) ?? null;

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-start justify-center px-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">Belum punya akses admin</h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          Kamu masuk sebagai <strong className="text-ink">{email}</strong>, tapi akun ini belum terdaftar sebagai admin. Minta admin lain
          menambahkan email ini, lalu masuk lagi.
        </p>
        <SignOutButton className="mt-6 rounded-full border border-line-strong px-4 py-2" />
      </div>
    );
  }

  return <AdminShell email={email}>{children}</AdminShell>;
}

function PanelSkeleton() {
  return (
    <div className="flex min-h-screen" aria-busy="true" aria-label="Memuat panel admin">
      <div className="hidden w-64 border-r border-line bg-surface lg:block" />
      <div className="flex-1 space-y-4 p-10">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-line/60" />
        <div className="h-32 animate-pulse rounded-2xl bg-line/40" />
        <div className="h-96 animate-pulse rounded-2xl bg-line/40" />
      </div>
    </div>
  );
}
