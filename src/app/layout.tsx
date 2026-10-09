import type { Metadata } from "next";
import { Instrument_Sans, Poppins } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "EO Marketplace — Temukan event organizer yang tepat",
    template: "%s · EO Marketplace",
  },
  description:
    "Cari dan bandingkan event organizer di Jakarta dan sekitarnya, lalu kirim kebutuhan acaramu untuk mendapatkan penawaran.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className={`${instrument.variable} ${poppins.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
