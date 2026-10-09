"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateLeadStatus } from "@/app/admin/actions";
import { LEAD_STATUSES } from "@/lib/constants";

export function LeadStatusSelect({ leadId, requestId, status }: { leadId: string; requestId: string; status: string }) {
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();
  const tone = LEAD_STATUSES.find((s) => s.value === value)?.tone ?? "";

  return (
    // Sits inside a <summary>; stop clicks from toggling the row open.
    <label className="inline-block" onClick={(e) => e.preventDefault()}>
      <span className="sr-only">Status lead</span>
      <select
        value={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          const previous = value;
          setValue(next);
          startTransition(async () => {
            const result = await updateLeadStatus(leadId, requestId, next);
            if (result.ok) toast.success(result.message);
            else {
              setValue(previous);
              toast.error(result.error);
            }
          });
        }}
        className={`cursor-pointer appearance-none rounded-full border-0 py-1.5 pl-3 pr-3 text-xs font-semibold outline-offset-2 disabled:opacity-60 ${tone}`}
      >
        {LEAD_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}
