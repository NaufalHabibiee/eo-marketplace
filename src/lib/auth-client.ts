import { createBrowserSupabase } from "./supabase/browser";
import { SUPABASE_KEY, SUPABASE_URL } from "./supabase/env";

/** Only same-site relative paths, so a crafted ?next= can't redirect off-site. */
export function safeNext(next: string | null | undefined, fallback = "/akun"): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export function callbackUrl(next: string): string {
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

/** Returns an error message, or null once the browser is on its way to Google. */
export async function signInWithGoogle(next: string): Promise<string | null> {
  // Supabase shows a raw JSON error page when the provider is off, so check first.
  const settings = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_KEY } })
    .then((r) => r.json())
    .catch(() => null);
  if (settings && !settings.external?.google) {
    return "Login Google belum diaktifkan di Supabase. Gunakan email untuk sementara.";
  }
  const { error } = await createBrowserSupabase().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl(next) },
  });
  return error ? "Login Google gagal. Coba lagi." : null;
}

export function authErrorMessage(message: string): string {
  if (/invalid login credentials/i.test(message)) return "Email atau kata sandi salah.";
  if (/email not confirmed/i.test(message)) return "Email belum dikonfirmasi. Buka link konfirmasi di kotak masuk emailmu.";
  if (/already registered|already been registered/i.test(message)) return "Email ini sudah terdaftar. Silakan masuk.";
  if (/password should be|weak password/i.test(message)) return "Kata sandi terlalu lemah. Gunakan minimal 8 karakter dengan huruf dan angka.";
  if (/rate limit|too many/i.test(message)) return "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.";
  if (/signups not allowed|signup is disabled/i.test(message)) return "Pendaftaran akun sedang ditutup.";
  return "Terjadi gangguan. Coba lagi sebentar lagi.";
}
