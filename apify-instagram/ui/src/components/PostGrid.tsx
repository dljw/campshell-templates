import { PostCard, type PostCardItem } from "./PostCard.js";
import type { Aspect } from "./MediaThumbnail.js";

export interface PostGridProps<T extends PostCardItem> {
  items: T[];
  templateName: string;
  aspect?: Aspect;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onCardClick?: (item: T) => void;
  itemKey?: (item: T) => string;
}

function defaultKey(item: PostCardItem, idx: number): string {
  return item.id ?? item.shortcode ?? item.username ?? String(idx);
}

export function PostGrid<T extends PostCardItem>({
  items,
  templateName,
  aspect = "square",
  selectable = false,
  selectedIds,
  onToggleSelect,
  onCardClick,
  itemKey,
}: PostGridProps<T>) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-6">
      {items.map((item, idx) => {
        const key = itemKey ? itemKey(item) : defaultKey(item, idx);
        return (
          <PostCard
            key={key}
            item={item}
            templateName={templateName}
            aspect={aspect}
            selectable={selectable}
            selected={selectedIds?.has(key) ?? false}
            onToggleSelect={() => onToggleSelect?.(key)}
            onClick={() => onCardClick?.(item)}
          />
        );
      })}
    </div>
  );
}
