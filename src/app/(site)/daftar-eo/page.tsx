import type { Metadata } from "next";
import { BadgeCheck, Inbox, LineChart, Megaphone } from "lucide-react";
import { EOSignupForm } from "@/components/eo-signup-form";

export const metadata: Metadata = {
  title: "Daftarkan EO",
  description: "Daftarkan event organizer-mu di EO Marketplace dan terima permintaan penawaran dari klien.",
};

const BENEFITS = [
  { icon: <Inbox className="size-5" />, title: "Lead langsung masuk", body: "Klien mengirim kebutuhan lengkap: tanggal, lokasi, peserta, dan anggaran." },
  { icon: <BadgeCheck className="size-5" />, title: "Badge terverifikasi", body: "Profil yang lolos peninjauan mendapat tanda terverifikasi dan tampil lebih atas." },
  { icon: <Megaphone className="size-5" />, title: "Gratis saat peluncuran", body: "Tidak ada biaya pendaftaran maupun komisi selama masa peluncuran." },
  { icon: <LineChart className="size-5" />, title: "Profil yang menjual", body: "Tampilkan portofolio, layanan, dan ulasan klien dalam satu halaman." },
];

export default function EOSignupPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Daftarkan EO-mu</h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">
            Bergabung dengan direktori EO Jabodetabek dan terima permintaan penawaran dari klien yang sedang mencari.
          </p>
          <ul className="mt-8 space-y-4">
            {BENEFITS.map((b) => (
              <li key={b.title} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-cobalt-wash text-cobalt" aria-hidden>
                  {b.icon}
                </span>
                <div>
                  <p className="font-semibold text-ink">{b.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{b.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <EOSignupForm />
      </div>
    </div>
  );
}
