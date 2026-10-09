"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { authErrorMessage } from "@/lib/auth-client";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export function NewPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      noValidate
      className="mt-6 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const password = String(data.get("password") ?? "");
        const confirm = String(data.get("confirm") ?? "");
        setError("");
        if (password.length < 8) return setError("Kata sandi minimal 8 karakter.");
        if (password !== confirm) return setError("Konfirmasi kata sandi tidak sama.");
        setBusy(true);
        const { error } = await createBrowserSupabase().auth.updateUser({ password });
        if (error) {
          setBusy(false);
          return setError(
            /session/i.test(error.message) ? "Link sudah kedaluwarsa. Minta link baru dari halaman masuk." : authErrorMessage(error.message),
          );
        }
        router.replace("/akun");
        router.refresh();
      }}
    >
      {error && (
        <p role="alert" className="rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Kata sandi baru
        </label>
        <input id="password" name="password" type="password" autoComplete="new-password" maxLength={72} className="field" />
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium">
          Ulangi kata sandi
        </label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" maxLength={72} className="field" />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cobalt-deep font-semibold text-white hover:bg-ink disabled:opacity-60"
      >
        {busy && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
        Simpan kata sandi
      </button>
    </form>
  );
}
