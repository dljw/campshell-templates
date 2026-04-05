import { Button, Skeleton } from "@campshell/ui-components";
import { PenLine } from "lucide-react";
import { useMemo, useState } from "react";
import type { JournalEntry, JournalPrompt, Tag } from "../types.js";
import { CreateEntryDialog } from "./CreateEntryDialog.js";
import { DailyPromptBanner } from "./DailyPromptBanner.js";
import { EntryCard } from "./EntryCard.js";
import { EntryDetailSheet } from "./EntryDetailSheet.js";

interface TimelineViewProps {
  entries: JournalEntry[];
  tags: Tag[];
  prompts: JournalPrompt[];
  isLoading: boolean;
  onCreateEntry: (entry: JournalEntry) => boolean;
  onUpdateEntry: (entry: JournalEntry) => boolean;
  onDeleteEntry: (id: string) => boolean;
}

export function TimelineView({
  entries,
  tags,
  prompts,
  isLoading,
  onCreateEntry,
  onUpdateEntry,
  onDeleteEntry,
}: TimelineViewProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [prefillPrompt, setPrefillPrompt] = useState<JournalPrompt | undefined>();
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.date.localeCompare(a.date);
    }),
    [entries],
  );

  const handleUsePrompt = (prompt: JournalPrompt) => {
    setPrefillPrompt(prompt);
    setCreateOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
        {/* Daily prompt banner */}
        <DailyPromptBanner prompts={prompts} onUsePrompt={handleUsePrompt} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            {entries.length > 0 ? `${entries.length} entr${entries.length === 1 ? "y" : "ies"}` : "Your journal"}
          </h2>
          <Button size="sm" onClick={() => { setPrefillPrompt(undefined); setCreateOpen(true); }} className="gap-2">
            <PenLine className="w-3.5 h-3.5" />
            Write
          </Button>
        </div>

        {/* Entry list */}
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <span className="text-6xl">🌸</span>
            <div>
              <p className="font-semibold text-foreground mb-1">Your journal is waiting</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Start with today. How are you feeling? Even a few words count.
              </p>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="mt-2 gap-2">
              <PenLine className="w-4 h-4" />
              Write your first entry
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                tags={tags}
                onClick={() => setSelectedEntry(entry)}
              />
            ))}
          </div>
        )}
      </div>

      <CreateEntryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        tags={tags}
        prompts={prompts}
        onSave={onCreateEntry}
        prefillPrompt={prefillPrompt}
      />

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
