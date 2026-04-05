import { Badge, Button, cn, Skeleton } from "@campshell/ui-components";
import { Shuffle, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { JournalEntry, JournalPrompt, PromptCategory, Tag } from "../types.js";
import { CreateEntryDialog } from "./CreateEntryDialog.js";

const CATEGORY_CONFIG: Record<PromptCategory, { emoji: string; label: string; color: string }> = {
  reflection: { emoji: "🪞", label: "Reflection", color: "bg-sky-500/15 text-sky-400 border-sky-500/20" },
  gratitude: { emoji: "✨", label: "Gratitude", color: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  creativity: { emoji: "🎨", label: "Creativity", color: "bg-pink-500/15 text-pink-400 border-pink-500/20" },
  growth: { emoji: "🌱", label: "Growth", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  memory: { emoji: "📸", label: "Memory", color: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
  dream: { emoji: "🌙", label: "Dream", color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20" },
  fun: { emoji: "🎉", label: "Fun", color: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
};

interface PromptsViewProps {
  prompts: JournalPrompt[];
  entries: JournalEntry[];
  tags: Tag[];
  isLoading: boolean;
  onCreateEntry: (entry: JournalEntry) => boolean;
}

export function PromptsView({ prompts, entries, tags, isLoading, onCreateEntry }: PromptsViewProps) {
  const [activeCategory, setActiveCategory] = useState<PromptCategory | "all">("all");
  const [randomPrompt, setRandomPrompt] = useState<JournalPrompt | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [writeFromPrompt, setWriteFromPrompt] = useState<JournalPrompt | undefined>();

  const filtered = useMemo(
    () => activeCategory === "all" ? prompts : prompts.filter((p) => p.category === activeCategory),
    [prompts, activeCategory],
  );

  const categories = useMemo(() => {
    const used = new Set(prompts.map((p) => p.category).filter(Boolean));
    return (Object.keys(CATEGORY_CONFIG) as PromptCategory[]).filter((c) => used.has(c));
  }, [prompts]);

  const pickRandom = () => {
    const pool = filtered.length > 0 ? filtered : prompts;
    if (pool.length === 0) return;
    const next = pool[Math.floor(Math.random() * pool.length)];
    setRandomPrompt(next);
  };

  const handleWrite = (prompt: JournalPrompt) => {
    setWriteFromPrompt(prompt);
    setCreateOpen(true);
  };

  if (isLoading) {
    return <div className="p-4 space-y-3">
      <Skeleton className="h-12 rounded-2xl" />
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-24 rounded-2xl" />
    </div>;
  }

  return (
    <>
      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {/* Random prompt hero */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Surprise me
            </h3>
            <Button variant="outline" size="sm" onClick={pickRandom} className="gap-2 group">
              <Shuffle className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
              Random
            </Button>
          </div>
          {randomPrompt ? (
            <div className="space-y-3">
              {randomPrompt.category && (
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                  CATEGORY_CONFIG[randomPrompt.category].color,
                )}>
                  {CATEGORY_CONFIG[randomPrompt.category].emoji} {CATEGORY_CONFIG[randomPrompt.category].label}
                </span>
              )}
              <p className="text-base font-medium text-foreground leading-relaxed">
                {randomPrompt.text}
              </p>
              <Button size="sm" onClick={() => handleWrite(randomPrompt)} className="gap-2">
                Write this ✍️
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Click "Random" for a prompt to inspire your next entry.
            </p>
          )}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-all bg-transparent",
              activeCategory === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/40 text-muted-foreground border-border hover:border-border/80",
            )}
          >
            All ({prompts.length})
          </button>
          {categories.map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            const count = prompts.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all bg-transparent",
                  activeCategory === cat
                    ? [config.color, "opacity-100"]
                    : "bg-muted/40 text-muted-foreground border-border hover:border-border/80",
                )}
              >
                {config.emoji} {config.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Prompt list */}
        <div className="space-y-2">
          {filtered.map((prompt) => {
            const catConfig = prompt.category ? CATEGORY_CONFIG[prompt.category] : null;
            return (
              <div
                key={prompt.id}
                className="group rounded-xl border border-border/60 bg-card px-4 py-3 flex items-start gap-3 hover:border-border transition-all"
                data-campshell-entity="journal/prompt/prompts.json"
              >
                <span className="text-lg shrink-0 mt-0.5">{catConfig?.emoji ?? "💬"}</span>
                <p className="flex-1 text-sm text-foreground leading-relaxed">{prompt.text}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleWrite(prompt)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-xs"
                >
                  Write
                </Button>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No prompts in this category.
            </div>
          )}
        </div>
      </div>

      <CreateEntryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        tags={tags}
        prompts={prompts}
        onSave={onCreateEntry}
        prefillPrompt={writeFromPrompt}
      />
    </>
  );
}
