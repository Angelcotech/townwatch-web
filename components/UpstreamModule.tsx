import type { AggregateRow } from "@/lib/queries";

type Props = {
  title: string;
  subtitle: string;
  rows: AggregateRow[];
};

export function UpstreamModule({ title, subtitle, rows }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 mt-1">Top {subtitle} by motion count</p>
      <ul className="mt-3 space-y-1 text-sm">
        {rows.map((r) => (
          <li key={r.name}>
            <span className="font-medium text-slate-800">
              {r.name.length > 50 ? r.name.slice(0, 47) + "…" : r.name}
            </span>{" "}
            <span className="text-slate-500">
              — {r.motions} motion{r.motions === 1 ? "" : "s"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
