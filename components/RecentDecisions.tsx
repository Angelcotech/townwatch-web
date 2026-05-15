import type { RecentDecision } from "@/lib/queries";

export function RecentDecisions({ decisions }: { decisions: RecentDecision[] }) {
  if (decisions.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-slate-900">Recent Decisions Enacted</h3>
        <p className="text-sm italic text-slate-500 mt-2">No published decisions yet.</p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-slate-900">Recent Decisions Enacted</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {decisions.map((d) => {
          const icon = d.outcome === "passed" ? "✓" : "✗";
          const title = d.title.length > 90 ? d.title.slice(0, 87) + "…" : d.title;
          return (
            <li key={d.id} className="text-slate-700">
              <span className="text-slate-400">{icon}</span>{" "}
              <span className="italic text-slate-500">
                {new Date(d.meeting_date).toLocaleDateString()}
              </span>{" "}
              — {title}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
