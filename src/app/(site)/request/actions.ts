"use server";

import { redirect } from "next/navigation";
import { BUDGET_RANGES, EVENT_NEEDS, EVENT_TYPE_VALUES } from "@/lib/constants";
import { createServerSupabase } from "@/lib/supabase/server";

export type RequestField =
  | "name"
  | "company"
  | "email"
  | "phone"
  | "event_type"
  | "location"
  | "event_date"
  | "participants"
  | "budget"
  | "description";

export type RequestFormState = {
  errors?: Partial<Record<RequestField, string>>;
  message?: string;
  values?: Partial<Record<RequestField | "eo", string>>;
  needs?: string[];
};

function jakartaToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
}

export async function submitEventRequest(_prev: RequestFormState, formData: FormData): Promise<RequestFormState> {
  const get = (key: string) => String(formData.get(key) ?? "").trim();
  const values = {
    name: get("name"),
    company: get("company"),
    email: get("email"),
    phone: get("phone"),
    event_type: get("event_type"),
    location: get("location"),
    event_date: get("event_date"),
    participants: get("participants"),
    budget: get("budget"),
    description: get("description"),
    eo: formData.getAll("eo").map(String).filter(Boolean).slice(0, 3).join(","),
  };
  const needs = formData
    .getAll("needs")
    .map(String)
    .filter((n): n is (typeof EVENT_NEEDS)[number] => (EVENT_NEEDS as readonly string[]).includes(n));

  const errors: RequestFormState["errors"] = {};
  if (values.name.length < 2) errors.name = "Isi nama lengkapmu.";
  else if (values.name.length > 120) errors.name = "Nama maksimal 120 karakter.";
  if (values.company.length < 2) errors.company = "Isi nama perusahaan atau instansi. Tulis “Pribadi” jika acara pribadi.";
  else if (values.company.length > 160) errors.company = "Nama perusahaan maksimal 160 karakter.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email) || values.email.length > 200) errors.email = "Format email belum benar, contoh: nama@kantor.com";
  const phoneDigits = values.phone.replace(/\D/g, "");
  if (phoneDigits.length < 9 || phoneDigits.length > 15) errors.phone = "Nomor WhatsApp belum benar, contoh: 0812 3456 7890";
  if (!EVENT_TYPE_VALUES.includes(values.event_type)) errors.event_type = "Pilih jenis acara.";
  if (values.location.length < 3) errors.location = "Isi kota atau venue acara.";
  else if (values.location.length > 200) errors.location = "Lokasi maksimal 200 karakter.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.event_date)) errors.event_date = "Pilih tanggal acara.";
  else if (values.event_date < jakartaToday()) errors.event_date = "Tanggal acara tidak boleh di masa lalu.";
  const participants = Number(values.participants);
  if (!Number.isInteger(participants) || participants < 1) errors.participants = "Isi perkiraan jumlah peserta.";
  else if (participants > 1_000_000) errors.participants = "Jumlah peserta terlalu besar.";
  if (!BUDGET_RANGES.some((b) => b.value === values.budget)) errors.budget = "Pilih perkiraan anggaran.";
  if (values.description.length < 10) errors.description = "Ceritakan acaramu minimal 10 karakter agar EO bisa memberi penawaran.";
  else if (values.description.length > 2800) errors.description = "Deskripsi maksimal 2.800 karakter.";

  if (Object.keys(errors).length > 0) {
    return { errors, values, needs, message: "Ada isian yang perlu diperbaiki." };
  }

  // Session-aware client so the request is linked to the signed-in user, if any.
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("submit_event_request_multi", {
    p_name: values.name,
    p_company: values.company,
    p_email: values.email,
    p_phone: values.phone,
    p_event_type: values.event_type,
    p_location: values.location,
    p_event_date: values.event_date,
    p_participants: participants,
    p_budget: values.budget,
    p_description: needs.length ? `Kebutuhan: ${needs.join(", ")}\n\n${values.description}` : values.description,
    p_eo_slugs: values.eo ? values.eo.split(",") : [],
  });

  if (error || !data) {
    console.error("submit_event_request failed", error);
    return { values, needs, message: "Permintaan belum terkirim karena gangguan server. Coba kirim lagi dalam beberapa saat." };
  }

  const params = new URLSearchParams({ ref: String(data).slice(0, 8).toUpperCase() });
  if (values.eo) params.set("eo", values.eo);
  redirect(`/success?${params.toString()}`);
}
