import { eventTypeColor } from "@/lib/constants";
import { initials } from "@/lib/format";

type Props = {
  name: string;
  logo: string | null;
  primaryType?: string;
  size?: "sm" | "md" | "lg" | "xl";
};

const SIZES = {
  sm: "size-10 text-sm rounded-xl",
  md: "size-14 text-lg rounded-2xl",
  lg: "size-20 text-2xl rounded-[22px]",
  xl: "size-28 text-4xl rounded-[28px]",
};

export function EOAvatar({ name, logo, primaryType, size = "md" }: Props) {
  const color = eventTypeColor(primaryType ?? "");
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- logos come from arbitrary EO-owned hosts
      <img
        src={logo}
        alt={`Logo ${name}`}
        className={`${SIZES[size]} shrink-0 border border-line bg-surface object-contain`}
        loading="lazy"
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`${SIZES[size]} font-display relative grid shrink-0 place-items-center overflow-hidden font-bold tracking-tight text-white`}
      style={{ background: color }}
    >
      <span className="relative">{initials(name)}</span>
    </span>
  );
}
