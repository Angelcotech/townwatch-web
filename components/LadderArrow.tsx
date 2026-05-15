export function LadderArrow({ label }: { label: string }) {
  return (
    <div className="text-center text-slate-500 text-sm italic py-3 select-none">
      ↓ {label} ↓
    </div>
  );
}
