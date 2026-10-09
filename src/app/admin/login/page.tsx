import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { BrandMark } from "@/components/site-chrome";

export const metadata: Metadata = { title: "Masuk" };

const ERRORS: Record<string, string> = {
  oauth: "Login Google gagal. Coba lagi, atau masuk dengan email.",
  forbidden: "Akun ini belum punya akses admin.",
};

export default function AdminLoginPage(props: PageProps<"/admin/login">) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div
        className="relative hidden overflow-hidden bg-ink lg:block"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(44,75,255,0.55) 0 2px, transparent 2px 46px), linear-gradient(160deg, var(--cobalt-deep), var(--ink) 70%)",
        }}
        aria-hidden
      >
        <div className="absolute inset-0 bg-linear-to-br from-ink/30 via-ink/70 to-ink" />
        <div className="absolute bottom-12 left-12 right-12 text-paper">
          <p className="font-display text-4xl font-bold leading-tight">Kelola EO dan pantau permintaan acara yang masuk.</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-sm">
          <BrandMark className="size-10" />
          <h1 className="font-display mt-6 text-3xl font-bold tracking-tight">Masuk admin</h1>
          <p className="mt-2 text-ink-soft">Hanya untuk tim EO Marketplace.</p>
          <Suspense fallback={<div className="mt-8 h-72 animate-pulse rounded-2xl bg-line/40" />}>
            <LoginWithError searchParams={props.searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function LoginWithError({ searchParams }: Pick<PageProps<"/admin/login">, "searchParams">) {
  const { error } = await searchParams;
  const message = typeof error === "string" ? ERRORS[error] : undefined;
  return <LoginForm initialError={message} />;
}
