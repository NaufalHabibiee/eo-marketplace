"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lock, LoaderCircle, Mail, User } from "lucide-react";
import { authErrorMessage, callbackUrl, signInWithGoogle } from "@/lib/auth-client";
import { createBrowserSupabase } from "@/lib/supabase/browser";

type Mode = "signin" | "signup" | "forgot";

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
    </svg>
  );
}

function IconField({
  icon,
  label,
  trailing,
  ...input
}: { icon: ReactNode; label: string; trailing?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <span className="flex h-13 items-center gap-3 rounded-xl bg-paper px-4 ring-1 ring-line transition-shadow focus-within:bg-surface focus-within:ring-2 focus-within:ring-cobalt">
        <span className="text-ink-muted" aria-hidden>
          {icon}
        </span>
        <input {...input} placeholder={label} className="h-full min-w-0 flex-1 bg-transparent text-[0.95rem] text-ink outline-none placeholder:text-ink-muted" />
        {trailing}
      </span>
    </label>
  );
}

export function AuthForm({ initialMode, next, initialError }: { initialMode: "signin" | "signup"; next: string; initialError?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState<"form" | "google" | null>(null);
  const [error, setError] = useState(initialError ?? "");
  const [notice, setNotice] = useState("");

  async function onSubmit(e: { preventDefault: () => void; currentTarget: HTMLFormElement }) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const name = String(data.get("name") ?? "").trim();
    setError("");
    setNotice("");

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError("Format email belum benar.");
    if (mode !== "forgot" && password.length < 8) return setError("Kata sandi minimal 8 karakter.");
    if (mode === "signup" && name.length < 2) return setError("Isi nama lengkapmu.");

    setBusy("form");
    const supabase = createBrowserSupabase();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setBusy(null);
        return setError(authErrorMessage(error.message));
      }
      router.replace(next);
      router.refresh();
      return;
    }

    if (mode === "signup") {
      const { data: result, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name }, emailRedirectTo: callbackUrl(next) },
      });
      setBusy(null);
      if (error) return setError(authErrorMessage(error.message));
      if (result.session) {
        router.replace(next);
        router.refresh();
        return;
      }
      // Supabase returns a user with no identities when the email is already registered.
      if (result.user && result.user.identities?.length === 0) return setError(authErrorMessage("already registered"));
      return setNotice(`Akun dibuat. Kami mengirim link konfirmasi ke ${email}. Buka link itu untuk mulai memakai akunmu.`);
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: callbackUrl("/akun/sandi-baru") });
    setBusy(null);
    if (error) return setError(authErrorMessage(error.message));
    setNotice(`Jika ${email} terdaftar, link untuk membuat kata sandi baru sudah dikirim ke email tersebut.`);
  }

  function switchMode(target: Mode) {
    setMode(target);
    setError("");
    setNotice("");
  }

  async function onGoogle() {
    setError("");
    setBusy("google");
    const message = await signInWithGoogle(next);
    if (message) {
      setBusy(null);
      setError(message);
    }
  }

  const copy = {
    signin: { title: "Masuk", sub: "Masuk untuk melacak permintaan penawaran dan mengisi formulir lebih cepat.", cta: "Masuk" },
    signup: { title: "Daftar", sub: "Buat akun gratis untuk menyimpan semua permintaan acaramu di satu tempat.", cta: "Buat akun" },
    forgot: { title: "Lupa kata sandi", sub: "Masukkan email akunmu. Kami kirim link untuk membuat kata sandi baru.", cta: "Kirim link" },
  }[mode];

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="font-display text-4xl font-bold tracking-tight">{copy.title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{copy.sub}</p>

      {error && (
        <p role="alert" className="mt-6 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-6 flex gap-2.5 rounded-xl border border-cobalt/20 bg-cobalt-wash px-4 py-3 text-sm leading-relaxed text-cobalt-deep">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
          {notice}
        </p>
      )}

      <form onSubmit={onSubmit} noValidate className="mt-7 space-y-4">
        {mode === "signup" && <IconField icon={<User className="size-[18px]" />} label="Nama lengkap" name="name" autoComplete="name" maxLength={120} />}
        <IconField icon={<Mail className="size-[18px]" />} label="Email" name="email" type="email" autoComplete="email" maxLength={200} />
        {mode !== "forgot" && (
          <IconField
            icon={<Lock className="size-[18px]" />}
            label="Kata sandi"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            maxLength={72}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-xs font-semibold tracking-wide text-cobalt hover:text-cobalt-deep"
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? "SEMBUNYIKAN" : "TAMPILKAN"}
              </button>
            }
          />
        )}

        {mode === "signin" && (
          <div className="flex justify-end">
            <button type="button" onClick={() => switchMode("forgot")} className="text-sm font-medium text-cobalt hover:text-cobalt-deep">
              Lupa kata sandi?
            </button>
          </div>
        )}
        {mode === "signup" && <p className="text-xs text-ink-muted">Minimal 8 karakter.</p>}

        <button
          type="submit"
          disabled={busy !== null}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-cobalt-deep font-semibold text-white transition-colors hover:bg-ink disabled:opacity-60"
        >
          {busy === "form" && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {copy.cta}
        </button>
      </form>

      {mode !== "forgot" ? (
        <>
          <div className="my-6 flex items-center gap-3 text-xs text-ink-muted">
            <span className="h-px flex-1 bg-line-strong" />
            atau
            <span className="h-px flex-1 bg-line-strong" />
          </div>
          <button
            type="button"
            onClick={onGoogle}
            disabled={busy !== null}
            className="flex h-13 w-full items-center justify-center gap-3 rounded-xl border-2 border-ink/80 bg-surface font-semibold text-ink transition-colors hover:bg-paper disabled:opacity-60"
          >
            {busy === "google" ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <GoogleIcon />}
            {mode === "signup" ? "Daftar dengan Google" : "Masuk dengan Google"}
          </button>
          <p className="mt-8 text-center text-sm text-ink-muted">
            {mode === "signin" ? "Belum punya akun? " : "Sudah punya akun? "}
            <Link
              href={`${mode === "signin" ? "/daftar" : "/masuk"}${next !== "/akun" ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="font-semibold text-cobalt hover:text-cobalt-deep"
            >
              {mode === "signin" ? "Daftar" : "Masuk"}
            </Link>
          </p>
        </>
      ) : (
        <button
          type="button"
          onClick={() => switchMode("signin")}
          className="mt-6 w-full text-center text-sm font-semibold text-cobalt hover:text-cobalt-deep"
        >
          Kembali ke halaman masuk
        </button>
      )}
    </div>
  );
}
