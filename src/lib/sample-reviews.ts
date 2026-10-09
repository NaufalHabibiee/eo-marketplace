/** Placeholder testimonials shown until real client reviews exist; always labelled as samples in the UI. */
export type SampleReview = { name: string; role: string; event: string; rating: number; text: string; date: string };

type Template = Omit<SampleReview, "text"> & { text: (eo: string) => string };

const POOL: Record<string, Template[]> = {
  "Corporate Event": [
    { name: "Rina K.", role: "HR Manager, perusahaan teknologi", event: "Annual gathering 300 orang", rating: 5, date: "Agu 2026", text: (eo) => `Tim ${eo} sangat rapi dari technical meeting sampai hari H. Rundown tepat waktu dan semua karyawan pulang dengan senang.` },
    { name: "Hendra W.", role: "Marketing Lead, FMCG", event: "Product launching", rating: 5, date: "Jul 2026", text: () => "Konsep panggung dan lighting-nya bikin launching kami terlihat premium. Koordinasi dengan vendor juga dihandle penuh." },
    { name: "Dewi A.", role: "Corporate Secretary", event: "Outing kantor 2 hari", rating: 4, date: "Mei 2026", text: () => "Responsif di WhatsApp dan fleksibel saat kami minta ubah jadwal mendadak. Transport dan konsumsi aman." },
  ],
  Wedding: [
    { name: "Andi & Sasa", role: "Pengantin", event: "Resepsi 400 tamu", rating: 5, date: "Sep 2026", text: (eo) => `Kami tinggal duduk manis. ${eo} mengatur semuanya dari akad sampai resepsi, keluarga besar juga puas.` },
    { name: "Putri L.", role: "Pengantin", event: "Intimate wedding", rating: 5, date: "Jun 2026", text: () => "Dekorasinya persis seperti moodboard yang kami kirim. Detail kecil seperti seating plan pun diperhatikan." },
    { name: "Bayu R.", role: "Kakak mempelai", event: "Resepsi adat", rating: 4, date: "Apr 2026", text: () => "Tim di lapangan sigap menangani tamu yang datang melebihi perkiraan. Acara tetap berjalan lancar." },
  ],
  Conference: [
    { name: "Maya L.", role: "Event Lead, instansi pemerintah", event: "Konferensi nasional", rating: 5, date: "Agu 2026", text: (eo) => `Registrasi, ruang breakout, dan live streaming semuanya berjalan mulus. ${eo} paham standar acara resmi.` },
    { name: "Fajar S.", role: "Program Manager, NGO", event: "Seminar 2 hari", rating: 4, date: "Mar 2026", text: () => "Persiapan materi dan speaker handling sangat membantu tim kami yang kecil." },
  ],
  Entertainment: [
    { name: "Dimas H.", role: "Ketua panitia kampus", event: "Konser pentas seni", rating: 5, date: "Jul 2026", text: () => "Sound system dan crowd control-nya profesional. Guest star puas, penonton juga aman." },
    { name: "Yuni P.", role: "Brand Activation, retail", event: "Roadshow mall", rating: 4, date: "Feb 2026", text: () => "Talent dan MC yang dipilihkan pas dengan karakter brand kami. Engagement pengunjung tinggi." },
  ],
  Exhibition: [
    { name: "Budi S.", role: "Owner, UMKM kuliner", event: "Booth pameran 4 hari", rating: 5, date: "Jun 2026", text: () => "Booth jadi tepat waktu dan desainnya menarik banyak pengunjung. SPG yang disediakan juga terlatih." },
  ],
};

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function sampleReviews(eoName: string, slug: string, eventTypes: string[], count = 3): SampleReview[] {
  const templates: Template[] = [];
  for (const t of [...eventTypes, "Corporate Event", "Entertainment"]) {
    for (const r of POOL[t] ?? []) if (!templates.includes(r)) templates.push(r);
  }
  const offset = hash(slug) % templates.length;
  return [...templates.slice(offset), ...templates.slice(0, offset)].slice(0, count).map((r) => ({ ...r, text: r.text(eoName) }));
}
