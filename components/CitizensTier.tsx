type Props = {
  population: number | null;
  role: "top" | "bottom";
};

export function CitizensTier({ population, role }: Props) {
  const label =
    role === "top"
      ? "sovereign authority — elect who serves"
      : "live with the outcomes";
  const popLine = population ? `${population.toLocaleString()} residents` : "population — not on file";

  return (
    <div className="bg-slate-900 text-white rounded-lg px-6 py-5 text-center my-2">
      <div className="text-[0.7rem] tracking-[0.12em] uppercase opacity-70">
        Citizens
      </div>
      <div className="text-xl font-semibold mt-1">{popLine}</div>
      <div className="text-sm opacity-85 mt-1">{label}</div>
    </div>
  );
}
