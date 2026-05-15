// Connector between ladder tiers — direction matters. The relationships
// in local government aren't a one-way chain; some flows go up (requests
// reach the council), some go down (decisions reach citizens), and some
// are bidirectional (council appoints bodies; bodies recommend back).

type Direction = "down" | "up" | "bidir" | "loop";

type Props = {
  direction: Direction;
  label: string;
};

const ARROWS: Record<Direction, { top: string; bottom: string | null; color: string }> = {
  down:  { top: "↓",  bottom: "↓",  color: "text-slate-400"  },
  up:    { top: "↑",  bottom: "↑",  color: "text-blue-500"   },
  bidir: { top: "↑",  bottom: "↓",  color: "text-purple-500" },
  // Loop closes the cycle — only the top symbol; nothing flows below.
  loop:  { top: "↻",  bottom: null, color: "text-emerald-600" },
};

export function CycleConnector({ direction, label }: Props) {
  const cfg = ARROWS[direction];
  return (
    <div className="flex flex-col items-center py-6 select-none">
      <div className={`text-3xl ${cfg.color} leading-none`}>{cfg.top}</div>
      <div className="mt-2 max-w-2xl text-center text-base font-medium text-slate-700 tracking-wide">
        {label}
      </div>
      {cfg.bottom && (
        <div className={`text-3xl ${cfg.color} leading-none mt-2`}>{cfg.bottom}</div>
      )}
    </div>
  );
}
