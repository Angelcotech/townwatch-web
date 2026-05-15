// Renders a "not on file" gap line — explicit data transparency.

export function GapLine({ label }: { label: string }) {
  return (
    <div className="text-xs italic text-slate-400 mt-1">
      {label} — not on file
    </div>
  );
}
