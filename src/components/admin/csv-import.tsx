"use client";

import { useRef, useState, useTransition } from "react";
import Papa from "papaparse";
import { FileUp, LoaderCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { importEOs } from "@/app/admin/actions";

type Parsed = { rows: Record<string, string>[]; fileName: string; missing: string[] };
type Summary = { inserted: number; updated: number; skipped: { row: number; errors: string[] }[] };

const REQUIRED = ["company_name"];
const BATCH = 200;

export function CsvImport() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [progress, setProgress] = useState(0);
  const [pending, startTransition] = useTransition();

  function onFile(file: File) {
    setSummary(null);
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File terlalu besar. Maksimal 5 MB.");
      return;
    }
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (result) => {
        const rows = result.data.filter((r) => Object.values(r).some((v) => String(v ?? "").trim()));
        const fields = result.meta.fields ?? [];
        const missing = REQUIRED.filter((c) => !fields.includes(c));
        if (rows.length === 0) {
          toast.error("File tidak berisi baris data.");
          return;
        }
        setParsed({ rows, fileName: file.name, missing });
      },
      error: () => toast.error("File CSV tidak bisa dibaca."),
    });
  }

  function runImport() {
    if (!parsed) return;
    startTransition(async () => {
      const total: Summary = { inserted: 0, updated: 0, skipped: [] };
      for (let i = 0; i < parsed.rows.length; i += BATCH) {
        const result = await importEOs(parsed.rows.slice(i, i + BATCH), i + 2);
        if (!result.ok) {
          toast.error(result.error);
          setSummary(total.inserted + total.updated + total.skipped.length ? total : null);
          return;
        }
        total.inserted += result.inserted;
        total.updated += result.updated;
        total.skipped.push(...result.skipped);
        setProgress(Math.min(100, Math.round(((i + BATCH) / parsed.rows.length) * 100)));
      }
      setSummary(total);
      setParsed(null);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
      toast.success(`Import selesai: ${total.inserted} baru, ${total.updated} diperbarui.`);
    });
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display font-semibold">Import CSV</h2>
          <p className="mt-1 max-w-lg text-sm text-ink-soft">
            Baris dengan slug yang sudah ada akan diperbarui, sisanya ditambahkan. Pisahkan banyak nilai (jenis acara, layanan, foto) dengan tanda |.
          </p>
        </div>
        <a href="/eo-import-template.csv" download className="text-sm font-semibold text-cobalt hover:text-cobalt-deep">
          Unduh template
        </a>
      </div>

      <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-line-strong px-4 py-6 text-center transition-colors hover:border-cobalt hover:bg-cobalt-wash/40 has-[:focus-visible]:border-cobalt">
        <FileUp className="size-6 text-ink-muted" aria-hidden />
        <span className="text-sm font-medium">{parsed ? parsed.fileName : "Pilih file .csv"}</span>
        <span className="text-xs text-ink-muted">{parsed ? `${parsed.rows.length} baris siap diimpor` : "Maksimal 5 MB"}</span>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
          }}
        />
      </label>

      {parsed && parsed.missing.length > 0 && (
        <p className="mt-3 text-sm text-danger">Kolom wajib tidak ditemukan: {parsed.missing.join(", ")}. Sesuaikan dengan template.</p>
      )}

      {parsed && parsed.missing.length === 0 && (
        <button
          type="button"
          onClick={runImport}
          disabled={pending}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-cobalt disabled:opacity-60"
        >
          {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
          {pending ? `Mengimpor… ${progress}%` : `Impor ${parsed.rows.length} baris`}
        </button>
      )}

      {summary && (
        <div className="mt-4 rounded-xl bg-paper p-4 text-sm" role="status">
          <p>
            <strong>{summary.inserted}</strong> EO baru, <strong>{summary.updated}</strong> diperbarui
            {summary.skipped.length > 0 && (
              <>
                , <strong className="text-danger">{summary.skipped.length}</strong> dilewati
              </>
            )}
            .
          </p>
          {summary.skipped.length > 0 && (
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-ink-soft">
              {summary.skipped.slice(0, 50).map((s) => (
                <li key={s.row}>
                  Baris {s.row}: {s.errors.join("; ")}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
