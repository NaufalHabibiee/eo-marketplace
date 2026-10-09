"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteEO, setEOStatus, setEOVerified, type ActionResult } from "@/app/admin/actions";

function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
        checked ? "bg-cobalt" : "bg-line-strong"
      }`}
    >
      <span className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5.5" : "translate-x-0.5"}`} />
    </button>
  );
}

export function EOToggles({ id, name, verified, active }: { id: string; name: string; verified: boolean; active: boolean }) {
  const [state, setState] = useState({ verified, active });
  const [pending, startTransition] = useTransition();

  function run(patch: Partial<typeof state>, action: () => Promise<ActionResult>) {
    const previous = state;
    setState({ ...state, ...patch });
    startTransition(async () => {
      const result = await action();
      if (result.ok) toast.success(result.message);
      else {
        setState(previous);
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <td className="px-3 py-3">
      <Switch
        checked={state.verified}
        disabled={pending}
        label={`Verifikasi ${name}`}
        onChange={(v) => run({ verified: v }, () => setEOVerified(id, v))}
      />
      </td>
      <td className="px-3 py-3">
      <Switch
        checked={state.active}
        disabled={pending}
        label={`Tampilkan ${name} di direktori`}
        onChange={(v) => run({ active: v }, () => setEOStatus(id, v))}
      />
      </td>
    </>
  );
}

export function EOActions({ id, name, slug, active }: { id: string; name: string; slug: string; active: boolean }) {
  const [pending, startTransition] = useTransition();
  const iconBtn = "grid size-9 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-paper hover:text-ink";
  return (
    <div className="flex items-center justify-end gap-0.5">
      {active && (
        <Link href={`/eo/${slug}`} target="_blank" className={iconBtn} aria-label={`Lihat profil publik ${name}`} title="Lihat profil publik">
          <ExternalLink className="size-4" />
        </Link>
      )}
      <Link href={`/admin/eo/${id}`} className={iconBtn} aria-label={`Edit ${name}`} title="Edit">
        <Pencil className="size-4" />
      </Link>
      <button
        type="button"
        disabled={pending}
        className={`${iconBtn} hover:bg-danger/10 hover:text-danger disabled:opacity-50`}
        aria-label={`Hapus ${name}`}
        title="Hapus"
        onClick={() => {
          if (!window.confirm(`Hapus “${name}” secara permanen? Lead yang terkait tetap tersimpan tanpa EO.`)) return;
          startTransition(async () => {
            const result = await deleteEO(id);
            if (result.ok) toast.success(result.message);
            else toast.error(result.error);
          });
        }}
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
