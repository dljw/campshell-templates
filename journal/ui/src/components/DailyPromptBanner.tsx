import { cn } from "@campshell/ui-components";
import type { JournalPrompt } from "../types.js";

interface DailyPromptBannerProps {
  prompts: JournalPrompt[];
  onUsePrompt?: (prompt: JournalPrompt) => void;
}

function getDailyPrompt(prompts: JournalPrompt[]): JournalPrompt | null {
  if (prompts.length === 0) return null;
  const today = new Date().toISOString().slice(0, 10);
  const seed = today.split("-").reduce((a, b) => a + Number.parseInt(b), 0);
  return prompts[seed % prompts.length];
}

export function DailyPromptBanner({ prompts, onUsePrompt }: DailyPromptBannerProps) {
  const prompt = getDailyPrompt(prompts);
  if (!prompt) return null;

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border/50 overflow-hidden",
        "bg-gradient-to-r from-violet-500/10 via-pink-500/8 to-amber-500/10",
      )}
    >
      <div className="px-5 py-4 flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5">💡</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Today's prompt
          </p>
          <p className="text-sm font-medium text-foreground leading-relaxed">{prompt.text}</p>
        </div>
        {onUsePrompt && (
          <button
            type="button"
            onClick={() => onUsePrompt(prompt)}
            className="shrink-0 text-xs text-primary hover:text-primary/80 font-medium transition-colors mt-0.5 bg-transparent"
          >
            Write →
          </button>
        )}
      </div>
    </div>
  );
}
