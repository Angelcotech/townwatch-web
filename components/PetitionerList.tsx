// Petitioner list — they don't have photos (mostly developers,
// businesses, residents), so a name+count list is more honest than a
// bubble. Sits beneath the staff bubbles in the Upstream section.

import Link from "next/link";
import type { AggregateRow } from "@/lib/queries";

type Props = {
  rows: AggregateRow[];
  state: string;
  citySlug: string;
};

function petitionerSlug(name: string): string {
  return encodeURIComponent(name);
}

export function PetitionerList({ rows, state, citySlug }: Props) {
  if (rows.length === 0) {
    return (
      <p className="text-sm italic text-slate-400">No petitioners captured yet.</p>
    );
  }
  const maxMotions = Math.max(...rows.map((r) => r.motions));

  return (
    <ul className="divide-y divide-slate-100">
      {rows.map((r) => {
        const widthPct = Math.max(8, Math.round((r.motions * 100) / maxMotions));
        return (
          <li key={r.name} className="py-2">
            <Link
              href={`/${state}/${citySlug}/petitioners/${petitionerSlug(r.name)}`}
              className="group flex items-center gap-3 hover:bg-slate-50 rounded px-1 transition"
            >
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-slate-800 group-hover:text-slate-950 truncate">
                  {r.name}
                </span>
                <span className="block h-1 mt-1 rounded-full bg-slate-200 overflow-hidden">
                  <span
                    className="block h-1 rounded-full bg-slate-500"
                    style={{ width: `${widthPct}%` }}
                  />
                </span>
              </span>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {r.motions} motion{r.motions === 1 ? "" : "s"}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
