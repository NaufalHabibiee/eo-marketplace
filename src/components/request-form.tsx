"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Building2, CalendarDays, Check, Clock, LoaderCircle, Lock, Mail, MapPin, Phone, User, Users, Wallet } from "lucide-react";
import { submitEventRequest, type RequestField, type RequestFormState } from "@/app/(site)/request/actions";
import { BUDGET_RANGES, EVENT_NEEDS, EVENT_TYPES } from "@/lib/constants";

type Props = {
  eoSlugs: string[];
  eoName: string | null;
  defaultType: string | null;
  minDate: string;
  selectedEO: ReactNode;
  account: { name: string; email: string } | null;
};

const SECTIONS = [
  { id: "kontak", title: "Data kontak", fields: ["name", "company", "email", "phone"] },
  { id: "acara", title: "Detail acara", fields: ["event_type", "location", "event_date", "participants"] },
  { id: "kebutuhan", title: "Anggaran dan kebutuhan", fields: ["budget", "description"] },
] as const;

const FIELD_ORDER: RequestField[] = SECTIONS.flatMap((s) => [...s.fields]);

function sectionDone(form: HTMLFormElement, fields: readonly string[]): boolean {
  const data = new FormData(form);
  return fields.every((f) => {
    const v = String(data.get(f) ?? "").trim();
    return f === "description" ? v.length >= 10 : v.length > 0;
  });
}

export function RequestForm({ eoSlugs, eoName, defaultType, minDate, selectedEO, account }: Props) {
  const [state, action, pending] = useActionState<RequestFormState, FormData>(submitEventRequest, {});
  const v = state.values ?? {};
  const err = state.errors ?? {};
  const formRef = useRef<HTMLFormElement>(null);
  const [done, setDone] = useState<boolean[]>([false, false, false]);
  const [descLength, setDescLength] = useState((v.description ?? "").length);

  const recompute = () => {
    const form = formRef.current;
    if (form) setDone(SECTIONS.map((s) => sectionDone(form, s.fields)));
  };

  useEffect(() => {
    const form = formRef.current;
    if (form) setDone(SECTIONS.map((s) => sectionDone(form, s.fields)));
    const first = FIELD_ORDER.find((f) => state.errors?.[f]);
    if (!first) return;
    const el = first === "budget" ? document.querySelector<HTMLInputElement>('input[name="budget"]') : document.getElementById(first);
    el?.focus();
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [state.errors]);

  const fieldProps = (name: RequestField) => ({
    id: name,
    name,
    "aria-invalid": err[name] ? true : undefined,
    "aria-describedby": err[name] ? `${name}-error` : undefined,
  });

  const completed = done.filter(Boolean).length;

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-10">
      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        {selectedEO}

        <nav aria-label="Bagian formulir" className="hidden rounded-2xl border border-line bg-surface p-5 lg:block">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-ink">Progres</span>
            <span className="text-ink-muted">{completed} dari 3 bagian</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
            <div className="h-full rounded-full bg-cobalt transition-[width] duration-500" style={{ width: `${(completed / 3) * 100}%` }} />
          </div>
          <ol className="mt-5 space-y-1">
            {SECTIONS.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-paper">
                  <span
                    className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors ${
                      done[i] ? "bg-cobalt text-white" : "border border-line-strong text-ink-soft"
                    }`}
                  >
                    {done[i] ? <Check className="size-3.5" strokeWidth={3} aria-label="selesai" /> : i + 1}
                  </span>
                  <span className={done[i] ? "text-ink" : "text-ink-soft"}>{s.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {account ? (
          <p className="rounded-2xl bg-cobalt-wash px-4 py-3 text-sm text-cobalt-deep">
            Masuk sebagai <strong className="font-semibold">{account.email}</strong>. Permintaan ini tersimpan di{" "}
            <Link href="/akun" className="font-semibold underline underline-offset-2">
              Permintaan saya
            </Link>
            .
          </p>
        ) : (
          <p className="rounded-2xl bg-surface px-4 py-3 text-sm text-ink-soft ring-1 ring-line">
            <Link href="/masuk?next=/request" className="font-semibold text-cobalt hover:text-cobalt-deep">
              Masuk
            </Link>{" "}
            untuk melacak status permintaan ini nanti. Opsional.
          </p>
        )}

        <ul className="hidden space-y-3 px-1 text-sm text-ink-soft lg:block">
          <Assurance icon={<Clock className="size-4" />}>EO biasanya merespons dalam 1–2 hari kerja</Assurance>
          <Assurance icon={<Lock className="size-4" />}>Datamu hanya dibagikan ke EO terkait</Assurance>
          <Assurance icon={<Wallet className="size-4" />}>Gratis, tanpa komitmen apa pun</Assurance>
        </ul>
      </aside>

      <form ref={formRef} action={action} noValidate onChange={recompute} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(22,24,58,0.04)]">
        {eoSlugs.map((slug) => (
          <input key={slug} type="hidden" name="eo" value={slug} />
        ))}

        {state.message && (
          <div role="alert" className="border-b border-danger/20 bg-danger/5 px-6 py-4 text-sm text-danger sm:px-8">
            {state.message}
          </div>
        )}

        <Section id="kontak" number={1} title="Data kontak" hint="EO akan menghubungimu lewat WhatsApp atau email ini.">
          <Field label="Nama lengkap" htmlFor="name" error={err.name}>
            <IconInput icon={<User className="size-4" />}>
              <input {...fieldProps("name")} defaultValue={v.name ?? account?.name} autoComplete="name" placeholder="Nama sesuai KTP" maxLength={120} className="field pl-10" />
            </IconInput>
          </Field>
          <Field label="Perusahaan atau instansi" htmlFor="company" error={err.company} hint="Tulis “Pribadi” untuk acara pribadi">
            <IconInput icon={<Building2 className="size-4" />}>
              <input {...fieldProps("company")} defaultValue={v.company} autoComplete="organization" placeholder="PT Contoh Indonesia" maxLength={160} className="field pl-10" />
            </IconInput>
          </Field>
          <Field label="Email kerja" htmlFor="email" error={err.email}>
            <IconInput icon={<Mail className="size-4" />}>
              <input {...fieldProps("email")} defaultValue={v.email ?? account?.email} type="email" autoComplete="email" placeholder="nama@kantor.com" maxLength={200} className="field pl-10" />
            </IconInput>
          </Field>
          <Field label="Nomor WhatsApp" htmlFor="phone" error={err.phone}>
            <IconInput icon={<Phone className="size-4" />}>
              <input
                {...fieldProps("phone")}
                defaultValue={v.phone}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="0812 3456 7890"
                maxLength={30}
                className="field pl-10"
              />
            </IconInput>
          </Field>
        </Section>

        <Section id="acara" number={2} title="Detail acara" hint="Perkiraan saja cukup, detailnya dibahas lagi bersama EO.">
          <Field label="Jenis acara" htmlFor="event_type" error={err.event_type}>
            <select {...fieldProps("event_type")} defaultValue={v.event_type ?? defaultType ?? ""} className="field">
              <option value="" disabled>
                Pilih jenis acara
              </option>
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Lokasi acara" htmlFor="location" error={err.location}>
            <IconInput icon={<MapPin className="size-4" />}>
              <input {...fieldProps("location")} defaultValue={v.location} placeholder="Kota atau nama venue" maxLength={200} className="field pl-10" />
            </IconInput>
          </Field>
          <Field label="Tanggal acara" htmlFor="event_date" error={err.event_date}>
            <IconInput icon={<CalendarDays className="size-4" />}>
              <input {...fieldProps("event_date")} defaultValue={v.event_date} type="date" min={minDate} className="field pl-10" />
            </IconInput>
          </Field>
          <Field label="Perkiraan peserta" htmlFor="participants" error={err.participants}>
            <IconInput icon={<Users className="size-4" />} suffix="orang">
              <input
                {...fieldProps("participants")}
                defaultValue={v.participants}
                type="number"
                inputMode="numeric"
                min={1}
                max={1000000}
                placeholder="250"
                className="field pl-10 pr-16"
              />
            </IconInput>
          </Field>
        </Section>

        <Section id="kebutuhan" number={3} title="Anggaran dan kebutuhan" hint="Bantu EO menyiapkan penawaran yang realistis.">
          <fieldset className="sm:col-span-2" aria-describedby={err.budget ? "budget-error" : undefined}>
            <legend className="mb-2 text-sm font-medium text-ink">Perkiraan anggaran</legend>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {BUDGET_RANGES.map((b) => (
                <label
                  key={b.value}
                  className="relative flex cursor-pointer items-start gap-3 rounded-xl border-[1.5px] border-line bg-surface px-4 py-3.5 transition-colors hover:border-line-strong has-[:checked]:border-cobalt has-[:checked]:bg-cobalt-wash/60 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-cobalt-wash"
                >
                  <input type="radio" name="budget" value={b.value} defaultChecked={v.budget === b.value} className="mt-0.5 size-4 accent-[var(--cobalt)]" />
                  <span>
                    <span className="block text-sm font-semibold text-ink">{b.label}</span>
                    <span className="mt-0.5 block text-xs text-ink-muted">{b.hint}</span>
                  </span>
                </label>
              ))}
            </div>
            {err.budget && (
              <p id="budget-error" className="mt-2 text-sm text-danger">
                {err.budget}
              </p>
            )}
          </fieldset>

          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm font-medium text-ink">
              Yang dibutuhkan <span className="font-normal text-ink-muted">(opsional)</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {EVENT_NEEDS.map((need) => (
                <label
                  key={need}
                  className="inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full border-[1.5px] border-line bg-surface px-3.5 py-1.5 text-sm text-ink-soft transition-colors hover:border-line-strong has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-cobalt-wash"
                >
                  <input type="checkbox" name="needs" value={need} defaultChecked={state.needs?.includes(need)} className="peer sr-only" />
                  <Check className="hidden size-3.5 peer-checked:block" strokeWidth={3} aria-hidden />
                  {need}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="sm:col-span-2">
            <Field label="Ceritakan acaramu" htmlFor="description" error={err.description}>
              <textarea
                {...fieldProps("description")}
                defaultValue={v.description}
                rows={5}
                maxLength={2800}
                onChange={(e) => setDescLength(e.target.value.length)}
                placeholder="Contoh: Gathering tahunan 250 karyawan, konsep outdoor, butuh rundown setengah hari dengan games dan doorprize."
                className="field resize-y leading-relaxed"
              />
            </Field>
            <p className={`mt-1.5 text-right text-xs ${descLength > 0 && descLength < 10 ? "text-danger" : "text-ink-muted"}`}>{descLength}/2.800</p>
          </div>
        </Section>

        <div className="flex flex-col-reverse gap-4 bg-paper/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-muted sm:max-w-md">
            <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Dengan mengirim, kamu setuju data ini dibagikan ke {eoName ?? "EO yang sesuai"} untuk keperluan penawaran.
          </p>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-cobalt px-7 font-semibold text-white transition-colors hover:bg-cobalt-deep disabled:cursor-wait disabled:opacity-70"
          >
            {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
            {pending ? "Mengirim permintaan…" : "Kirim permintaan"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ id, number, title, hint, children }: { id: string; number: number; title: string; hint: string; children: ReactNode }) {
  return (
    <section id={id} className="grid scroll-mt-24 gap-6 border-b border-line px-6 py-8 sm:px-8 xl:grid-cols-[200px_1fr] xl:gap-10">
      <div>
        <p className="text-xs font-semibold text-cobalt">Bagian {number} dari 3</p>
        <h2 className="font-display mt-1 text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{hint}</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, error, hint, htmlFor, children }: { label: string; error?: string; hint?: string; htmlFor: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function IconInput({ icon, suffix, children }: { icon: ReactNode; suffix?: string; children: ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden>
        {icon}
      </span>
      {children}
      {suffix && <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-muted">{suffix}</span>}
    </div>
  );
}

function Assurance({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-cobalt-wash text-cobalt" aria-hidden>
        {icon}
      </span>
      <span className="pt-1">{children}</span>
    </li>
  );
}
