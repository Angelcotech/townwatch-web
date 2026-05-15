import Link from "next/link";
import type { AggregateRow } from "@/lib/queries";

type Props = {
  title: string;
  subtitle: string;
  rows: AggregateRow[];
  state: string;
  citySlug: string;
};

export function UpstreamModule({ title, subtitle, rows, state, citySlug }: Props) {
  return (
    <div className="rounded-lg border border-slate-300 shadow-sm bg-white p-5">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 mt-1">Top {subtitle} by motion count</p>
      <ul className="mt-3 space-y-1 text-sm">
        {rows.map((r) => {
          const label = r.name.length > 50 ? r.name.slice(0, 47) + "…" : r.name;
          const motionLine = (
            <span className="text-slate-500">
              {" "}— {r.motions} motion{r.motions === 1 ? "" : "s"}
            </span>
          );
          return (
            <li key={r.name}>
              {r.official_id ? (
                <Link
                  href={`/${state}/${citySlug}/officials/${r.official_id}`}
                  className="font-medium text-slate-800 hover:text-slate-950 hover:underline"
                >
                  {label}
                </Link>
              ) : (
                <span className="font-medium text-slate-800">{label}</span>
              )}
              {motionLine}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
