"""Build the 100-EO seed (CSV in PRD import format) from the scraped Google Maps export.

Usage: python3 -I scripts/prepare_seed.py <source.csv>
"""
import csv
import math
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_CSV = ROOT / "data" / "eo_seed_100.csv"

KEEP_CATEGORIES = {
    "Event Organizer (EO)",
    "Perancang Acara",
    "Perencana Pernikahan",
    "Jasa Pernikahan",
}
LIMIT = 100

KECAMATAN = {
    "Jakarta Pusat": ["gambir", "tanah abang", "menteng", "senen", "cempaka putih", "cemp. putih", "kemayoran", "sawah besar", "johar baru"],
    "Jakarta Barat": ["palmerah", "taman sari", "tambora", "grogol", "kebon jeruk", "kembangan", "cengkareng", "kalideres", "krukut"],
    "Jakarta Utara": ["kelapa gading", "klp. gading", "tanjung priok", "tj. priok", "koja", "cilincing", "penjaringan", "pademangan", "pluit", "sunter"],
    "Jakarta Timur": ["cakung", "duren sawit", "jatinegara", "pulo gadung", "pulogadung", "matraman", "kramat jati", "makasar", "ciracas", "cipayung", "pasar rebo"],
    "Jakarta Selatan": ["kebayoran", "kby.", "tebet", "setiabudi", "setia budi", "mampang", "pancoran", "cilandak", "pasar minggu", "ps. minggu", "jagakarsa", "pesanggrahan", "kuningan", "senayan"],
}


def locate(address: str) -> tuple[str, str]:
    a = address.lower()
    if re.search(r"tangerang selatan|tangsel|south tangerang", a):
        return "Tangerang Selatan", "Banten"
    if "kabupaten tangerang" in a or "kab. tangerang" in a:
        return "Kabupaten Tangerang", "Banten"
    if "tangerang" in a and "jakarta" not in a.split("tangerang")[0][-40:]:
        return "Tangerang", "Banten"
    if "depok" in a:
        return "Depok", "Jawa Barat"
    if re.search(r"\bbekasi\b|\bbks\b", a):
        return "Bekasi", "Jawa Barat"
    if "bogor" in a:
        return "Bogor", "Jawa Barat"
    directions = [
        ("Jakarta Selatan", r"jakarta selatan|south jakarta|jkt selatan|jaksel"),
        ("Jakarta Timur", r"jakarta timur|east jakarta|jkt timur|jaktim"),
        ("Jakarta Barat", r"jakarta barat|west jakarta|jkt barat|jakbar"),
        ("Jakarta Pusat", r"jakarta pusat|central jakarta|jkt pusat|jakpus"),
        ("Jakarta Utara", r"jakarta utara|north jakarta|jkt utara|jakut"),
    ]
    for city, pattern in directions:
        if re.search(pattern, a):
            return city, "DKI Jakarta"
    for city, names in KECAMATAN.items():
        if any(n in a for n in names):
            return city, "DKI Jakarta"
    return "Jakarta", "DKI Jakarta"


TYPE_RULES = [
    ("Wedding", r"wedding|nikah|pernikahan|bride|marriage|akad|resepsi"),
    ("Festival", r"festival|fest\b|carnival|karnaval"),
    ("Entertainment", r"entertain|music|musik|concert|konser|band|production|produksi|show|creative|kreatif|talent"),
    ("Exhibition", r"expo|exhibit|pameran|booth|display"),
    ("Conference", r"mice|conference|konferensi|seminar|summit|convention|meeting"),
    ("Government Event", r"pemerintah|government|kementerian|dinas"),
    ("Corporate Event", r"corporate|gathering|outbound|team ?building|incentive|company|outing|launching"),
]


def infer_types(name: str, category: str) -> list[str]:
    n = name.lower()
    types = [t for t, pattern in TYPE_RULES if re.search(pattern, n)]
    if category in ("Perencana Pernikahan", "Jasa Pernikahan") and "Wedding" not in types:
        types.insert(0, "Wedding")
    if category == "Perancang Acara":
        for t in ("Corporate Event", "Conference"):
            if t not in types:
                types.append(t)
    if not types:
        types = ["Corporate Event", "Entertainment"]
    return types[:4]


def clean_name(raw: str) -> str:
    name = " ".join(raw.split())
    if "|" not in name:
        return name
    parts = [p.strip(" -") for p in re.split(r"\|+", name) if p.strip(" -")]
    legal = [p for p in parts if re.match(r"(?i)^(pt|cv)\.?\s", p)]
    return legal[0] if legal else parts[0]


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text[:70].strip("-") or "eo"


def parse_rating(raw: str) -> float | None:
    raw = raw.strip().replace(",", ".")
    try:
        value = float(raw)
    except ValueError:
        return None
    return value if 0 <= value <= 5 else None


def parse_reviews(raw: str) -> int:
    digits = re.sub(r"\D", "", raw)
    return int(digits) if digits else 0


def clean_website(url: str) -> str:
    url = url.strip()
    if not url:
        return ""
    if "google.com" in url or "wa.me" in url or "whatsapp" in url:
        return ""
    return url


def describe(name: str, category: str, city: str, province: str, types: list[str], rating, reviews: int) -> str:
    kind = {
        "Perencana Pernikahan": "perencana pernikahan",
        "Jasa Pernikahan": "penyedia jasa pernikahan",
        "Perancang Acara": "perancang acara",
    }.get(category, "event organizer")
    area = city if city == "Jakarta" else f"{city}, {province}"
    focus = ", ".join(t.lower() for t in types)
    text = f"{name} adalah {kind} yang berbasis di {area}, dengan fokus pada {focus}."
    if rating is not None and reviews > 0:
        text += f" Mendapat rating {str(rating).replace('.', ',')} dari {reviews} ulasan di Google Maps."
    text += " Profil ini disusun dari data publik dan belum diklaim oleh pemiliknya."
    return text


def maps_url(r: dict) -> str:
    place = r.get("place_id", "").strip()
    if ":" in place:
        try:
            return f"https://maps.google.com/?cid={int(place.split(':')[1], 16)}"
        except ValueError:
            pass
    return r["google_maps_url"].strip().split("?")[0]


def main(source: str) -> None:
    with open(source, encoding="utf-8-sig") as f:
        rows = [r for r in csv.DictReader(f) if r["kategori"].strip() in KEEP_CATEGORIES]

    candidates = []
    seen_names = set()
    for r in rows:
        name = clean_name(r["nama"])
        key = name.lower()
        rating = parse_rating(r["rating"])
        reviews = parse_reviews(r["jumlah_review"])
        if key in seen_names or not r["alamat"].strip() or rating is None:
            continue
        seen_names.add(key)
        # Bayesian average so a 5.0 from 1 review doesn't outrank a 4.8 from 300.
        score = (rating * reviews + 4.3 * 15) / (reviews + 15) + (0.15 if r["telepon"].strip() else 0) + 0.02 * math.log1p(reviews)
        candidates.append((score, name, rating, reviews, r))

    candidates.sort(key=lambda c: c[0], reverse=True)
    picked = candidates[:LIMIT]

    out = []
    slugs = set()
    for _, name, rating, reviews, r in picked:
        category = r["kategori"].strip()
        city, province = locate(r["alamat"])
        types = infer_types(name, category)
        slug = slugify(name)
        base, i = slug, 2
        while slug in slugs:
            slug, i = f"{base}-{i}", i + 1
        slugs.add(slug)
        out.append({
            "company_name": name,
            "slug": slug,
            "logo": "",
            "description": describe(name, category, city, province, types, rating, reviews),
            "city": city,
            "province": province,
            "phone": r["telepon"].strip(),
            "email": r["email"].strip(),
            "website": clean_website(r["website"]),
            "year_established": "",
            "event_types": "|".join(types),
            "services": "",
            "capacity": "",
            "portfolio_images": "",
            "rating": rating,
            "total_events": "",
            "verified": "false",
            "status": "active",
            "address": " ".join(r["alamat"].split()),
            "review_count": reviews,
            "instagram": r["instagram"].strip(),
            "google_maps_url": maps_url(r),
        })

    with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(out[0].keys()))
        writer.writeheader()
        writer.writerows(out)

    from collections import Counter
    print("picked", len(out))
    print("cities", Counter(e["city"] for e in out).most_common())
    print("types", Counter(t for e in out for t in e["event_types"].split("|")).most_common())
    print("with phone", sum(1 for e in out if e["phone"]), "with website", sum(1 for e in out if e["website"]))


if __name__ == "__main__":
    main(sys.argv[1])
