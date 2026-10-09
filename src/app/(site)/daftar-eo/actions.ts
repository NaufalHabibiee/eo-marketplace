"use server";

import { EVENT_TYPE_VALUES } from "@/lib/constants";
import { createPublicClient } from "@/lib/supabase/public";

export type EOSignupField = "company_name" | "contact_person" | "email" | "phone" | "city" | "event_types" | "description" | "website";

export type EOSignupState = {
  done?: boolean;
  companyName?: string;
  errors?: Partial<Record<EOSignupField, string>>;
  message?: string;
  values?: Record<string, string>;
  types?: string[];
};

export async function registerEO(_prev: EOSignupState, formData: FormData): Promise<EOSignupState> {
  const get = (key: string) => String(formData.get(key) ?? "").trim();
  const values = {
    company_name: get("company_name"),
    contact_person: get("contact_person"),
    email: get("email"),
    phone: get("phone"),
    city: get("city"),
    province: get("province"),
    website: get("website"),
    description: get("description"),
  };
  const types = formData.getAll("event_types").map(String).filter((t) => EVENT_TYPE_VALUES.includes(t));

  const errors: EOSignupState["errors"] = {};
  if (values.company_name.length < 2) errors.company_name = "Isi nama perusahaan EO.";
  if (values.contact_person.length < 2) errors.contact_person = "Isi nama penanggung jawab.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) errors.email = "Format email belum benar.";
  if (values.phone.replace(/\D/g, "").length < 9) errors.phone = "Nomor telepon atau WhatsApp belum benar.";
  if (values.city.length < 2) errors.city = "Isi kota kantor.";
  if (types.length === 0) errors.event_types = "Pilih minimal satu jenis acara.";
  if (values.description.length < 20) errors.description = "Ceritakan EO-mu minimal 20 karakter.";
  else if (values.description.length > 2000) errors.description = "Deskripsi maksimal 2.000 karakter.";
  if (values.website && !/^(https?:\/\/)?[\w-]+(\.[\w-]+)+/i.test(values.website)) errors.website = "Format website belum benar.";

  if (Object.keys(errors).length > 0) return { errors, values, types, message: "Ada isian yang perlu diperbaiki." };

  const { error } = await createPublicClient().rpc("register_eo", {
    p_company_name: values.company_name,
    p_contact_person: values.contact_person,
    p_email: values.email,
    p_phone: values.phone,
    p_city: values.city,
    p_province: values.province,
    p_website: values.website,
    p_event_types: types,
    p_description: values.description,
  });
  if (error) {
    console.error("register_eo failed", error);
    return { values, types, message: "Pendaftaran belum terkirim karena gangguan server. Coba lagi sebentar lagi." };
  }
  return { done: true, companyName: values.company_name };
}
