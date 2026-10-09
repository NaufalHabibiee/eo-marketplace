import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "Daftar" };

export default function SignUpPage(props: PageProps<"/daftar">) {
  return (
    <AuthShell
      welcome="Halo!"
      headline="Satu akun untuk semua acaramu"
      blurb="Daftar gratis untuk menyimpan semua permintaan penawaran, memantau respons EO, dan mengisi formulir tanpa mengetik ulang."
    >
      <Suspense fallback={<div className="mx-auto h-96 max-w-sm animate-pulse rounded-2xl bg-line/40" />}>
        <Form searchParams={props.searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function Form({ searchParams }: Pick<PageProps<"/daftar">, "searchParams">) {
  const params = await searchParams;
  const next = typeof params.next === "string" && params.next.startsWith("/") && !params.next.startsWith("//") ? params.next : "/akun";
  return <AuthForm initialMode="signup" next={next} />;
}
