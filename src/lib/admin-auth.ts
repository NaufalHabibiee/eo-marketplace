import "server-only";
import { createServerSupabase } from "./supabase/server";

export class AdminAuthError extends Error {}

/** Every admin mutation re-checks the session; RLS enforces the same rule in the database. */
export async function requireAdmin() {
  const supabase = await createServerSupabase();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) throw new AdminAuthError("Sesi berakhir. Silakan masuk lagi.");
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) throw new AdminAuthError("Akun ini tidak punya akses admin.");
  return { supabase, email: (claimsData.claims.email as string | undefined) ?? null };
}
