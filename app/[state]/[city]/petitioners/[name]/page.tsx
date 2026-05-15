import { notFound } from "next/navigation";
import Link from "next/link";
import { getJurisdictionBySlug } from "@/lib/queries";
import {
  getPetitionerSummary,
  getPetitionerMotions,
} from "@/lib/petitioner-queries";
import { MotionItem } from "@/components/MotionItem";

export default async function PetitionerProfile({
  params,
}: {
  params: Promise<{ state: string; city: string; name: string }>;
}) {
  const { state, city, name } = await params;
  const decoded = decodeURIComponent(name);

  const jurisdiction = await getJurisdictionBySlug(state, city);
  if (!jurisdiction) notFound();

  const [summary, motions] = await Promise.all([
    getPetitionerSummary(jurisdiction.id, decoded),
    getPetitionerMotions(jurisdiction.id, decoded),
  ]);

  if (!summary) notFound();

  // Pass rate is only meaningful over motions that actually got voted on.
  // "no_action" items were discussed but never formally voted, so they
  // shouldn't drag down the pass rate.
  const passRate =
    summary.decided > 0
      ? Math.round((summary.passed * 100) / summary.decided)
      : null;
  const dollar = Number(summary.total_dollar || 0);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href={`/${state}/${city}`}
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        ← Back to {jurisdiction.display_name}
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl font-bold text-slate-900">{decoded}</h1>
        <p className="text-sm text-slate-600 mt-1">
          Petitioner before {jurisdiction.display_name},{" "}
          {jurisdiction.state_abbr.toUpperCase()}
        </p>
      </header>

      <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Motions filed" value={summary.motion_count.toLocaleString()} />
        <Stat
          label="Pass rate"
          value={
            passRate === null
              ? "—"
              : `${passRate}%`
          }
          sub={
            passRate === null
              ? "no formal vote yet"
              : `over ${summary.decided} voted motion${summary.decided === 1 ? "" : "s"}`
          }
        />
        <Stat label="Passed" value={summary.passed.toLocaleString()} />
        <Stat
          label="Total $ requested"
          value={dollar > 0 ? `$${dollar.toLocaleString()}` : "—"}
        />
      </section>

      <p className="text-xs text-slate-500 mt-3">
        {summary.first_seen && summary.last_seen && (
          <>
            First filing: {new Date(summary.first_seen).toLocaleDateString()} ·
            Most recent: {new Date(summary.last_seen).toLocaleDateString()}
          </>
        )}
        {summary.no_action > 0 && (
          <>
            {" · "}
            <span className="text-amber-600">
              {summary.no_action} discussed without a formal vote (not counted
              in pass rate)
            </span>
          </>
        )}
      </p>

      <section className="mt-8 rounded-lg border border-slate-300 bg-white shadow-sm p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Motions filed
        </h2>
        <p className="text-xs text-slate-500 mb-2">
          Every motion in the index where this name appears as the petitioner.
        </p>
        <ul>
          {motions.map((m) => (
            <MotionItem key={m.id} motion={m} />
          ))}
        </ul>
      </section>

      <footer className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-500">
        TownWatch indexes records that local governments publish. Coverage may be
        incomplete. This is not legal advice and is not an official record.
      </footer>
    </main>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-semibold text-slate-900 mt-1">{value}</div>
      {sub && <div className="text-[10px] text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}
