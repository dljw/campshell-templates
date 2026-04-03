import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface PositionChangeProps {
  current?: number;
  previous?: number;
}

export function PositionChange({ current, previous }: PositionChangeProps) {
  if (current == null) {
    return <span className="text-muted-foreground text-sm">--</span>;
  }

  if (previous == null || previous === current) {
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
        <Minus className="w-3 h-3" />
        <span>{current}</span>
      </span>
    );
  }

  // Lower position number = better ranking
  const improved = current < previous;
  const diff = Math.abs(previous - current);

  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-medium ${
        improved ? "text-emerald-500" : "text-red-500"
      }`}
    >
      {improved ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
      <span>{current}</span>
      <span className="text-xs opacity-70">({diff})</span>
    </span>
  );
}
