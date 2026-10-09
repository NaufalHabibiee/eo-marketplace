"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { signInWithGoogle } from "@/lib/auth-client";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
    </svg>
  );
}

export function LoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [error, setError] = useState(initialError ?? "");
  const [loading, setLoading] = useState<"email" | "google" | null>(null);

  async function signInWithEmail(formData: FormData) {
    setError("");
    setLoading("email");
    const supabase = createBrowserSupabase();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
    });
    if (error) {
      setLoading(null);
      setError(error.message === "Invalid login credentials" ? "Email atau kata sandi salah." : "Login gagal. Coba lagi sebentar lagi.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  async function onGoogle() {
    setError("");
    setLoading("google");
    const message = await signInWithGoogle("/admin");
    if (message) {
      setLoading(null);
      setError(message);
    }
  }

  return (
    <div className="mt-8">
      {error && (
        <p role="alert" className="mb-5 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onGoogle}
        disabled={loading !== null}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border-[1.5px] border-line bg-surface font-semibold text-ink transition-colors hover:border-line-strong disabled:opacity-60"
      >
        {loading === "google" ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <GoogleIcon />}
        Masuk dengan Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs text-ink-muted">
        <span className="h-px flex-1 bg-line" />
        atau dengan email
        <span className="h-px flex-1 bg-line" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          signInWithEmail(new FormData(e.currentTarget));
        }}
        className="space-y-4"
      >
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required className="field" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
            Kata sandi
          </label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
        </div>
        <button
          type="submit"
          disabled={loading !== null}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink font-semibold text-paper transition-colors hover:bg-cobalt disabled:opacity-60"
        >
          {loading === "email" && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          Masuk
        </button>
      </form>
    </div>
  );
}
