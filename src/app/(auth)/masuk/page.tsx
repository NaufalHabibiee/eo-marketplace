import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "Masuk" };

const ERRORS: Record<string, string> = {
  oauth: "Login gagal atau link sudah kedaluwarsa. Coba lagi.",
};

export default function SignInPage(props: PageProps<"/masuk">) {
  return (
    <AuthShell
      welcome="Selamat datang"
      headline="Temukan EO terbaik untuk acaramu"
      blurb="Masuk untuk melacak status permintaan penawaran, menyimpan data kontak, dan mengirim kebutuhan acara lebih cepat."
    >
      <Suspense fallback={<div className="mx-auto h-96 max-w-sm animate-pulse rounded-2xl bg-line/40" />}>
        <Form searchParams={props.searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function Form({ searchParams }: Pick<PageProps<"/masuk">, "searchParams">) {
  const params = await searchParams;
  const next = typeof params.next === "string" && params.next.startsWith("/") && !params.next.startsWith("//") ? params.next : "/akun";
  const error = typeof params.error === "string" ? ERRORS[params.error] : undefined;
  return <AuthForm initialMode="signin" next={next} initialError={error} />;
}
