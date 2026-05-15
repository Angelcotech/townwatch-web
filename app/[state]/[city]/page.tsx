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
import { CycleConnector } from "@/components/CycleConnector";
import { CouncilCard, VacantSeatCard } from "@/components/CouncilCard";
import { InfluenceBubbles } from "@/components/InfluenceBubbles";
import { PetitionerList } from "@/components/PetitionerList";
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
          {jurisdiction.display_name}, {jurisdiction.state_abbr.toUpperCase()}
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

      <CycleConnector
        direction="down"
        label="Citizens elect the mayor and council members every 4 years"
      />

      {/* Tier 2: Council — grouped */}
      <section className="rounded-xl border border-slate-300 bg-white shadow-sm p-5">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-xl font-semibold text-slate-900">Mayor + Council</h2>
          <span className="text-sm text-slate-500">
            {stats.unanimity_pct}% unanimous · {stats.voted_count.toLocaleString()} recorded votes
          </span>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          The five elected seats that vote on every motion. Decisions arrive
          here after staff review and petitioner request.
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

      <CycleConnector
        direction="up"
        label="Petitioners file requests; staff prepare recommendations. Both flow upward — most motions are shaped here before the council ever votes."
      />

      {/* Tier 3: Petitioners + Staff — grouped together as "upstream" */}
      <section className="rounded-xl border border-slate-300 bg-white shadow-sm p-5">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          Upstream{" "}
          <span className="text-xl font-semibold text-slate-500">
            — where decisions are actually shaped
          </span>
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          The people and entities that bring requests forward and the staff
          who recommend or draft the response. Most council votes ratify what
          has already been agreed here.
        </p>
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Staff Recommenders ({topStaff.length})
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Bubble size = number of motions recommended. Click a face to see what they recommended.
              Scroll for the full list.
            </p>
            <div className="max-h-[420px] overflow-y-auto rounded-md border border-slate-200 bg-slate-50/50 p-3">
              <InfluenceBubbles
                rows={topStaff}
                state={state}
                citySlug={city}
                kind="staff"
              />
            </div>
          </div>
          <div className="border-t border-slate-200 pt-5">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Petitioners ({topPetitioners.length})
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              External entities that filed motions — developers, businesses, residents.
              Bar length = relative volume. Scroll for the full list.
            </p>
            <div className="max-h-[420px] overflow-y-auto rounded-md border border-slate-200 bg-slate-50/50 px-3">
              <PetitionerList
                rows={topPetitioners}
                state={state}
                citySlug={city}
              />
            </div>
          </div>
        </div>
      </section>

      <CycleConnector
        direction="bidir"
        label="The council appoints these bodies; the bodies recommend back to the council, which votes."
      />

      {/* Tier 4: Appointed bodies — grouped */}
      <section className="rounded-xl border border-slate-300 bg-white shadow-sm p-5">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Appointed Bodies</h2>
        <p className="text-sm text-slate-600 mb-4">
          Authority delegated by the council to recommend zoning, planning,
          and appeals decisions back to it.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMMON_BODIES.map((name) => (
            <BodyCard key={name} name={name} body={bodiesByName.get(name)} />
          ))}
        </div>
      </section>

      <CycleConnector
        direction="down"
        label="Once the council votes, motions become enacted decisions"
      />

      <RecentDecisions decisions={recent} />

      <CycleConnector
        direction="down"
        label="Enacted decisions affect daily life in the city"
      />

      <CitizensTier population={jurisdiction.population} role="bottom" />

      <CycleConnector
        direction="loop"
        label="…and the cycle restarts at the next election — citizens vote, the council changes (or doesn't), and the flow above begins again."
      />

      <footer className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-500">
        TownWatch indexes records that local governments publish. Coverage may be
        incomplete. This is not legal advice and is not an official record.
      </footer>
    </main>
  );
}
