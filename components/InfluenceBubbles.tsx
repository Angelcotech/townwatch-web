// Bubble-chart style display: each entity is a circle whose AREA is
// proportional to their motion count. Influence is read at a glance —
// a developer with 5 motions visibly dwarfs one with 1.
//
// Photo for staff (when we have official_id + a verified photo).
// Initials for petitioners (no photos exist for them).

import Link from "next/link";
import type { AggregateRow } from "@/lib/queries";

type Props = {
  rows: AggregateRow[];
  state: string;
  citySlug: string;
  kind: "petitioner" | "staff";
};

const MIN_RADIUS = 32;   // px — even a 1-motion bubble is readable
const MAX_RADIUS = 70;   // px — keeps the largest from dominating the layout

const PALETTE = [
  "#1E3A8A", "#1E40AF", "#1F2937", "#334155", "#475569", "#0F172A",
];

function initials(name: string): string {
  const parts = name.split(/\s+/).filter((p) => p && /^[A-Za-z0-9]/.test(p));
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hashColor(name: string): string {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function radiusFor(count: number, maxCount: number): number {
  if (maxCount <= 0) return MIN_RADIUS;
  // Sqrt scaling so that AREA (πr²) is proportional to count
  const t = Math.sqrt(count / maxCount);
  return Math.round(MIN_RADIUS + t * (MAX_RADIUS - MIN_RADIUS));
}

function petitionerSlug(name: string): string {
  return encodeURIComponent(name);
}

export function InfluenceBubbles({ rows, state, citySlug, kind }: Props) {
  if (rows.length === 0) {
    return (
      <p className="text-sm italic text-slate-400">
        No {kind === "petitioner" ? "petitioners" : "staff"} captured yet.
      </p>
    );
  }
  const maxCount = Math.max(...rows.map((r) => r.motions));

  return (
    <div className="flex flex-wrap items-end justify-start gap-x-5 gap-y-4 py-2">
      {rows.map((r) => {
        const radius = radiusFor(r.motions, maxCount);
        const diameter = radius * 2;
        const href =
          kind === "staff" && r.official_id
            ? `/${state}/${citySlug}/officials/${r.official_id}`
            : kind === "petitioner"
            ? `/${state}/${citySlug}/petitioners/${petitionerSlug(r.name)}`
            : null;

        const bubble = (
          <div className="flex flex-col items-center text-center">
            <div
              className="rounded-full overflow-hidden flex items-center justify-center text-white font-semibold shadow-sm"
              style={{
                width: diameter,
                height: diameter,
                backgroundColor: hashColor(r.name),
                fontSize: Math.max(11, Math.round(radius * 0.42)),
              }}
              title={`${r.name} — ${r.motions} motion${r.motions === 1 ? "" : "s"}`}
            >
              {r.has_photo && r.official_id ? (
                <img
                  src={`/api/photo/${r.official_id}`}
                  alt={r.name}
                  width={diameter}
                  height={diameter}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span>{initials(r.name)}</span>
              )}
            </div>
            <div
              className="mt-2 text-xs font-medium text-slate-700"
              style={{ maxWidth: Math.max(diameter, 88) }}
            >
              {r.name.length > 28 ? r.name.slice(0, 25) + "…" : r.name}
            </div>
            <div className="text-[10px] text-slate-500 leading-tight">
              {r.motions} motion{r.motions === 1 ? "" : "s"}
            </div>
          </div>
        );

        return href ? (
          <Link
            key={r.name}
            href={href}
            className="block hover:opacity-80 transition"
          >
            {bubble}
          </Link>
        ) : (
          <div key={r.name}>{bubble}</div>
        );
      })}
    </div>
  );
}
