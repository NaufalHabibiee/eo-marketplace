"use client";

import { useActionState, type ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { registerEO, type EOSignupField, type EOSignupState } from "@/app/(site)/daftar-eo/actions";
import { EVENT_TYPES } from "@/lib/constants";

export function EOSignupForm() {
  const [state, action, pending] = useActionState<EOSignupState, FormData>(registerEO, {});
  const v = state.values ?? {};
  const err = state.errors ?? {};

  if (state.done) {
    return (
      <div className="rounded-3xl bg-surface p-8 text-center ring-1 ring-line sm:p-12">
        <CheckCircle2 className="mx-auto size-12 text-cobalt" aria-hidden />
        <h2 className="font-display mt-4 text-2xl font-semibold">Pendaftaran {state.companyName} diterima</h2>
        <p className="mx-auto mt-2 max-w-md text-ink-soft">
          Tim kami meninjau data dalam 1–2 hari kerja. Setelah disetujui, profilmu tampil di direktori dan mulai bisa menerima permintaan penawaran.
        </p>
        <Link href="/explore" className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 font-semibold text-paper hover:bg-cobalt">
          Lihat direktori EO
        </Link>
      </div>
    );
  }

  const field = (name: EOSignupField) => ({
    id: name,
    name,
    "aria-invalid": err[name] ? true : undefined,
    "aria-describedby": err[name] ? `${name}-error` : undefined,
  });

  return (
    <form action={action} noValidate className="rounded-3xl bg-surface p-6 ring-1 ring-line sm:p-8">
      {state.message && (
        <p role="alert" className="mb-6 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger">
          {state.message}
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nama perusahaan EO" htmlFor="company_name" error={err.company_name}>
          <input {...field("company_name")} defaultValue={v.company_name} maxLength={200} className="field" placeholder="PT Kreasi Acara Nusantara" />
        </Field>
        <Field label="Nama penanggung jawab" htmlFor="contact_person" error={err.contact_person}>
          <input {...field("contact_person")} defaultValue={v.contact_person} maxLength={120} autoComplete="name" className="field" />
        </Field>
        <Field label="Email bisnis" htmlFor="email" error={err.email}>
          <input {...field("email")} type="email" defaultValue={v.email} maxLength={200} autoComplete="email" className="field" />
        </Field>
        <Field label="Telepon / WhatsApp" htmlFor="phone" error={err.phone}>
          <input {...field("phone")} type="tel" defaultValue={v.phone} maxLength={30} autoComplete="tel" className="field" placeholder="0812 3456 7890" />
        </Field>
        <Field label="Kota kantor" htmlFor="city" error={err.city}>
          <input {...field("city")} defaultValue={v.city} maxLength={100} className="field" placeholder="Jakarta Selatan" />
        </Field>
        <Field label="Provinsi" htmlFor="province" hint="Opsional">
          <input id="province" name="province" defaultValue={v.province} maxLength={100} className="field" placeholder="DKI Jakarta" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Website atau Instagram" htmlFor="website" error={err.website} hint="Opsional">
            <input {...field("website")} defaultValue={v.website} maxLength={300} className="field" placeholder="https://" />
          </Field>
        </div>
        <fieldset className="sm:col-span-2" aria-describedby={err.event_types ? "event_types-error" : undefined}>
          <legend className="mb-2 text-sm font-medium">Jenis acara yang ditangani</legend>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map((t) => (
              <label
                key={t.value}
                className="inline-flex cursor-pointer select-none items-center rounded-full border-[1.5px] border-line px-3.5 py-1.5 text-sm text-ink-soft transition-colors hover:border-line-strong has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-cobalt-wash"
              >
                <input type="checkbox" name="event_types" value={t.value} defaultChecked={state.types?.includes(t.value)} className="sr-only" />
                {t.label}
              </label>
            ))}
          </div>
          {err.event_types && (
            <p id="event_types-error" className="mt-1.5 text-sm text-danger">
              {err.event_types}
            </p>
          )}
        </fieldset>
        <div className="sm:col-span-2">
          <Field label="Ceritakan EO-mu" htmlFor="description" error={err.description}>
            <textarea
              {...field("description")}
              defaultValue={v.description}
              rows={5}
              maxLength={2000}
              className="field resize-y leading-relaxed"
              placeholder="Pengalaman, spesialisasi, klien yang pernah ditangani, area layanan."
            />
          </Field>
        </div>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-ink-muted sm:max-w-sm">Profil baru ditinjau tim kami sebelum tampil di direktori. Gratis selama masa peluncuran.</p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-cobalt px-7 font-semibold text-white hover:bg-cobalt-deep disabled:opacity-60"
        >
          {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          Daftarkan EO
        </button>
      </div>
    </form>
  );
}

function Field({ label, htmlFor, error, hint, children }: { label: string; htmlFor: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between text-sm font-medium">
        {label}
        {hint && <span className="text-xs font-normal text-ink-muted">{hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
