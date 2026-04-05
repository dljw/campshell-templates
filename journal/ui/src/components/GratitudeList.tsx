import { Button, Input } from "@campshell/ui-components";
import { Plus, X } from "lucide-react";
import { useState } from "react";

interface GratitudeListProps {
  items: string[];
  onChange: (items: string[]) => void;
  readOnly?: boolean;
}

export function GratitudeList({ items, onChange, readOnly }: GratitudeListProps) {
  const [draft, setDraft] = useState("");

  const addItem = () => {
    const trimmed = draft.trim();
    if (!trimmed || items.length >= 10) return;
    onChange([...items, trimmed]);
    setDraft("");
  };

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  if (readOnly) {
    return (
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <span className="mt-0.5 shrink-0">✨</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 group">
            <span className="shrink-0">✨</span>
            <span className="flex-1 text-sm">{item}</span>
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground bg-transparent"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </li>
        ))}
      </ul>
      {items.length < 10 && (
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem())}
            placeholder="Something you're grateful for…"
            className="h-8 text-sm"
          />
          <Button type="button" onClick={addItem} size="sm" variant="ghost" className="h-8 px-2">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
