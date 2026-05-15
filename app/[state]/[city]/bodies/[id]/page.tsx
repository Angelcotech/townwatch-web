import { notFound } from "next/navigation";
import Link from "next/link";
import { getBodyById, getBodyMeetings } from "@/lib/body-queries";

export default async function BodyProfile({
  params,
}: {
  params: Promise<{ state: string; city: string; id: string }>;
}) {
  const { state, city, id } = await params;
  const bodyId = Number(id);
  if (!Number.isFinite(bodyId)) notFound();

  const body = await getBodyById(bodyId);
  if (!body) notFound();
  const meetings = await getBodyMeetings(bodyId);

  const withMotions = meetings.filter((m) => m.motion_count > 0).length;
  const withMinutes = meetings.filter((m) => m.minutes_url).length;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href={`/${state}/${city}`}
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        ← Back to {body.jurisdiction_name}
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl font-bold text-slate-900">{body.name}</h1>
        <p className="text-sm text-slate-600 mt-1">
          {body.jurisdiction_name}, {body.state_abbr.toUpperCase()}
        </p>
      </header>

      <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Meetings on file" value={meetings.length.toLocaleString()} />
        <Stat label="Minutes available" value={withMinutes.toLocaleString()} />
        <Stat label="Motions indexed" value={withMotions.toLocaleString()} />
        <Stat
          label="Date range"
          value={
            meetings.length > 0
              ? `${new Date(meetings[meetings.length - 1].meeting_date).getFullYear()}–${new Date(meetings[0].meeting_date).getFullYear()}`
              : "—"
          }
        />
      </section>

      <section className="mt-8 rounded-lg border border-slate-300 bg-white shadow-sm p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">All meetings</h2>
        <p className="text-xs text-slate-500 mb-4">
          Newest first. Click <em>Agenda</em> or <em>Minutes</em> to read the
          original PDFs published by the city.
        </p>
        <ul className="divide-y divide-slate-100">
          {meetings.map((m) => (
            <li key={m.id} className="py-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-medium text-slate-900 w-32">
                {new Date(m.meeting_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="text-xs text-slate-500 uppercase tracking-wider">
                {m.meeting_type}
              </span>
              {m.motion_count > 0 && (
                <span className="text-xs text-slate-700">
                  · {m.motion_count} motion{m.motion_count === 1 ? "" : "s"} indexed
                </span>
              )}
              <span className="ml-auto flex gap-3 text-xs">
                {m.agenda_url && (
                  <a
                    href={m.agenda_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    Agenda ↗
                  </a>
                )}
                {m.minutes_url && (
                  <a
                    href={m.minutes_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    Minutes ↗
                  </a>
                )}
                {!m.agenda_url && !m.minutes_url && (
                  <span className="italic text-slate-400">
                    no documents on file
                  </span>
                )}
              </span>
            </li>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-semibold text-slate-900 mt-1">{value}</div>
    </div>
  );
}
