/**
 * Stock photos (Pixabay licence) shown while an EO has not uploaded its own portfolio.
 * Every place that renders them labels them as sample images.
 */
type Photo = { src: string; caption: string };

const P = (id: string, caption: string): Photo => ({ src: `/portfolio/${id}.jpg`, caption });

const WEDDING = [
  P("1854074", "Resepsi taman"),
  P("1284245", "Meja jamuan pengantin"),
  P("3884732", "Gala dinner ballroom"),
  P("1854076", "Wedding tepi pantai"),
  P("4736377", "Ballroom resepsi"),
];
const CORPORATE = [
  P("4736377", "Ballroom gala perusahaan"),
  P("1284245", "Jamuan makan malam"),
  P("7693055", "Town hall karyawan"),
  P("2816353", "Sesi seminar"),
  P("3884732", "Gala dinner"),
];
const CONFERENCE = [
  P("1597531", "Konferensi auditorium"),
  P("7693055", "Presentasi utama"),
  P("2816353", "Sesi panel"),
  P("4610564", "Pembicara tamu"),
];
const EXHIBITION = [P("1853361", "Bazar dan booth"), P("419284", "Tenda pameran"), P("1597531", "Ruang konvensi")];
const SHOW = [
  P("2527495", "Konser dengan confetti"),
  P("2571539", "Penutupan acara"),
  P("1853662", "Panggung dan lighting"),
  P("1850119", "Festival musik"),
];

const POOLS: Record<string, Photo[]> = {
  Wedding: WEDDING,
  "Corporate Event": CORPORATE,
  Conference: CONFERENCE,
  "Government Event": CONFERENCE,
  Exhibition: EXHIBITION,
  Festival: SHOW,
  Entertainment: SHOW,
};

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

function poolFor(eventTypes: string[]): Photo[] {
  const merged: Photo[] = [];
  for (const t of eventTypes.length ? eventTypes : ["Corporate Event"]) {
    for (const p of POOLS[t] ?? CORPORATE) if (!merged.some((m) => m.src === p.src)) merged.push(p);
  }
  for (const p of [...CORPORATE, ...SHOW]) {
    if (merged.length >= 5) break;
    if (!merged.some((m) => m.src === p.src)) merged.push(p);
  }
  return merged;
}

/** Same EO always gets the same photos, different EOs get a different order. */
export function samplePhotos(slug: string, eventTypes: string[], count = 5): Photo[] {
  const merged = poolFor(eventTypes);
  const offset = hash(slug) % merged.length;
  return [...merged.slice(offset), ...merged.slice(0, offset)].slice(0, count);
}

/** In a list, the card position drives the choice so neighbours never share a photo. */
export function coverPhoto(slug: string, eventTypes: string[], position?: number): Photo {
  if (position === undefined) return samplePhotos(slug, eventTypes, 1)[0];
  const pool = poolFor(eventTypes);
  return pool[(position + (hash(slug) % 2)) % pool.length];
}
