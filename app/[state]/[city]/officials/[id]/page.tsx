import { notFound } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { getJurisdictionBySlug } from "@/lib/queries";
import {
  getProfileOfficial,
  getProfileTerms,
  getVoteBreakdown,
  getProfileFindings,
} from "@/lib/profile-queries";

export default async function OfficialProfile({
  params,
}: {
  params: Promise<{ state: string; city: string; id: string }>;
}) {
  const { state, city, id } = await params;
  const officialId = Number(id);
  if (!Number.isFinite(officialId)) notFound();

  const jurisdiction = await getJurisdictionBySlug(state, city);
  if (!jurisdiction) notFound();

  const [official, terms, breakdown, findings] = await Promise.all([
    getProfileOfficial(officialId),
    getProfileTerms(officialId),
    getVoteBreakdown(officialId),
    getProfileFindings(officialId),
  ]);

  if (!official) notFound();

  const currentTerm = terms.find((t) => t.is_current);
  const totalVotes = breakdown.reduce((s, b) => s + b.total, 0);
  const yesCount = breakdown.reduce((s, b) => s + b.yes_count, 0);
  const noCount = breakdown.reduce((s, b) => s + b.no_count, 0);
  const recusals = breakdown.reduce((s, b) => s + b.recusal_count, 0);
  const yesPct = totalVotes > 0 ? Math.round((yesCount * 100) / totalVotes) : 0;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href={`/${state}/${city}`}
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        ← Back to {jurisdiction.display_name}
      </Link>

      <header className="mt-4 flex items-start gap-6">
        <Avatar
          name={official.canonical_name}
          photoApiUrl={`/api/photo/${official.id}`}
          size={160}
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">
            {official.canonical_name}
          </h1>
          {currentTerm ? (
            <p className="text-sm text-slate-600 mt-1">
              {currentTerm.seat_name} · {currentTerm.body_name} ·{" "}
              {currentTerm.jurisdiction_name} · current
            </p>
          ) : terms.length > 0 ? (
            <p className="text-sm text-slate-600 mt-1">
              Formerly: {terms[0].seat_name} · {terms[0].body_name} ·{" "}
              {terms[0].jurisdiction_name}
            </p>
          ) : (
            <p className="text-sm italic text-slate-400 mt-1">
              No term record on file — historical vote record only.
            </p>
          )}
          {official.email && (
            <p className="text-sm text-slate-600 mt-2">{official.email}</p>
          )}
          {official.phone && (
            <p className="text-sm text-slate-600">{official.phone}</p>
          )}
        </div>
      </header>

      {official.bio_text && (
        <section className="mt-6 rounded-lg border border-slate-300 bg-white shadow-sm p-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Biography</h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {official.bio_text}
          </p>
          <p className="text-xs text-slate-400 mt-3 italic">
            Source: cityofgrovetown.com
          </p>
        </section>
      )}

      {/* Headline metrics */}
      <section className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Total votes" value={totalVotes.toLocaleString()} />
        <Stat label="Yes rate" value={`${yesPct}%`} />
        <Stat label="No votes" value={noCount.toLocaleString()} />
        <Stat label="Recusals" value={recusals.toLocaleString()} />
      </section>

      {/*
        Public profile pages deliberately do NOT display individual-level
        inferential findings (e.g., recusal_absence). Those are research
        hypotheses, not data — and surfacing them under a named person's
        profile crosses the line from presentation to accusation.

        Findings remain in the DB for operator-side research and the future
        operator dashboard. System-level descriptive stats (e.g., the body's
        unanimity rate) appear on the jurisdiction home, framed as data.
      */}

      {/* Voting record breakdown */}
      {breakdown.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            Voting record by motion type
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 px-2 text-right">Total</th>
                  <th className="py-2 px-2 text-right">Yes</th>
                  <th className="py-2 px-2 text-right">No</th>
                  <th className="py-2 px-2 text-right">Abstain</th>
                  <th className="py-2 px-2 text-right">Recused</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((b) => (
                  <tr key={b.motion_type} className="border-b border-slate-100">
                    <td className="py-2 pr-4 text-slate-800">{b.motion_type}</td>
                    <td className="py-2 px-2 text-right">{b.total}</td>
                    <td className="py-2 px-2 text-right">{b.yes_count}</td>
                    <td className="py-2 px-2 text-right">{b.no_count}</td>
                    <td className="py-2 px-2 text-right">{b.abstain_count}</td>
                    <td className="py-2 px-2 text-right">{b.recusal_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <footer className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-500">
        TownWatch indexes records that local governments publish. Coverage may be
        incomplete. This is not legal advice and is not an official record.
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-500 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-2xl font-semibold text-slate-900 mt-1">{value}</div>
    </div>
  );
}
