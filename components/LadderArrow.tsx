// Visual connector between ladder tiers — intentionally prominent so the
// reader understands the relationship between layers, not just the layers.

export function LadderArrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center py-6 select-none">
      <div className="text-3xl text-slate-400 leading-none">↓</div>
      <div className="mt-2 text-base font-medium text-slate-700 tracking-wide">
        {label}
      </div>
      <div className="text-3xl text-slate-400 leading-none mt-2">↓</div>
    </div>
  );
}
