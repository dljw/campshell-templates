import { Badge, cn, Skeleton } from "@campshell/ui-components";
import { useMemo } from "react";
import type { JournalEntry, Mood } from "../types.js";
import { MOOD_CONFIG } from "./MoodPicker.js";

interface MoodInsightsViewProps {
  entries: JournalEntry[];
  isLoading: boolean;
}

function getLast30Days(entries: JournalEntry[]): JournalEntry[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return entries.filter((e) => e.date >= cutoffStr);
}

export function MoodInsightsView({ entries, isLoading }: MoodInsightsViewProps) {
  const recent = useMemo(() => getLast30Days(entries), [entries]);

  const moodCounts = useMemo(() => {
    const counts: Partial<Record<Mood, number>> = {};
    for (const entry of recent) {
      if (entry.mood) counts[entry.mood] = (counts[entry.mood] ?? 0) + 1;
    }
    return counts;
  }, [recent]);

  const totalWithMood = useMemo(
    () => Object.values(moodCounts).reduce((a, b) => a + (b ?? 0), 0),
    [moodCounts],
  );

  const topMood = useMemo(() => {
    let best: Mood | null = null;
    let bestCount = 0;
    for (const [mood, count] of Object.entries(moodCounts) as [Mood, number][]) {
      if ((count ?? 0) > bestCount) { best = mood; bestCount = count ?? 0; }
    }
    return best;
  }, [moodCounts]);

  const currentStreak = useMemo(() => {
    const byDate = new Set(entries.map((e) => e.date));
    let streak = 0;
    const d = new Date();
    while (true) {
      const dateStr = d.toISOString().slice(0, 10);
      if (!byDate.has(dateStr)) break;
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }, [entries]);

  const avgGratitudeItems = useMemo(() => {
    const withGratitude = entries.filter((e) => e.gratitude && e.gratitude.length > 0);
    if (withGratitude.length === 0) return 0;
    const total = withGratitude.reduce((sum, e) => sum + (e.gratitude?.length ?? 0), 0);
    return Math.round((total / withGratitude.length) * 10) / 10;
  }, [entries]);

  if (isLoading) {
    return <div className="p-4 space-y-3">
      <Skeleton className="h-20 rounded-2xl" />
      <Skeleton className="h-40 rounded-2xl" />
    </div>;
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-4">
        <span className="text-6xl">🌈</span>
        <div>
          <p className="font-semibold text-foreground mb-1">No mood data yet</p>
          <p className="text-sm text-muted-foreground">Start journaling and your mood insights will appear here.</p>
        </div>
      </div>
    );
  }

  const moods: Mood[] = ["amazing", "good", "okay", "meh", "rough"];

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border/60 bg-card px-4 py-4 text-center">
          <p className="text-2xl font-bold text-foreground">{entries.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total entries</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card px-4 py-4 text-center">
          <p className="text-2xl font-bold text-foreground">{currentStreak}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {currentStreak === 1 ? "Day streak 🔥" : currentStreak > 0 ? "Day streak 🔥" : "Day streak"}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card px-4 py-4 text-center">
          <p className="text-2xl font-bold text-foreground">{avgGratitudeItems}</p>
          <p className="text-xs text-muted-foreground mt-1">Avg. gratitudes ✨</p>
        </div>
      </div>

      {/* Top mood callout */}
      {topMood && (
        <div className={cn(
          "rounded-2xl border p-5 flex items-center gap-4",
          MOOD_CONFIG[topMood].bg, MOOD_CONFIG[topMood].border,
        )}>
          <span className="text-4xl">{MOOD_CONFIG[topMood].emoji}</span>
          <div>
            <p className={cn("font-semibold text-base", MOOD_CONFIG[topMood].color)}>
              {MOOD_CONFIG[topMood].label} is your top mood this month!
            </p>
            <p className="text-sm text-muted-foreground">
              You felt {MOOD_CONFIG[topMood].label.toLowerCase()} on {moodCounts[topMood] ?? 0} out of {recent.length} recent entries 🌟
            </p>
          </div>
        </div>
      )}

      {/* Mood distribution */}
      {totalWithMood > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold">Last 30 days — mood breakdown</h3>
          <div className="space-y-3">
            {moods.map((mood) => {
              const count = moodCounts[mood] ?? 0;
              const pct = totalWithMood > 0 ? Math.round((count / totalWithMood) * 100) : 0;
              const config = MOOD_CONFIG[mood];
              return (
                <div key={mood} className="flex items-center gap-3">
                  <span className="text-lg w-6 text-center">{config.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{config.label}</span>
                      <span className="text-xs text-muted-foreground">{count} {count === 1 ? "day" : "days"}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", config.bg.replace("/10", "/80"))}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent mood timeline */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold">Recent entries</h3>
        <div className="flex gap-1.5 flex-wrap">
          {[...entries]
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 28)
            .map((entry) => {
              const config = entry.mood ? MOOD_CONFIG[entry.mood] : null;
              return (
                <div
                  key={entry.id}
                  title={`${entry.date}: ${entry.mood ?? "no mood"}`}
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center text-base",
                    config ? config.bg : "bg-muted",
                  )}
                >
                  {entry.moodEmoji ?? config?.emoji ?? "📝"}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
