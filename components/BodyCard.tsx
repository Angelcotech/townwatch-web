import type { Body } from "@/lib/queries";
import { GapLine } from "./GapLine";

type Props = {
  name: string;
  body: Body | undefined;   // undefined when configured but not yet indexed
};

export function BodyCard({ name, body }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
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
        </>
      ) : (
        <GapLine label="no meetings indexed yet" />
      )}
      <GapLine label="member roster" />
    </div>
  );
}
