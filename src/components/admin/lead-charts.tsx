import { LEAD_STATUSES } from "@/lib/constants";
import { formatNumber } from "@/lib/format";

type Lead = { created_at: string; status: string };

const WEEKS = 8;
const DAY = 86_400_000;

function weekStart(date: Date): Date {
  // Monday-based weeks in Jakarta time (UTC+7, no DST).
  const local = new Date(date.getTime() + 7 * 3_600_000);
  const day = (local.getUTCDay() + 6) % 7;
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - day));
}

/** Request-time window for the dashboard queries; the page is dynamic so reading the clock is fine. */
export function chartWindow(): { now: number; since: string } {
  const now = Date.now();
  return { now, since: new Date(now - (WEEKS + 1) * 7 * DAY).toISOString() };
}

const shortDate = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "UTC" });

export function LeadCharts({ leads, now }: { leads: Lead[]; now: number }) {
  const thisWeek = weekStart(new Date(now)).getTime();
  const weeks = Array.from({ length: WEEKS }, (_, i) => {
    const start = thisWeek - (WEEKS - 1 - i) * 7 * DAY;
    return { start, count: 0 };
  });
  for (const lead of leads) {
    const w = weekStart(new Date(lead.created_at)).getTime();
    const bucket = weeks.find((b) => b.start === w);
    if (bucket) bucket.count += 1;
  }
  const maxWeek = Math.max(1, ...weeks.map((w) => w.count));
  const total = weeks.reduce((sum, w) => sum + w.count, 0);

  const statuses = LEAD_STATUSES.map((s) => ({ ...s, count: leads.filter((l) => l.status === s.value).length }));
  const maxStatus = Math.max(1, ...statuses.map((s) => s.count));

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <figure className="rounded-2xl bg-surface p-5 ring-1 ring-line">
        <figcaption className="flex items-baseline justify-between gap-3">
          <span className="font-display font-semibold">Lead per minggu</span>
          <span className="text-sm text-ink-muted">{formatNumber(total)} lead, 8 minggu terakhir</span>
        </figcaption>
        <div className="mt-6 flex h-44 items-end gap-2 border-b border-line" role="img" aria-label={`Grafik lead per minggu, total ${total}`}>
          {weeks.map((w) => {
            const label = shortDate.format(new Date(w.start));
            return (
              <div key={w.start} className="group relative flex h-full flex-1 flex-col justify-end">
                <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs text-paper opacity-0 transition-opacity group-hover:opacity-100">
                  Minggu {label}: <strong>{w.count}</strong> lead
                </span>
                {w.count > 0 && <span className="mb-1 text-center text-xs font-semibold text-ink-soft">{w.count}</span>}
                <div
                  className="mx-auto w-full max-w-10 rounded-t-[4px] bg-cobalt transition-colors group-hover:bg-cobalt-deep"
                  style={{ height: `${(w.count / maxWeek) * 82}%`, minHeight: w.count ? 4 : 0 }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex gap-2 text-[0.68rem] text-ink-muted">
          {weeks.map((w) => (
            <span key={w.start} className="flex-1 text-center">
              {shortDate.format(new Date(w.start))}
            </span>
          ))}
        </div>
      </figure>

      <figure className="rounded-2xl bg-surface p-5 ring-1 ring-line">
        <figcaption className="flex items-baseline justify-between gap-3">
          <span className="font-display font-semibold">Status lead</span>
          <span className="text-sm text-ink-muted">{formatNumber(leads.length)} total</span>
        </figcaption>
        <ul className="mt-5 space-y-3">
          {statuses.map((s) => (
            <li key={s.value} className="group relative grid grid-cols-[84px_1fr_28px] items-center gap-3 text-sm">
              <span className="text-ink-soft">{s.label}</span>
              <span className="h-3 overflow-hidden rounded-full bg-paper">
                <span
                  className="block h-full rounded-full bg-cobalt transition-colors group-hover:bg-cobalt-deep"
                  style={{ width: `${(s.count / maxStatus) * 100}%`, minWidth: s.count ? 6 : 0 }}
                />
              </span>
              <span className="text-right font-semibold tabular-nums text-ink">{s.count}</span>
              <span className="pointer-events-none absolute -top-8 left-24 z-10 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs text-paper opacity-0 transition-opacity group-hover:opacity-100">
                {s.label}: {s.count} dari {leads.length} lead ({leads.length ? Math.round((s.count / leads.length) * 100) : 0}%)
              </span>
            </li>
          ))}
        </ul>
      </figure>
    </div>
  );
}
