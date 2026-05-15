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
  const seat = official.current_seat ?? "—";
  const isProTem = /pro\s*tem/i.test(seat);
  const proTemBadge = isProTem ? " · Mayor Pro-Tem" : "";

  return (
    <Link
      href={`/${state}/${citySlug}/officials/${official.id}`}
      className="block rounded-lg border border-slate-200 p-4 hover:border-slate-400 hover:shadow-sm transition bg-white"
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
        {seat}{proTemBadge}
      </div>
      <GapLine label="term end date" />
      <GapLine label="direct email" />
    </Link>
  );
}

export function VacantSeatCard({ label = "Mayor", note }: { label?: string; note?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 p-4 bg-slate-50">
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
