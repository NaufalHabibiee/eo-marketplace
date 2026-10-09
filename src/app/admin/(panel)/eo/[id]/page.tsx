import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EOForm } from "@/components/admin/eo-form";
import { createServerSupabase } from "@/lib/supabase/server";
import type { EO } from "@/lib/types";

export const metadata: Metadata = { title: "Edit EO" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function EditEOPage(props: PageProps<"/admin/eo/[id]">) {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/eo" className="text-sm text-ink-muted hover:text-ink">
        Kelola EO
      </Link>
      <Suspense fallback={<div className="mt-8 h-[70vh] animate-pulse rounded-2xl bg-line/40" />}>
        <EditContent params={props.params} />
      </Suspense>
    </div>
  );
}

async function EditContent({ params }: Pick<PageProps<"/admin/eo/[id]">, "params">) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("eo").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Gagal memuat EO: ${error.message}`);
  if (!data) notFound();
  const eo = data as EO;

  return (
    <>
      <h1 className="font-display mt-2 text-3xl font-bold tracking-tight">{eo.company_name}</h1>
      <div className="mt-8">
        <EOForm eo={eo} />
      </div>
    </>
  );
}
