import { cn } from "@campshell/ui-components";
import { Pin } from "lucide-react";
import { MOOD_CONFIG } from "./MoodPicker.js";
import { TagBadge } from "./TagBadge.js";
import type { JournalEntry, Tag } from "../types.js";

const WEATHER_EMOJI: Record<string, string> = {
  sunny: "☀️",
  cloudy: "☁️",
  rainy: "🌧️",
  snowy: "❄️",
  stormy: "⛈️",
  windy: "🌬️",
};

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

interface EntryCardProps {
  entry: JournalEntry;
  tags: Tag[];
  onClick: () => void;
}

export function EntryCard({ entry, tags, onClick }: EntryCardProps) {
  const moodConfig = entry.mood ? MOOD_CONFIG[entry.mood] : null;
  const entryTags = tags.filter((t) => entry.tagIds?.includes(t.id));

  return (
    <button
      type="button"
      onClick={onClick}
      data-campshell-entity={`journal/entries/entries/${entry.id}.json`}
      className={cn(
        "w-full text-left rounded-2xl border border-border/60 bg-transparent bg-card",
        "hover:border-border hover:shadow-md hover:scale-[1.01] transition-all duration-150",
        "overflow-hidden group cursor-pointer",
      )}
    >
      {/* Mood accent bar */}
      <div
        className={cn(
          "h-1 w-full",
          moodConfig ? moodConfig.bg.replace("/10", "/60") : "bg-muted",
        )}
      />

      <div className="px-4 py-3 space-y-2">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {entry.moodEmoji || (moodConfig?.emoji) ? (
              <span className="text-xl shrink-0">{entry.moodEmoji ?? moodConfig?.emoji}</span>
            ) : null}
            <h3 className="font-semibold text-sm text-foreground truncate leading-snug">
              {entry.title}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {entry.pinned && <Pin className="w-3.5 h-3.5 text-muted-foreground" />}
            {entry.weather && (
              <span className="text-base">{WEATHER_EMOJI[entry.weather]}</span>
            )}
          </div>
        </div>

        {/* Highlight */}
        {entry.highlight && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {entry.highlight}
          </p>
        )}

        {/* Gratitude preview */}
        {entry.gratitude && entry.gratitude.length > 0 && (
          <p className="text-xs text-muted-foreground/80">
            ✨ {entry.gratitude[0]}
            {entry.gratitude.length > 1 && ` +${entry.gratitude.length - 1} more`}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap gap-1">
            {entryTags.slice(0, 3).map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {formatDate(entry.date)}
          </span>
        </div>
      </div>
    </button>
  );
}
