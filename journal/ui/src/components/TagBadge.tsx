import { cn } from "@campshell/ui-components";
import type { Tag, TagColor } from "../types.js";

const COLOR_CLASSES: Record<TagColor, string> = {
  red: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  orange: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  yellow: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  blue: "bg-sky-500/15 text-sky-400 border-sky-500/20",
  purple: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  pink: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  gray: "bg-slate-500/15 text-slate-400 border-slate-500/20",
};

interface TagBadgeProps {
  tag: Tag;
  className?: string;
}

export function TagBadge({ tag, className }: TagBadgeProps) {
  const colorClass = tag.color ? COLOR_CLASSES[tag.color] : "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        colorClass,
        className,
      )}
    >
      {tag.emoji && <span>{tag.emoji}</span>}
      {tag.name}
    </span>
  );
}
