import { cn } from "@campshell/ui-components";
import type { Mood } from "../types.js";

export const MOOD_CONFIG: Record<Mood, { emoji: string; label: string; color: string; border: string; bg: string }> = {
  amazing: { emoji: "✨", label: "Amazing", color: "text-amber-400", border: "border-amber-400", bg: "bg-amber-400/10" },
  good: { emoji: "😊", label: "Good", color: "text-emerald-400", border: "border-emerald-400", bg: "bg-emerald-400/10" },
  okay: { emoji: "😐", label: "Okay", color: "text-sky-400", border: "border-sky-400", bg: "bg-sky-400/10" },
  meh: { emoji: "😶", label: "Meh", color: "text-slate-400", border: "border-slate-400", bg: "bg-slate-400/10" },
  rough: { emoji: "😔", label: "Rough", color: "text-rose-400", border: "border-rose-400", bg: "bg-rose-400/10" },
};

interface MoodPickerProps {
  value?: Mood;
  onChange: (mood: Mood) => void;
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="flex gap-2">
      {(Object.entries(MOOD_CONFIG) as [Mood, typeof MOOD_CONFIG[Mood]][]).map(([mood, config]) => (
        <button
          key={mood}
          type="button"
          onClick={() => onChange(mood)}
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-all duration-150 bg-transparent",
            "hover:scale-105 hover:shadow-sm cursor-pointer",
            value === mood
              ? [config.border, config.bg, config.color, "shadow-sm scale-105"]
              : "border-border bg-muted/30 text-muted-foreground hover:border-border/80",
          )}
        >
          <span className="text-xl">{config.emoji}</span>
          <span className="text-[10px] font-medium uppercase tracking-wide">{config.label}</span>
        </button>
      ))}
    </div>
  );
}
