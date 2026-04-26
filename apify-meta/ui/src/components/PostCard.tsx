import { Heart, MessageCircle, Eye } from "lucide-react";
import { MediaThumbnail, type Aspect } from "./MediaThumbnail.js";

export interface PostCardItem {
  id?: string;
  shortcode?: string;
  username?: string;
  displayUrl?: string;
  videoUrl?: string;
  mediaType?: string;
  productType?: string;
  likesCount?: number | null;
  commentsCount?: number | null;
  videoViewCount?: number | null;
  videoPlayCount?: number | null;
  caption?: string;
  childPosts?: { displayUrl?: string }[];
  mediaCache?: Record<string, string | null> | null;
}

export interface PostCardProps {
  item: PostCardItem;
  templateName: string;
  aspect?: Aspect;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onClick?: () => void;
}

function formatCount(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function PostCard({
  item,
  templateName,
  aspect = "square",
  selectable = false,
  selected = false,
  onToggleSelect,
  onClick,
}: PostCardProps) {
  const isVideo =
    item.mediaType === "Video" ||
    item.productType === "clips" ||
    Boolean(item.videoUrl);
  const carouselCount = item.childPosts?.length ?? 0;
  const views = item.videoViewCount ?? item.videoPlayCount ?? null;
  const cachedThumb = item.mediaCache?.thumb ?? null;
  const liveThumb = item.displayUrl ?? "";

  return (
    <div
      className={`group relative rounded-lg overflow-hidden border bg-card cursor-pointer transition-all hover:shadow-md ${
        selected ? "ring-2 ring-primary" : "border-border/40"
      }`}
      onClick={onClick}
    >
      <MediaThumbnail
        templateName={templateName}
        cachedRelPath={cachedThumb}
        liveUrl={liveThumb}
        aspect={aspect}
        alt={item.caption?.slice(0, 80) ?? ""}
        showVideoBadge={isVideo}
        showCarouselBadge={carouselCount}
      />

      {selectable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect?.();
          }}
          className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            selected
              ? "bg-primary border-primary opacity-100"
              : "bg-black/40 border-white/80 opacity-0 group-hover:opacity-100"
          }`}
          aria-label={selected ? "Deselect" : "Select"}
        >
          {selected && (
            <svg className="w-3 h-3 text-primary-foreground" viewBox="0 0 12 10" fill="none">
              <path
                d="M1 5l3 3 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      )}

      <div className="absolute inset-x-0 bottom-0 px-2 py-1.5 bg-gradient-to-t from-black/80 to-transparent text-white text-[11px] flex items-center gap-3">
        {views != null && (
          <span className="flex items-center gap-0.5">
            <Eye className="w-3 h-3" />
            {formatCount(views)}
          </span>
        )}
        <span className="flex items-center gap-0.5">
          <Heart className="w-3 h-3" />
          {formatCount(item.likesCount)}
        </span>
        <span className="flex items-center gap-0.5">
          <MessageCircle className="w-3 h-3" />
          {formatCount(item.commentsCount)}
        </span>
      </div>
    </div>
  );
}
