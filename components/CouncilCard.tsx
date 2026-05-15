import Link from "next/link";
import { Avatar } from "./Avatar";
import { GapLine } from "./GapLine";
import type { Official } from "@/lib/queries";

type Props = {
  official: Official;
  state: string;
  citySlug: string;
};

export function CouncilCard({ official, state, citySlug }: Props) {
  // Prefer the city's displayed title ("Mayor Pro Tem", "Councilmember")
  // over the formal seat name ("Council Member 1") when available.
  const titleLine =
    official.display_title || official.current_seat || "—";

  return (
    <Link
      href={`/${state}/${citySlug}/officials/${official.id}`}
      className="block rounded-lg border border-slate-300 shadow-sm hover:shadow-md hover:border-slate-500 p-4 transition bg-white"
    >
      <div className="flex justify-center">
        <Avatar
          name={official.canonical_name}
          photoApiUrl={`/api/photo/${official.id}`}
          size={96}
        />
      </div>
      <div className="mt-3 font-semibold text-slate-900 text-center">
        {official.canonical_name}
      </div>
      <div className="text-xs text-slate-600 text-center mt-1">
        {titleLine}
      </div>
      <GapLine label="term end date" />
      <div className="text-xs italic text-slate-400 mt-1">
        no direct email published by the city
      </div>
    </Link>
  );
}

export function VacantSeatCard({ label = "Mayor", note }: { label?: string; note?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-400 shadow-sm p-4 bg-slate-50">
      <div className="flex justify-center">
        <Avatar name="?" size={96} />
      </div>
      <div className="mt-3 font-semibold text-slate-900 text-center">VACANT</div>
      <div className="text-xs text-slate-600 text-center mt-1">{label}</div>
      {note && (
        <div className="text-xs italic text-slate-400 mt-2 text-center">{note}</div>
      )}
    </div>
  );
}
