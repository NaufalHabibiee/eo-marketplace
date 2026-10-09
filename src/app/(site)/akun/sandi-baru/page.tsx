import type { Metadata } from "next";
import { NewPasswordForm } from "@/components/auth/new-password-form";

export const metadata: Metadata = { title: "Kata sandi baru", robots: { index: false } };

export default function NewPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 pt-14 sm:px-6">
      <div className="rounded-3xl bg-surface p-8 ring-1 ring-line">
        <h1 className="font-display text-2xl font-semibold">Buat kata sandi baru</h1>
        <p className="mt-2 text-sm text-ink-muted">Gunakan minimal 8 karakter. Setelah disimpan kamu langsung masuk ke akunmu.</p>
        <NewPasswordForm />
      </div>
    </div>
  );
}
