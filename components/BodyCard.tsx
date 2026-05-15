import Link from "next/link";
import type { Body } from "@/lib/queries";
import { GapLine } from "./GapLine";

type Props = {
  name: string;
  body: Body | undefined;   // undefined when configured but not yet indexed
  state: string;
  citySlug: string;
};

export function BodyCard({ name, body, state, citySlug }: Props) {
  const inner = (
    <>
      <div className="font-semibold text-slate-900">{name}</div>
      {body && body.meetings > 0 ? (
        <>
          <p className="text-xs text-slate-600 mt-2">
            {body.meetings} meetings on file
          </p>
          {body.latest && (
            <p className="text-xs text-slate-500 mt-0.5">
              latest: {new Date(body.latest).toLocaleDateString()}
            </p>
          )}
          <p className="text-xs text-slate-500 mt-2 group-hover:text-slate-800">
            View all meetings →
          </p>
        </>
      ) : (
        <GapLine label="no meetings indexed yet" />
      )}
      <GapLine label="member roster" />
    </>
  );

  if (body && body.id) {
    return (
      <Link
        href={`/${state}/${citySlug}/bodies/${body.id}`}
        className="group block rounded-lg border border-slate-300 shadow-sm hover:shadow-md hover:border-slate-500 bg-white p-4 transition"
      >
        {inner}
      </Link>
    );
  }
  return (
    <div className="rounded-lg border border-slate-300 shadow-sm bg-white p-4">
      {inner}
    </div>
  );
}
