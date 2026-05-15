// Shared motion-list-item renderer — used on petitioner profiles and
// staff profile pages. Surfaces title + summary + outcome + dollar +
// vote tally so readers can see what the motion actually entailed
// without leaving the page.

type Motion = {
  id: number;
  title: string;
  description?: string | null;
  discussion_summary?: string | null;
  outcome: string;
  motion_type?: string;
  dollar_amount?: number | null;
  meeting_date: Date | string;
  body_name?: string;
  vote_tally_yes?: number;
  vote_tally_no?: number;
};

function fmtDate(d: Date | string) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function outcomeIcon(o: string) {
  if (o === "passed") return { icon: "✓", color: "text-emerald-600" };
  if (o === "failed") return { icon: "✗", color: "text-red-600" };
  if (o === "tabled" || o === "withdrawn") return { icon: "…", color: "text-amber-600" };
  return { icon: "·", color: "text-slate-400" };
}

export function MotionItem({ motion }: { motion: Motion }) {
  const o = outcomeIcon(motion.outcome);
  const summary = motion.discussion_summary || motion.description || null;
  const tally =
    (motion.vote_tally_yes ?? 0) + (motion.vote_tally_no ?? 0) > 0
      ? `${motion.vote_tally_yes}–${motion.vote_tally_no}`
      : null;

  return (
    <li className="border-b border-slate-100 py-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <span className={`text-2xl leading-none ${o.color} mt-0.5 select-none`}>
          {o.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 leading-snug">
            {motion.title}
          </p>
          <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-3">
            <span>{fmtDate(motion.meeting_date)}</span>
            {motion.body_name && <span>· {motion.body_name}</span>}
            {motion.motion_type && (
              <span>· {motion.motion_type.replace(/_/g, " ")}</span>
            )}
            <span className={o.color}>· {motion.outcome}</span>
            {tally && <span>· vote {tally}</span>}
            {motion.dollar_amount && (
              <span className="text-slate-700 font-medium">
                · ${Number(motion.dollar_amount).toLocaleString()}
              </span>
            )}
          </div>
          {summary && (
            <p className="text-sm text-slate-700 mt-2 leading-relaxed">
              {summary}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}
