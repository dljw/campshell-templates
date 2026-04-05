import { cn, Skeleton } from "@campshell/ui-components";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { JournalEntry, Tag } from "../types.js";
import { MOOD_CONFIG } from "./MoodPicker.js";
import { EntryDetailSheet } from "./EntryDetailSheet.js";

interface CalendarViewProps {
  entries: JournalEntry[];
  tags: Tag[];
  isLoading: boolean;
  onUpdateEntry: (entry: JournalEntry) => boolean;
  onDeleteEntry: (id: string) => boolean;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const MOOD_BORDER: Record<string, string> = {
  amazing: "border-amber-400/50 bg-amber-400/8",
  good: "border-emerald-400/50 bg-emerald-400/8",
  okay: "border-sky-400/50 bg-sky-400/8",
  meh: "border-slate-400/40 bg-slate-400/6",
  rough: "border-rose-400/50 bg-rose-400/8",
};

export function CalendarView({ entries, tags, isLoading, onUpdateEntry, onDeleteEntry }: CalendarViewProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const entryByDate = useMemo(() => {
    const map = new Map<string, JournalEntry[]>();
    for (const entry of entries) {
      if (!map.has(entry.date)) map.set(entry.date, []);
      map.get(entry.date)!.push(entry);
    }
    return map;
  }, [entries]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = new Date(year, month, 1).toLocaleString("en-US", { month: "long" });
  const todayStr = now.toISOString().slice(0, 10);

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  };

  if (isLoading) {
    return <div className="p-4"><Skeleton className="h-80 w-full rounded-2xl" /></div>;
  }

  // Total cells = padding + days, round up to full weeks
  const totalCells = firstDay + daysInMonth;
  const trailingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

  return (
    <>
      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {/* Calendar card */}
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">

          {/* Month nav — minimal, inline */}
          <div className="flex items-center justify-between px-6 py-4">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">{monthName}</p>
              <p className="text-xs text-muted-foreground">{year}</p>
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 px-2 pb-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="text-center text-[11px] font-medium text-muted-foreground/60 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid — no visible cell borders */}
          <div className="grid grid-cols-7 gap-0.5 px-2 pb-3">
            {/* Leading empty cells */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`pre-${i}`} className="h-12" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayEntries = entryByDate.get(dateStr) ?? [];
              const isToday = dateStr === todayStr;
              const firstEntry = dayEntries[0];
              const moodConfig = firstEntry?.mood ? MOOD_CONFIG[firstEntry.mood] : null;
              const moodBorder = firstEntry?.mood ? MOOD_BORDER[firstEntry.mood] : null;
              const hasEntry = dayEntries.length > 0;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => firstEntry && setSelectedEntry(firstEntry)}
                  disabled={!hasEntry}
                  className={cn(
                    "h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-150 relative bg-transparent",
                    hasEntry && [
                      "border cursor-pointer hover:scale-105 hover:shadow-sm",
                      moodBorder ?? "border-border/40 bg-muted/20",
                    ],
                    !hasEntry && "cursor-default",
                    isToday && !hasEntry && "ring-1 ring-primary/40 ring-inset",
                  )}
                >
                  {/* Date number */}
                  <span
                    className={cn(
                      "text-xs leading-none font-medium",
                      isToday
                        ? "w-5 h-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px]"
                        : hasEntry
                          ? "text-foreground"
                          : "text-muted-foreground/50",
                    )}
                  >
                    {day}
                  </span>

                  {/* Mood emoji */}
                  {firstEntry && (
                    <span className="text-base leading-none">
                      {firstEntry.moodEmoji ?? moodConfig?.emoji ?? "📝"}
                    </span>
                  )}

                  {/* Multi-entry dot */}
                  {dayEntries.length > 1 && (
                    <span className="absolute bottom-1 right-1.5 text-[8px] text-muted-foreground/70 leading-none">
                      +{dayEntries.length - 1}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Trailing empty cells */}
            {Array.from({ length: trailingCells }).map((_, i) => (
              <div key={`post-${i}`} className="h-12" />
            ))}
          </div>
        </div>

        {/* Mood legend — compact pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {(Object.entries(MOOD_CONFIG) as [string, typeof MOOD_CONFIG[keyof typeof MOOD_CONFIG]][]).map(([mood, config]) => (
            <div
              key={mood}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border",
                MOOD_BORDER[mood] ?? "bg-muted/20 border-border/40",
              )}
            >
              <span className="text-sm">{config.emoji}</span>
              <span className="text-muted-foreground font-medium">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      <EntryDetailSheet
        entry={selectedEntry}
        tags={tags}
        onClose={() => setSelectedEntry(null)}
        onUpdate={onUpdateEntry}
        onDelete={onDeleteEntry}
      />
    </>
  );
}
