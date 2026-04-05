import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Textarea,
  cn,
} from "@campshell/ui-components";
import { Pin, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Energy, JournalEntry, Tag, Weather } from "../types.js";
import { GratitudeList } from "./GratitudeList.js";
import { MOOD_CONFIG, MoodPicker } from "./MoodPicker.js";
import { TagBadge } from "./TagBadge.js";
import type { Mood } from "../types.js";

const WEATHER_EMOJI: Record<string, string> = {
  sunny: "☀️", cloudy: "☁️", rainy: "🌧️", snowy: "❄️", stormy: "⛈️", windy: "🌬️",
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
  } catch { return dateStr; }
}

interface EntryDetailSheetProps {
  entry: JournalEntry | null;
  tags: Tag[];
  onClose: () => void;
  onUpdate: (entry: JournalEntry) => boolean;
  onDelete: (id: string) => boolean;
}

export function EntryDetailSheet({ entry, tags, onClose, onUpdate, onDelete }: EntryDetailSheetProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<JournalEntry | null>(null);

  useEffect(() => {
    if (entry) {
      setForm({ ...entry });
      setEditing(false);
    }
  }, [entry?.id]);

  if (!entry || !form) return null;

  const moodConfig = entry.mood ? MOOD_CONFIG[entry.mood] : null;
  const entryTags = tags.filter((t) => entry.tagIds?.includes(t.id));

  const set = <K extends keyof JournalEntry>(key: K, value: JournalEntry[K]) => {
    setForm((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const handleSave = () => {
    if (!form) return;
    const updated = { ...form, updatedAt: new Date().toISOString() };
    if (onUpdate(updated)) setEditing(false);
  };

  const handleDelete = () => {
    if (confirm("Delete this entry?")) {
      onDelete(entry.id);
      onClose();
    }
  };

  const toggleTag = (tagId: string) => {
    const current = form.tagIds ?? [];
    set("tagIds", current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId]);
  };

  return (
    <Sheet open={!!entry} onOpenChange={(v) => { if (!v) { onClose(); setEditing(false); } }}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto flex flex-col gap-0 p-0">
        {/* Mood accent stripe */}
        <div className={cn("h-1.5 w-full shrink-0", moodConfig ? moodConfig.bg.replace("/10", "/60") : "bg-muted")} />

        <SheetHeader className="px-6 pt-5 pb-4 border-b border-border/40">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {(entry.moodEmoji ?? moodConfig?.emoji) && (
                <span className="text-2xl">{entry.moodEmoji ?? moodConfig?.emoji}</span>
              )}
              <div className="min-w-0">
                <SheetTitle className="text-base font-semibold truncate">{entry.title}</SheetTitle>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  {formatDate(entry.date)}
                  {entry.weather && <span>{WEATHER_EMOJI[entry.weather]}</span>}
                  {entry.pinned && <Pin className="w-3 h-3" />}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {!editing && (
                <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>Edit</Button>
              )}
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 px-6 py-5 space-y-5 overflow-y-auto">
          {editing ? (
            /* Edit mode */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Weather</Label>
                  <Select value={form.weather} onValueChange={(v) => set("weather", v as Weather)}>
                    <SelectTrigger><SelectValue placeholder="Weather" /></SelectTrigger>
                    <SelectContent>
                      {["sunny","cloudy","rainy","snowy","stormy","windy"].map((w) => (
                        <SelectItem key={w} value={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Mood</Label>
                <MoodPicker value={form.mood} onChange={(m) => set("mood", m)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Custom emoji</Label>
                  <Input value={form.moodEmoji ?? ""} onChange={(e) => set("moodEmoji", e.target.value)} placeholder="🌈" maxLength={10} />
                </div>
                <div className="space-y-1.5">
                  <Label>Energy</Label>
                  <Select value={form.energy} onValueChange={(v) => set("energy", v as Energy)}>
                    <SelectTrigger><SelectValue placeholder="Energy" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">⚡ High</SelectItem>
                      <SelectItem value="medium">〰️ Medium</SelectItem>
                      <SelectItem value="low">🌙 Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Highlight</Label>
                <Input value={form.highlight ?? ""} onChange={(e) => set("highlight", e.target.value)} placeholder="One-sentence day summary" />
              </div>
              <div className="space-y-1.5">
                <Label>Entry</Label>
                <Textarea value={form.content ?? ""} onChange={(e) => set("content", e.target.value)} rows={6} className="resize-none" />
              </div>
              <div className="space-y-1.5">
                <Label>Gratitude ✨</Label>
                <GratitudeList items={form.gratitude ?? []} onChange={(g) => set("gratitude", g)} />
              </div>
              {tags.length > 0 && (
                <div className="space-y-1.5">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                        className={`transition-opacity bg-transparent ${(form.tagIds ?? []).includes(tag.id) ? "opacity-100" : "opacity-40 hover:opacity-70"}`}>
                        <TagBadge tag={tag} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="pinned" checked={!!form.pinned} onChange={(e) => set("pinned", e.target.checked)} className="h-4 w-4" />
                <Label htmlFor="pinned">📌 Pin this entry</Label>
              </div>
              <div className="flex gap-2 pt-1">
                <Button onClick={handleSave} size="sm">Save Changes</Button>
                <Button variant="outline" size="sm" onClick={() => { setForm({ ...entry }); setEditing(false); }}>Cancel</Button>
              </div>
            </div>
          ) : (
            /* Read mode */
            <div className="space-y-5">
              {/* Mood + Energy row */}
              {(entry.mood || entry.energy) && (
                <div className="flex items-center gap-3 flex-wrap">
                  {entry.mood && moodConfig && (
                    <span className={cn("text-sm font-medium px-3 py-1 rounded-full border", moodConfig.bg, moodConfig.color, moodConfig.border)}>
                      {moodConfig.emoji} {moodConfig.label}
                    </span>
                  )}
                  {entry.energy && (
                    <span className="text-xs text-muted-foreground">
                      {entry.energy === "high" ? "⚡" : entry.energy === "medium" ? "〰️" : "🌙"} {entry.energy} energy
                    </span>
                  )}
                </div>
              )}

              {/* Highlight */}
              {entry.highlight && (
                <div className="rounded-xl bg-muted/40 border border-border/40 px-4 py-3">
                  <p className="text-sm font-medium text-foreground italic">"{entry.highlight}"</p>
                </div>
              )}

              {/* Content */}
              {entry.content && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Entry</p>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                </div>
              )}

              {/* Gratitude */}
              {entry.gratitude && entry.gratitude.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gratitude</p>
                  <GratitudeList items={entry.gratitude} onChange={() => {}} readOnly />
                </div>
              )}

              {/* Tags */}
              {entryTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {entryTags.map((tag) => <TagBadge key={tag.id} tag={tag} />)}
                </div>
              )}

              {/* Prompt used */}
              {entry.promptUsed && (
                <div className="rounded-xl border border-border/40 px-4 py-3 bg-muted/20">
                  <p className="text-xs text-muted-foreground mb-1">Written from prompt</p>
                  <p className="text-xs text-foreground italic">"{entry.promptUsed}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
