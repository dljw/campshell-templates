import {
  Badge,
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@campshell/ui-components";
import { Tag as TagIcon } from "lucide-react";
import type { Tag, TagColor } from "../types.js";

interface TagsViewProps {
  tags: Tag[];
  isLoading: boolean;
  onUpdateTags: (tags: Tag[]) => void;
}

const TAG_COLORS: Record<string, string> = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  gray: "bg-muted-foreground",
};

const COLOR_OPTIONS: TagColor[] = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "gray",
];

export function TagsView({ tags, isLoading, onUpdateTags }: TagsViewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
          <TagIcon className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-medium">No tags yet</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            Tags help you organize your knowledge base. Create them via MCP tools or JSON.
          </p>
        </div>
      </div>
    );
  }

  const handleColorChange = (tagId: string, color: TagColor) => {
    const updated = tags.map((t) => (t.id === tagId ? { ...t, color } : t));
    onUpdateTags(updated);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-2 text-muted-foreground mb-6">
        <TagIcon className="w-5 h-5" />
        <h2 className="text-lg font-medium text-foreground">All Tags</h2>
        <Badge variant="secondary" className="ml-2 font-normal">
          {tags.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/30 transition-colors"
          >
            <div
              className={cn(
                "w-3 h-3 rounded-full shrink-0 shadow-sm",
                tag.color ? TAG_COLORS[tag.color] : "bg-muted",
              )}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{tag.name}</p>
              <p className="text-[10px] font-mono text-muted-foreground opacity-60 truncate">
                {tag.id}
              </p>
            </div>
            <Select
              value={tag.color ?? "gray"}
              onValueChange={(v: string) => handleColorChange(tag.id, v as TagColor)}
            >
              <SelectTrigger className="w-28 h-8 text-xs bg-transparent border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLOR_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn("w-2 h-2 rounded-full", TAG_COLORS[c])}
                      />
                      <span className="capitalize">{c}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}
