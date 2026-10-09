"use client";

import { useActionState, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { saveEO, type EOFormState } from "@/app/admin/actions";
import { EVENT_TYPES } from "@/lib/constants";
import { slugify } from "@/lib/format";
import type { EO } from "@/lib/types";

const join = (v: string[] | null | undefined, sep: string) => (v ?? []).join(sep);
const str = (v: unknown) => (v == null ? "" : String(v));

export function EOForm({ eo }: { eo: EO | null }) {
  const [state, action, pending] = useActionState<EOFormState, FormData>(saveEO, {});
  const v = state.values;
  const initial = (key: keyof EO, fallback = "") => (v ? (v[key] ?? "") : eo ? str(eo[key]) : fallback);
  const [name, setName] = useState(initial("company_name"));
  const [slugTouched, setSlugTouched] = useState(Boolean(eo));
  const [slug, setSlug] = useState(initial("slug"));
  const selectedTypes = v ? (v.event_types ?? "").split("|") : (eo?.event_types ?? []);

  return (
    <form action={action} className="space-y-6">
      {eo && <input type="hidden" name="id" value={eo.id} />}

      {state.errors && state.errors.length > 0 && (
        <div role="alert" className="rounded-2xl border border-danger/30 bg-danger/5 px-5 py-4 text-sm text-danger">
          <p className="font-semibold">Belum bisa disimpan:</p>
          <ul className="mt-1 list-inside list-disc">
            {state.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <Card title="Identitas">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama perusahaan" htmlFor="company_name">
            <input
              id="company_name"
              name="company_name"
              required
              maxLength={200}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              className="field"
            />
          </Field>
          <Field label="Slug (alamat profil)" htmlFor="slug" hint={`/eo/${slug || "nama-eo"}`}>
            <input
              id="slug"
              name="slug"
              maxLength={120}
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className="field"
            />
          </Field>
          <Field label="URL logo" htmlFor="logo" hint="Kosongkan untuk memakai inisial">
            <input id="logo" name="logo" type="url" defaultValue={initial("logo")} placeholder="https://" className="field" />
          </Field>
          <Field label="Tahun berdiri" htmlFor="year_established">
            <input id="year_established" name="year_established" type="number" min={1900} max={2100} defaultValue={initial("year_established")} className="field" />
          </Field>
        </div>
        <Field label="Deskripsi" htmlFor="description" className="mt-4">
          <textarea id="description" name="description" rows={4} maxLength={3000} defaultValue={initial("description")} className="field resize-y" />
        </Field>
      </Card>

      <Card title="Jenis acara dan layanan">
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Jenis acara</legend>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map((t) => (
              <label
                key={t.value}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-line bg-surface px-3 py-1.5 text-sm has-[:checked]:border-transparent has-[:checked]:bg-(--chip) has-[:checked]:text-white has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-cobalt-wash"
                style={{ "--chip": t.color } as CSSProperties}
              >
                <input type="checkbox" name="event_types" value={t.value} defaultChecked={selectedTypes.includes(t.value)} className="peer sr-only" />
                <span className="size-2 rounded-full" style={{ background: t.color }} aria-hidden />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>
        <Field label="Layanan" htmlFor="services" hint="Pisahkan dengan |, contoh: Dekorasi | MC | Sound system" className="mt-4">
          <input id="services" name="services" defaultValue={v ? v.services : join(eo?.services, " | ")} className="field" />
        </Field>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Kapasitas maksimal (peserta)" htmlFor="capacity">
            <input id="capacity" name="capacity" type="number" min={0} defaultValue={initial("capacity")} className="field" />
          </Field>
          <Field label="Anggaran mulai (Rp)" htmlFor="min_budget">
            <input id="min_budget" name="min_budget" type="number" min={0} step={1000000} defaultValue={initial("min_budget")} className="field" />
          </Field>
        </div>
      </Card>

      <Card title="Kontak dan lokasi">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Telepon / WhatsApp" htmlFor="phone">
            <input id="phone" name="phone" type="tel" maxLength={40} defaultValue={initial("phone")} className="field" />
          </Field>
          <Field label="Email" htmlFor="email">
            <input id="email" name="email" type="email" defaultValue={initial("email")} className="field" />
          </Field>
          <Field label="Website" htmlFor="website">
            <input id="website" name="website" defaultValue={initial("website")} placeholder="https://" className="field" />
          </Field>
          <Field label="Instagram" htmlFor="instagram">
            <input id="instagram" name="instagram" defaultValue={initial("instagram")} placeholder="https://instagram.com/…" className="field" />
          </Field>
          <Field label="Kota" htmlFor="city">
            <input id="city" name="city" maxLength={100} defaultValue={initial("city")} className="field" />
          </Field>
          <Field label="Provinsi" htmlFor="province">
            <input id="province" name="province" maxLength={100} defaultValue={initial("province")} className="field" />
          </Field>
        </div>
        <Field label="Alamat" htmlFor="address" className="mt-4">
          <input id="address" name="address" maxLength={500} defaultValue={initial("address")} className="field" />
        </Field>
        <Field label="Link Google Maps" htmlFor="google_maps_url" className="mt-4">
          <input id="google_maps_url" name="google_maps_url" defaultValue={initial("google_maps_url")} className="field" />
        </Field>
      </Card>

      <Card title="Reputasi dan portofolio">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Rating (0–5)" htmlFor="rating">
            <input id="rating" name="rating" type="number" min={0} max={5} step={0.1} defaultValue={initial("rating")} className="field" />
          </Field>
          <Field label="Jumlah ulasan" htmlFor="review_count">
            <input id="review_count" name="review_count" type="number" min={0} defaultValue={initial("review_count", "0")} className="field" />
          </Field>
          <Field label="Total acara ditangani" htmlFor="total_events">
            <input id="total_events" name="total_events" type="number" min={0} defaultValue={initial("total_events")} className="field" />
          </Field>
        </div>
        <Field label="Foto portofolio" htmlFor="portfolio_images" hint="Satu URL gambar per baris, maksimal 12" className="mt-4">
          <textarea
            id="portfolio_images"
            name="portfolio_images"
            rows={3}
            defaultValue={v ? v.portfolio_images : join(eo?.portfolio_images, "\n")}
            className="field resize-y font-mono text-xs"
          />
        </Field>
      </Card>

      <Card title="Publikasi">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="verified" defaultChecked={v ? v.verified === "true" : (eo?.verified ?? false)} className="size-5 accent-[var(--cobalt)]" />
            Terverifikasi
          </label>
          <label className="flex items-center gap-3 text-sm">
            Status
            <select name="status" defaultValue={initial("status", "active")} className="field w-auto">
              <option value="active">Aktif (tampil di direktori)</option>
              <option value="inactive">Nonaktif (disembunyikan)</option>
            </select>
          </label>
        </div>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-line bg-paper/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <Link href="/admin/eo" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-soft hover:text-ink">
          Batal
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-cobalt px-6 py-2.5 text-sm font-semibold text-white hover:bg-cobalt-deep disabled:opacity-60"
        >
          {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {eo ? "Simpan perubahan" : "Tambah EO"}
        </button>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 className="font-display mb-4 font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, htmlFor, hint, className = "", children }: { label: string; htmlFor: string; hint?: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
