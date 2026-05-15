import { notFound } from "next/navigation";
import {
  getJurisdictionBySlug,
  getHomeStats,
  getCurrentCouncil,
  getTopPetitioners,
  getTopStaff,
  getRecentDecisions,
  getBodies,
} from "@/lib/queries";
import { CitizensTier } from "@/components/CitizensTier";
import { LadderArrow } from "@/components/LadderArrow";
import { CouncilCard, VacantSeatCard } from "@/components/CouncilCard";
import { UpstreamModule } from "@/components/UpstreamModule";
import { BodyCard } from "@/components/BodyCard";
import { RecentDecisions } from "@/components/RecentDecisions";

// Bodies typically present in a US municipality, used to render gap cards
// even when the body isn't yet indexed. Will move into per-jurisdiction
// config once we support multiple towns.
const COMMON_BODIES = ["Planning Commission", "Board of Zoning Appeals"];

export default async function JurisdictionHome({
  params,
}: {
  params: Promise<{ state: string; city: string }>;
}) {
  const { state, city } = await params;
  const jurisdiction = await getJurisdictionBySlug(state, city);
  if (!jurisdiction) notFound();

  const [stats, council, topPetitioners, topStaff, recent, bodies] = await Promise.all([
    getHomeStats(jurisdiction.id),
    getCurrentCouncil(jurisdiction.id),
    getTopPetitioners(jurisdiction.id),
    getTopStaff(jurisdiction.id),
    getRecentDecisions(jurisdiction.id),
    getBodies(jurisdiction.id),
  ]);

  const bodiesByName = new Map(bodies.map((b) => [b.name, b]));

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          TownWatch — {jurisdiction.display_name}, {jurisdiction.state_abbr.toUpperCase()}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {stats.total_officials} officials · {stats.total_motions.toLocaleString()} motions ·{" "}
          {stats.total_meetings} meetings on file
          {stats.motions_quarantined > 0 && (
            <span className="text-amber-600">
              {" "}· {stats.motions_quarantined} under review
            </span>
          )}
        </p>
      </header>

      {/* Tier 1: Citizens (sovereign) */}
      <CitizensTier population={jurisdiction.population} role="top" />

      <LadderArrow label="elect every 4 years" />

      {/* Tier 2: Council */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-xl font-semibold text-slate-900">Mayor + Council</h2>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          <span className="font-medium">
            {stats.unanimity_pct}% of motions with a recorded vote pass unanimously
          </span>{" "}
          ({stats.unanimous_count.toLocaleString()} of{" "}
          {stats.voted_count.toLocaleString()}). Unanimity is data, not necessarily
          wrong — but worth knowing.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <VacantSeatCard
            label="Mayor"
            note="special election Nov 2026 · qualifying fee $612"
          />
          {council.slice(0, 4).map((o) => (
            <CouncilCard
              key={o.id}
              official={o}
              state={state}
              citySlug={city}
            />
          ))}
        </div>
      </section>

      <LadderArrow label="ratifies / votes on what arrives at the agenda" />

      {/* Tier 3: Petitioners + Staff */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UpstreamModule
          title="Petitioners"
          subtitle="petitioners"
          rows={topPetitioners}
        />
        <UpstreamModule
          title="Staff Recommenders"
          subtitle="staff recommenders"
          rows={topStaff}
        />
      </div>

      <LadderArrow label="shape decisions before the council votes" />

      {/* Tier 4: Appointed bodies */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900 mb-3">Appointed Bodies</h2>
        <p className="text-sm text-slate-600 mb-4">
          Authority delegated by the council to recommend zoning, planning, and appeals decisions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMMON_BODIES.map((name) => (
            <BodyCard key={name} name={name} body={bodiesByName.get(name)} />
          ))}
        </div>
      </section>

      <LadderArrow label="recommend back to council" />

      <RecentDecisions decisions={recent} />

      <LadderArrow label="affects daily life" />

      <CitizensTier population={jurisdiction.population} role="bottom" />

      <footer className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-500">
        TownWatch indexes records that local governments publish. Coverage may be
        incomplete. This is not legal advice and is not an official record.
      </footer>
    </main>
  );
}
