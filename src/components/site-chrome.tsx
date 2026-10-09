
export function BrandMark({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" | "header" }) {
  const body = tone === "header" ? "var(--h-text)" : tone === "dark" ? "var(--ink)" : "var(--paper)";
  const slot = tone === "header" ? "var(--h-logo-slot)" : tone === "dark" ? "var(--paper)" : "var(--ink)";
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M11 1.5 16 9l5-7.5" fill="none" stroke="var(--cobalt)" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="5" y="8" width="22" height="22.5" rx="5" fill={body} />
      <rect x="12.5" y="11" width="7" height="2.4" rx="1.2" fill={slot} />
      <rect x="5" y="18" width="22" height="5" fill="var(--cobalt)" />
    </svg>
  );
}
