"use server";

import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { AdminAuthError, requireAdmin } from "@/lib/admin-auth";
import { LEAD_STATUS_VALUES } from "@/lib/constants";
import { CSV_COLUMNS, normalizeEO, type EOInput } from "@/lib/eo-validate";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function guarded(run: () => Promise<ActionResult>): Promise<ActionResult> {
  try {
    return await run();
  } catch (e) {
    if (e instanceof AdminAuthError) return { ok: false, error: e.message };
    console.error("admin action failed", e);
    return { ok: false, error: "Terjadi gangguan server. Coba lagi." };
  }
}

function publicChanged() {
  updateTag("eo");
  refresh();
}

export async function updateLeadStatus(leadId: string, requestId: string, status: string): Promise<ActionResult> {
  return guarded(async () => {
    if (!UUID.test(leadId) || !UUID.test(requestId) || !LEAD_STATUS_VALUES.includes(status)) {
      return { ok: false, error: "Data status tidak valid." };
    }
    const { supabase } = await requireAdmin();
    const [lead, request] = await Promise.all([
      supabase.from("leads").update({ status }).eq("id", leadId),
      supabase.from("event_requests").update({ status }).eq("id", requestId),
    ]);
    if (lead.error || request.error) return { ok: false, error: "Status gagal disimpan." };
    refresh();
    return { ok: true, message: "Status diperbarui." };
  });
}

export async function setEOVerified(id: string, verified: boolean): Promise<ActionResult> {
  return guarded(async () => {
    if (!UUID.test(id)) return { ok: false, error: "ID EO tidak valid." };
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("eo").update({ verified }).eq("id", id);
    if (error) return { ok: false, error: "Verifikasi gagal disimpan." };
    publicChanged();
    return { ok: true, message: verified ? "EO ditandai terverifikasi." : "Verifikasi dicabut." };
  });
}

export async function setEOStatus(id: string, active: boolean): Promise<ActionResult> {
  return guarded(async () => {
    if (!UUID.test(id)) return { ok: false, error: "ID EO tidak valid." };
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("eo")
      .update({ status: active ? "active" : "inactive" })
      .eq("id", id);
    if (error) return { ok: false, error: "Status EO gagal disimpan." };
    publicChanged();
    return { ok: true, message: active ? "EO diaktifkan dan tampil di direktori." : "EO dinonaktifkan dan disembunyikan dari direktori." };
  });
}

export async function deleteEO(id: string): Promise<ActionResult> {
  return guarded(async () => {
    if (!UUID.test(id)) return { ok: false, error: "ID EO tidak valid." };
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("eo").delete().eq("id", id);
    if (error) return { ok: false, error: "EO gagal dihapus." };
    publicChanged();
    return { ok: true, message: "EO dihapus." };
  });
}

export type EOFormState = { errors?: string[]; values?: Record<string, string> };

export async function saveEO(_prev: EOFormState, formData: FormData): Promise<EOFormState> {
  const raw: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") continue;
    raw[key] = key === "event_types" && raw[key] ? `${raw[key]}|${value}` : value;
  }
  raw.verified = formData.get("verified") ? "true" : "false";
  const id = raw.id || null;
  if (id && !UUID.test(id)) return { errors: ["ID EO tidak valid."], values: raw };

  const { data, errors } = normalizeEO(raw);
  if (!data) return { errors, values: raw };

  let supabase;
  try {
    ({ supabase } = await requireAdmin());
  } catch (e) {
    return { errors: [e instanceof AdminAuthError ? e.message : "Terjadi gangguan server."], values: raw };
  }

  const { error } = id ? await supabase.from("eo").update(data).eq("id", id) : await supabase.from("eo").insert(data);
  if (error) {
    const message = error.code === "23505" ? `Slug “${data.slug}” sudah dipakai EO lain. Ganti slug-nya.` : "EO gagal disimpan.";
    return { errors: [message], values: raw };
  }
  updateTag("eo");
  redirect(`/admin/eo?saved=${encodeURIComponent(data.company_name)}`);
}

export type ImportResult =
  | { ok: true; inserted: number; updated: number; skipped: { row: number; errors: string[] }[] }
  | { ok: false; error: string };

export async function importEOs(rows: Record<string, string>[], startRow: number): Promise<ImportResult> {
  try {
    if (!Array.isArray(rows) || rows.length === 0) return { ok: false, error: "Tidak ada baris untuk diimpor." };
    if (rows.length > 500) return { ok: false, error: "Maksimal 500 baris per batch." };
    const { supabase } = await requireAdmin();

    const skipped: { row: number; errors: string[] }[] = [];
    const bySlug = new Map<string, EOInput>();
    rows.forEach((raw, i) => {
      const { data, errors } = normalizeEO(raw);
      if (!data) skipped.push({ row: startRow + i, errors });
      else bySlug.set(data.slug, data);
    });

    // Only columns present in the file are written, so a partial CSV never blanks other fields.
    const header = new Set(Object.keys(rows[0]));
    const columns = CSV_COLUMNS.filter((c) => header.has(c));
    const records = [...bySlug.values()].map((r) => {
      const picked: Record<string, unknown> = { company_name: r.company_name, slug: r.slug };
      for (const c of columns) picked[c] = r[c];
      return picked as { slug: string } & Record<string, unknown>;
    });
    if (records.length === 0) return { ok: true, inserted: 0, updated: 0, skipped };

    const { data: existing, error: lookupError } = await supabase
      .from("eo")
      .select("slug")
      .in(
        "slug",
        records.map((r) => r.slug),
      );
    if (lookupError) return { ok: false, error: "Gagal memeriksa data yang sudah ada." };
    const existingSlugs = new Set((existing ?? []).map((r) => r.slug as string));

    const { error } = await supabase.from("eo").upsert(records, { onConflict: "slug" });
    if (error) return { ok: false, error: `Import gagal: ${error.message}` };

    updateTag("eo");
    const updated = records.filter((r) => existingSlugs.has(r.slug)).length;
    return { ok: true, inserted: records.length - updated, updated, skipped };
  } catch (e) {
    if (e instanceof AdminAuthError) return { ok: false, error: e.message };
    console.error("import failed", e);
    return { ok: false, error: "Terjadi gangguan server saat import." };
  }
}
