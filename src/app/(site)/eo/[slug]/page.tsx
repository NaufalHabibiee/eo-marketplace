import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import {
  AtSign,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Clock,
  ExternalLink,
  Globe,
  Images,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Quote,
  ShieldCheck,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { TypeChip } from "@/components/badges";
import { EOAvatar } from "@/components/eo-avatar";
import { CompareButton, FavoriteButton } from "@/components/eo-actions";
import { EOPass } from "@/components/eo-pass";
import { ProfileActionBar } from "@/components/profile-action-bar";
import { EVENT_TYPES } from "@/lib/constants";
import { getActiveSlugs, getEOBySlug, getSimilarEOs } from "@/lib/eo-data";
import { displayUrl, formatNumber, formatRating, formatRupiah, initials, safeExternalUrl, telLink, whatsappLink } from "@/lib/format";
import { samplePhotos } from "@/lib/sample-photos";
import { sampleReviews } from "@/lib/sample-reviews";
import type { EO } from "@/lib/types";

export async function generateStaticParams() {
  const slugs = await getActiveSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/eo/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const eo = await getEOBySlug(slug);
  if (!eo) return { title: "EO tidak ditemukan" };
  return {
    title: eo.company_name,
    description: eo.description ?? `Profil ${eo.company_name} di EO Marketplace.`,
  };
}

export default function EOProfilePage(props: PageProps<"/eo/[slug]">) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Profile params={props.params} />
    </Suspense>
  );
}

type Fact = { label: string; value: string; icon: ReactNode };

async function Profile({ params }: Pick<PageProps<"/eo/[slug]">, "params">) {
  const { slug } = await params;
  const eo = await getEOBySlug(slug);
  if (!eo) notFound();

  const wa = whatsappLink(eo.phone, `Halo ${eo.company_name}, saya menemukan profil Anda di EO Marketplace dan ingin bertanya tentang jasa EO.`);
  const requestHref = `/request?eo=${encodeURIComponent(eo.slug)}`;
  const hasOwnPortfolio = eo.portfolio_images.length > 0;
  const photos = hasOwnPortfolio
    ? eo.portfolio_images.map((src, i) => ({ src, caption: `Portofolio ${i + 1}` }))
    : samplePhotos(eo.slug, eo.event_types, 5);
  const cover = photos[0];
  const location = [eo.city, eo.province && eo.province !== eo.city ? eo.province : null].filter(Boolean).join(", ");
  const reviews = sampleReviews(eo.company_name, eo.slug, eo.event_types, 3);

  const stats = [
    { label: "Rating Google", value: eo.rating != null ? formatRating(eo.rating) : "–", icon: <Star className="size-4" /> },
    { label: "Ulasan klien", value: formatNumber(eo.review_count), icon: <Users className="size-4" /> },
    { label: "Jenis acara", value: String(eo.event_types.length || 1), icon: <CalendarDays className="size-4" /> },
    { label: "Status profil", value: eo.verified ? "Terverifikasi" : "Belum diklaim", icon: <ShieldCheck className="size-4" /> },
  ];

  const facts: Fact[] = [];
  if (eo.year_established) facts.push({ label: "Berdiri sejak", value: String(eo.year_established), icon: <Clock className="size-4" /> });
  if (eo.total_events) facts.push({ label: "Acara ditangani", value: `${formatNumber(eo.total_events)} acara`, icon: <CalendarDays className="size-4" /> });
  if (eo.capacity) facts.push({ label: "Kapasitas maksimal", value: `${formatNumber(eo.capacity)} peserta`, icon: <Users className="size-4" /> });
  if (eo.min_budget) facts.push({ label: "Anggaran mulai", value: formatRupiah(eo.min_budget), icon: <Wallet className="size-4" /> });

  return (
    <div className="pb-24 lg:pb-0">
      <ProfileActionBar watchId="profile-card">
        <div className="flex min-w-0 items-center gap-3">
          <EOAvatar name={eo.company_name} logo={eo.logo} primaryType={eo.event_types[0]} size="sm" />
          <div className="min-w-0">
            <p className="font-display flex items-center gap-1.5 truncate font-semibold">
              {eo.company_name}
              {eo.verified && <BadgeCheck className="size-4 shrink-0 text-cobalt" aria-hidden />}
            </p>
            <p className="flex items-center gap-1 text-xs text-ink-muted">
              <Star className="size-3" fill="var(--marigold)" stroke="var(--marigold)" aria-hidden />
              {formatRating(eo.rating)} dari {formatNumber(eo.review_count)} ulasan
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold ring-1 ring-line-strong hover:bg-paper">
              <MessageCircle className="size-4" aria-hidden />
              WhatsApp
            </a>
          )}
          <Link href={requestHref} className="inline-flex h-10 items-center rounded-full bg-cobalt px-5 text-sm font-semibold text-white hover:bg-cobalt-deep">
            Minta penawaran
          </Link>
        </div>
      </ProfileActionBar>

      <section className="relative">
        <div className="relative h-[260px] overflow-hidden bg-ink sm:h-[360px]">
          <Image src={cover.src} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/40 to-ink/20" aria-hidden />
          <div className="relative mx-auto flex h-full max-w-7xl items-start justify-between px-4 pt-6 sm:px-6">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-white/70">
              <Link href="/" className="hover:text-white">
                Beranda
              </Link>
              <ChevronRight className="size-3.5" aria-hidden />
              <Link href="/explore" className="hover:text-white">
                Cari EO
              </Link>
              <ChevronRight className="size-3.5" aria-hidden />
              <span className="line-clamp-1 text-white">{eo.company_name}</span>
            </nav>
            {!hasOwnPortfolio && <span className="hidden rounded-full bg-black/35 px-3 py-1 text-xs text-white/80 backdrop-blur sm:inline">Foto ilustrasi</span>}
          </div>
        </div>

        <div className="relative mx-auto -mt-24 max-w-7xl px-4 sm:-mt-28 sm:px-6">
          <div id="profile-card" className="rounded-3xl border border-line bg-surface p-6 shadow-[0_30px_60px_-40px_rgba(22,24,58,0.5)] sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <span className="w-fit rounded-[30px] bg-surface p-1.5 shadow-[0_10px_30px_-15px_rgba(22,24,58,0.5)]">
                  <EOAvatar name={eo.company_name} logo={eo.logo} primaryType={eo.event_types[0]} size="xl" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{eo.company_name}</h1>
                    {eo.verified && <BadgeCheck className="size-7 text-cobalt" aria-label="Terverifikasi" />}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-ink-soft">
                    {location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-4" aria-hidden />
                        {location}
                      </span>
                    )}
                    {eo.rating != null && (
                      <span className="flex items-center gap-1.5">
                        <Star className="size-4" fill="var(--marigold)" stroke="var(--marigold)" aria-hidden />
                        <strong className="font-semibold text-ink">{formatRating(eo.rating)}</strong>
                        <span className="text-sm">dari {formatNumber(eo.review_count)} ulasan</span>
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {eo.event_types.map((t) => (
                      <TypeChip key={t} type={t} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <FavoriteButton id={eo.id} name={eo.company_name} variant="outline" />
                <CompareButton slug={eo.slug} name={eo.company_name} variant="outline" />
                <Link href={requestHref} className="inline-flex h-12 items-center justify-center rounded-full bg-cobalt px-6 font-semibold text-white transition-colors hover:bg-cobalt-deep">
                  Minta penawaran
                </Link>
              </div>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line ring-1 ring-line lg:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-surface px-5 py-4">
                  <dt className="flex items-center gap-2 text-xs text-ink-muted">
                    <span aria-hidden>{s.icon}</span>
                    {s.label}
                  </dt>
                  <dd className="font-display mt-1 text-xl font-semibold text-ink">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-14 max-w-7xl space-y-16 px-4 sm:px-6">
        <section className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
          <div>
            <SectionTitle title="Tentang" />
            <p className="max-w-[68ch] text-[1.05rem] leading-relaxed text-ink-soft">{eo.description || "Pemilik belum menambahkan deskripsi."}</p>
            {facts.length > 0 && (
              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                {facts.map((f) => (
                  <div key={f.label} className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3 ring-1 ring-line">
                    <span className="grid size-9 place-items-center rounded-lg bg-cobalt-wash text-cobalt" aria-hidden>
                      {f.icon}
                    </span>
                    <div>
                      <dt className="text-xs text-ink-muted">{f.label}</dt>
                      <dd className="font-semibold text-ink">{f.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            )}
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {(eo.services.length ? eo.services : eo.event_types).map((s) => (
                <li key={s} className="flex items-start gap-3 rounded-xl bg-surface p-4 ring-1 ring-line">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-ink text-paper" aria-hidden>
                    <CalendarDays className="size-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{s}</p>
                    <p className="mt-0.5 text-sm text-ink-muted">{EVENT_TYPES.find((t) => t.value === s)?.blurb ?? "Layanan yang ditawarkan EO ini"}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <ContactCard eo={eo} wa={wa} />
        </section>

        <section>
          <SectionTitle
            title="Portofolio"
            action={
              <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
                <Images className="size-4" aria-hidden />
                {photos.length} foto
              </span>
            }
          />
          {!hasOwnPortfolio && (
            <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
              <strong className="font-semibold">Foto contoh (dummy).</strong> {eo.company_name} belum mengunggah portofolio asli. Foto di bawah hanya ilustrasi
              jenis acara yang mereka tangani.
            </p>
          )}
          <div className="grid auto-rows-[170px] grid-cols-2 gap-3 sm:auto-rows-[210px] lg:grid-cols-4">
            {photos.map((photo, i) => (
              <figure key={`${photo.src}-${i}`} className={`group relative overflow-hidden rounded-2xl bg-line ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                <Image
                  src={photo.src}
                  alt={hasOwnPortfolio ? `Portofolio ${eo.company_name} ${i + 1}` : `Contoh acara: ${photo.caption}`}
                  fill
                  sizes={i === 0 ? "(min-width: 1024px) 620px, 100vw" : "(min-width: 1024px) 310px, 50vw"}
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-linear-to-t from-ink/80 to-transparent px-3 pb-2.5 pt-8 text-xs text-white">
                  <span className="font-medium">{photo.caption}</span>
                  {!hasOwnPortfolio && <span className="rounded-full bg-white/20 px-2 py-0.5 backdrop-blur">Dummy</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle title="Testimoni klien" action={<span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">Contoh testimoni (dummy)</span>} />
          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            <div className="flex flex-col justify-between rounded-2xl bg-ink p-6 text-paper">
              <div>
                <p className="font-display text-5xl font-bold">{formatRating(eo.rating)}</p>
                <p className="mt-2 flex gap-0.5" aria-label={`Rating ${formatRating(eo.rating)} dari 5`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="size-5" fill={i < Math.round(eo.rating ?? 0) ? "var(--marigold)" : "transparent"} stroke="var(--marigold)" aria-hidden />
                  ))}
                </p>
                <p className="mt-3 text-sm text-paper/70">Rating asli dari {formatNumber(eo.review_count)} ulasan di Google Maps.</p>
              </div>
              {safeExternalUrl(eo.google_maps_url) && (
                <a
                  href={safeExternalUrl(eo.google_maps_url)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:underline"
                >
                  Baca ulasan di Google
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              )}
            </div>
            <ul className="grid gap-4 md:grid-cols-3">
              {reviews.map((r) => (
                <li key={r.name} className="flex flex-col rounded-2xl bg-surface p-5 ring-1 ring-line">
                  <Quote className="size-6 text-cobalt/30" aria-hidden />
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{r.text}</p>
                  <p className="mt-4 flex gap-0.5" aria-label={`${r.rating} dari 5 bintang`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className="size-3.5" fill={i < r.rating ? "var(--marigold)" : "transparent"} stroke="var(--marigold)" aria-hidden />
                    ))}
                  </p>
                  <div className="mt-3 flex items-center gap-3 border-t border-line pt-4">
                    <span className="font-display grid size-9 shrink-0 place-items-center rounded-full bg-cobalt-wash text-xs font-semibold text-cobalt-deep" aria-hidden>
                      {initials(r.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{r.name}</p>
                      <p className="truncate text-xs text-ink-muted">
                        {r.event}, {r.date}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {eo.address && (
          <section>
            <SectionTitle title="Lokasi kantor" />
            <div className="relative overflow-hidden rounded-3xl ring-1 ring-line">
              <iframe
                title={`Peta lokasi ${eo.company_name}`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(eo.address)}&z=15&output=embed`}
                className="h-80 w-full border-0 grayscale-[30%] sm:h-96"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="bg-surface p-5 sm:absolute sm:bottom-5 sm:left-5 sm:max-w-sm sm:rounded-2xl sm:shadow-[0_20px_40px_-20px_rgba(22,24,58,0.5)] sm:ring-1 sm:ring-line">
                <p className="font-display font-semibold">{eo.company_name}</p>
                <p className="mt-1 flex items-start gap-2 text-sm leading-relaxed text-ink-soft">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden />
                  {eo.address}
                </p>
                {safeExternalUrl(eo.google_maps_url) && (
                  <a
                    href={safeExternalUrl(eo.google_maps_url)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-cobalt hover:text-cobalt-deep"
                  >
                    Buka di Google Maps
                    <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                )}
              </div>
            </div>
          </section>
        )}
      </div>

      <Suspense fallback={null}>
        <Similar eo={eo} />
      </Suspense>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 p-3 backdrop-blur lg:hidden">
        <Link href={requestHref} className="flex h-12 items-center justify-center rounded-full bg-cobalt font-semibold text-white">
          Minta penawaran
        </Link>
      </div>
    </div>
  );
}

function ContactCard({ eo, wa }: { eo: EO; wa: string | null }) {
  const website = safeExternalUrl(eo.website);
  const ig = eo.instagram ? safeExternalUrl(eo.instagram) : null;
  const rows: { href: string; icon: ReactNode; label: string; hint: string; external?: boolean }[] = [];
  if (wa) rows.push({ href: wa, icon: <MessageCircle className="size-4" />, label: "Chat WhatsApp", hint: "Balasan paling cepat", external: true });
  if (eo.phone) rows.push({ href: telLink(eo.phone), icon: <Phone className="size-4" />, label: eo.phone, hint: "Telepon" });
  if (eo.email) rows.push({ href: `mailto:${eo.email}`, icon: <Mail className="size-4" />, label: eo.email, hint: "Email" });
  if (website) rows.push({ href: website, icon: <Globe className="size-4" />, label: displayUrl(website), hint: "Website", external: true });
  if (ig) rows.push({ href: ig, icon: <AtSign className="size-4" />, label: "Instagram", hint: "Media sosial", external: true });

  return (
    <aside className="h-fit rounded-3xl bg-surface p-6 ring-1 ring-line">
      <h2 className="font-display text-lg font-semibold">Hubungi {eo.company_name}</h2>
      <p className="mt-1 text-sm text-ink-muted">Kirim permintaan resmi agar tercatat, atau hubungi langsung.</p>
      {rows.length > 0 && (
        <ul className="mt-5 space-y-2">
          {rows.map((r) => (
            <li key={r.href}>
              <a
                href={r.href}
                {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex items-center gap-3 rounded-xl bg-paper px-4 py-3 transition-colors hover:bg-cobalt-wash"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface text-cobalt ring-1 ring-line" aria-hidden>
                  {r.icon}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">{r.label}</span>
                  <span className="block text-xs text-ink-muted">{r.hint}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
      <Link
        href={`/request?eo=${encodeURIComponent(eo.slug)}`}
        className="mt-5 flex h-12 items-center justify-center rounded-full bg-ink font-semibold text-paper transition-colors hover:bg-cobalt"
      >
        Minta penawaran gratis
      </Link>
      {!eo.verified && (
        <p className="mt-4 text-xs leading-relaxed text-ink-muted">Profil ini belum diklaim pemiliknya. Data diambil dari informasi publik dan bisa berubah.</p>
      )}
    </aside>
  );
}

async function Similar({ eo }: { eo: EO }) {
  const similar = await getSimilarEOs({ id: eo.id, event_types: eo.event_types, city: eo.city });
  if (similar.length === 0) return null;
  return (
    <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-2xl font-bold tracking-tight">EO lain untuk {eo.event_types[0] ?? "acaramu"}</h2>
        <Link href={`/explore?type=${encodeURIComponent(eo.event_types[0] ?? "")}`} className="text-sm font-semibold text-cobalt hover:text-cobalt-deep">
          Lihat semua
        </Link>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {similar.map((s, i) => (
          <EOPass key={s.id} eo={s} position={i + 1} />
        ))}
      </div>
    </section>
  );
}

function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      {action}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat profil">
      <div className="h-[360px] animate-pulse bg-line/60" />
      <div className="mx-auto -mt-28 max-w-7xl px-4 sm:px-6">
        <div className="h-64 animate-pulse rounded-3xl bg-surface ring-1 ring-line" />
      </div>
    </div>
  );
}
