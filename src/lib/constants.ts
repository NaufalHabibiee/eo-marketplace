export const EVENT_TYPES = [
  { value: "Corporate Event", label: "Corporate Event", color: "var(--cat-corporate)", blurb: "Gathering, launching, outing kantor" },
  { value: "Wedding", label: "Wedding", color: "var(--cat-wedding)", blurb: "Akad, resepsi, intimate wedding" },
  { value: "Conference", label: "Conference", color: "var(--cat-conference)", blurb: "Seminar, summit, MICE" },
  { value: "Exhibition", label: "Exhibition", color: "var(--cat-exhibition)", blurb: "Pameran, expo, booth" },
  { value: "Government Event", label: "Government Event", color: "var(--cat-government)", blurb: "Acara instansi dan BUMN" },
  { value: "Festival", label: "Festival", color: "var(--cat-festival)", blurb: "Festival, bazar, karnaval" },
  { value: "Entertainment", label: "Entertainment", color: "var(--cat-entertainment)", blurb: "Konser, show, hiburan" },
] as const;

export type EventType = (typeof EVENT_TYPES)[number]["value"];

export const EVENT_TYPE_VALUES = EVENT_TYPES.map((t) => t.value) as string[];

export function eventTypeColor(type: string): string {
  return EVENT_TYPES.find((t) => t.value === type)?.color ?? "var(--ink-muted)";
}

/** Upper bound (rupiah) is what we compare against an EO's minimum budget. */
export const BUDGET_RANGES = [
  { value: "lt-50", label: "Di bawah Rp50 juta", hint: "Gathering kecil, acara internal", max: 50_000_000 },
  { value: "50-150", label: "Rp50 – 150 juta", hint: "Seminar, launching skala menengah", max: 150_000_000 },
  { value: "150-500", label: "Rp150 – 500 juta", hint: "Konferensi, wedding besar", max: 500_000_000 },
  { value: "gt-500", label: "Di atas Rp500 juta", hint: "Festival, acara nasional", max: Number.MAX_SAFE_INTEGER },
] as const;

export const EVENT_NEEDS = [
  "Venue",
  "Katering",
  "Dekorasi",
  "MC & hiburan",
  "Sound & lighting",
  "Dokumentasi",
  "Transportasi",
  "Merchandise",
] as const;

export const CAPACITY_OPTIONS = [
  { value: "100", label: "100+ peserta" },
  { value: "500", label: "500+ peserta" },
  { value: "1000", label: "1.000+ peserta" },
  { value: "5000", label: "5.000+ peserta" },
] as const;

export const LEAD_STATUSES = [
  { value: "NEW", label: "Baru", tone: "bg-cobalt-wash text-cobalt-deep" },
  { value: "CONTACTED", label: "Dihubungi", tone: "bg-amber-100 text-amber-800" },
  { value: "IN_PROGRESS", label: "Diproses", tone: "bg-violet-100 text-violet-800" },
  { value: "WON", label: "Deal", tone: "bg-emerald-100 text-emerald-800" },
  { value: "LOST", label: "Batal", tone: "bg-zinc-200 text-zinc-700" },
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number]["value"];

export const LEAD_STATUS_VALUES = LEAD_STATUSES.map((s) => s.value) as string[];

export const PAGE_SIZE = 12;
