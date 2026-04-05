import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@campshell/ui-components";
import { useState } from "react";
import type { Energy, JournalEntry, JournalPrompt, Mood, Tag, Weather } from "../types.js";
import { GratitudeList } from "./GratitudeList.js";
import { MoodPicker } from "./MoodPicker.js";
import { TagBadge } from "./TagBadge.js";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 36);
}

function generateId(title: string): string {
  const slug = slugify(title || "entry");
  const suffix = Date.now().toString(36).slice(-4);
  const base = slug.slice(0, 30);
  return `${base}-${suffix}`.replace(/^-+|-+$/g, "").slice(0, 36);
}

interface CreateEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: Tag[];
  prompts: JournalPrompt[];
  onSave: (entry: JournalEntry) => boolean;
  prefillPrompt?: JournalPrompt;
}

export function CreateEntryDialog({
  open,
  onOpenChange,
  tags,
  prompts: _prompts,
  onSave,
  prefillPrompt,
}: CreateEntryDialogProps) {
  const today = new Date().toISOString().slice(0, 10);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [mood, setMood] = useState<Mood | undefined>();
  const [moodEmoji, setMoodEmoji] = useState("");
  const [energy, setEnergy] = useState<Energy | undefined>();
  const [weather, setWeather] = useState<Weather | undefined>();
  const [content, setContent] = useState(prefillPrompt ? `*Prompt: ${prefillPrompt.text}*\n\n` : "");
  const [highlight, setHighlight] = useState("");
  const [gratitude, setGratitude] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setTitle("");
    setDate(today);
    setMood(undefined);
    setMoodEmoji("");
    setEnergy(undefined);
    setWeather(undefined);
    setContent("");
    setHighlight("");
    setGratitude([]);
    setSelectedTagIds([]);
  };

  const handleSave = () => {
    if (!title.trim() || !date) return;
    setSaving(true);
    const entry: JournalEntry = {
      id: generateId(title),
      createdAt: new Date().toISOString(),
      title: title.trim(),
      date,
      ...(mood && { mood }),
      ...(moodEmoji.trim() && { moodEmoji: moodEmoji.trim() }),
      ...(energy && { energy }),
      ...(weather && { weather }),
      ...(content.trim() && { content: content.trim() }),
      ...(highlight.trim() && { highlight: highlight.trim() }),
      ...(gratitude.length > 0 && { gratitude }),
      ...(selectedTagIds.length > 0 && { tagIds: selectedTagIds }),
      ...(prefillPrompt && { promptUsed: prefillPrompt.text }),
    };
    const ok = onSave(entry);
    setSaving(false);
    if (ok) {
      reset();
      onOpenChange(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>🌸</span> New Entry
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Title + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's this entry about?"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Weather</Label>
              <Select value={weather} onValueChange={(v) => setWeather(v as Weather)}>
                <SelectTrigger>
                  <SelectValue placeholder="How's the weather?" />
                </SelectTrigger>
                <SelectContent>
                  {["sunny", "cloudy", "rainy", "snowy", "stormy", "windy"].map((w) => (
                    <SelectItem key={w} value={w}>
                      {w.charAt(0).toUpperCase() + w.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mood */}
          <div className="space-y-1.5">
            <Label>How are you feeling?</Label>
            <MoodPicker value={mood} onChange={setMood} />
          </div>

          {/* Custom mood emoji + Energy */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Custom mood emoji</Label>
              <Input
                value={moodEmoji}
                onChange={(e) => setMoodEmoji(e.target.value)}
                placeholder="e.g. 🌈"
                maxLength={10}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Energy</Label>
              <Select value={energy} onValueChange={(v) => setEnergy(v as Energy)}>
                <SelectTrigger>
                  <SelectValue placeholder="Your energy level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">⚡ High</SelectItem>
                  <SelectItem value="medium">〰️ Medium</SelectItem>
                  <SelectItem value="low">🌙 Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Highlight */}
          <div className="space-y-1.5">
            <Label>Day highlight</Label>
            <Input
              value={highlight}
              onChange={(e) => setHighlight(e.target.value)}
              placeholder="One sentence summary of your day…"
              maxLength={500}
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <Label>Entry</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write anything… thoughts, feelings, what happened today."
              rows={5}
              className="resize-none"
            />
          </div>

          {/* Gratitude */}
          <div className="space-y-1.5">
            <Label>Gratitude ✨</Label>
            <GratitudeList items={gratitude} onChange={setGratitude} />
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="space-y-1.5">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`transition-opacity bg-transparent ${selectedTagIds.includes(tag.id) ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
                  >
                    <TagBadge tag={tag} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !title.trim() || !date}>
            {saving ? "Saving…" : "Save Entry 🌸"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
