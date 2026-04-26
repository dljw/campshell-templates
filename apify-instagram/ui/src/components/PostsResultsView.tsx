import { useMemo, useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@campshell/ui-components";
import { Download, Grid3x3, List, Loader2 } from "lucide-react";
import { PostGrid } from "./PostGrid.js";
import { PostDrawer, type PostDrawerItem } from "./PostDrawer.js";
import { MediaThumbnail, type Aspect } from "./MediaThumbnail.js";
import type { PostCardItem } from "./PostCard.js";

export interface PostsResultsViewProps<T extends PostCardItem & PostDrawerItem> {
  items: T[];
  templateName: string;
  runId: string | null;
  aspect?: Aspect;
  emptyMessage?: string;
  onDownloadZip?: (runId: string, itemIds: string[]) => Promise<void>;
}

function itemKey(item: PostCardItem, idx: number): string {
  return item.id ?? item.shortcode ?? item.username ?? String(idx);
}

export function PostsResultsView<T extends PostCardItem & PostDrawerItem>({
  items,
  templateName,
  runId,
  aspect = "square",
  emptyMessage = "No results.",
  onDownloadZip,
}: PostsResultsViewProps<T>) {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawerItem, setDrawerItem] = useState<T | null>(null);
  const [downloading, setDownloading] = useState(false);

  const keyedItems = useMemo(
    () => items.map((it, idx) => ({ key: itemKey(it, idx), item: it })),
    [items],
  );

  const cachedCount = useMemo(
    () => items.filter((it) => it.mediaCache && Object.values(it.mediaCache).some(Boolean)).length,
    [items],
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(keyedItems.map(({ key }) => key)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleDownload = async () => {
    if (!runId || !onDownloadZip) return;
    const ids =
      selectedIds.size > 0
        ? Array.from(selectedIds)
        : keyedItems.map(({ key }) => key);
    setDownloading(true);
    try {
      await onDownloadZip(runId, ids);
    } finally {
      setDownloading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-3 px-6 py-3 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{items.length}</span> items
          </span>
          {cachedCount > 0 && (
            <span className="text-emerald-600 dark:text-emerald-400">
              · {cachedCount} cached
            </span>
          )}
          {selectMode && (
            <>
              <span>·</span>
              <span>
                <span className="font-medium text-foreground">{selectedIds.size}</span> selected
              </span>
              <button
                type="button"
                onClick={selectAll}
                className="text-primary hover:underline"
              >
                all
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="text-primary hover:underline"
              >
                clear
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onDownloadZip && runId && cachedCount > 0 && (
            <>
              <Button
                variant={selectMode ? "secondary" : "ghost"}
                size="sm"
                onClick={() => {
                  setSelectMode((s) => !s);
                  if (selectMode) clearSelection();
                }}
              >
                {selectMode ? "Cancel" : "Select"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 mr-1" />
                )}
                {selectedIds.size > 0
                  ? `Download ${selectedIds.size}`
                  : "Download all"}
              </Button>
            </>
          )}
          <div className="flex items-center rounded-md border border-border/60 p-0.5">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`p-1.5 rounded ${view === "grid" ? "bg-secondary" : "hover:bg-accent"}`}
              aria-label="Grid view"
            >
              <Grid3x3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView("table")}
              className={`p-1.5 rounded ${view === "table" ? "bg-secondary" : "hover:bg-accent"}`}
              aria-label="Table view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {view === "grid" ? (
          <PostGrid
            items={items}
            templateName={templateName}
            aspect={aspect}
            selectable={selectMode}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onCardClick={(it) => setDrawerItem(it)}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Media</TableHead>
                <TableHead>Caption</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Likes</TableHead>
                <TableHead className="text-right">Comments</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead>Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => {
                const key = itemKey(item, idx);
                const isVideo =
                  item.mediaType === "Video" ||
                  item.productType === "clips" ||
                  Boolean(item.videoUrl);
                return (
                  <TableRow
                    key={key}
                    className="cursor-pointer"
                    onClick={() => setDrawerItem(item)}
                  >
                    <TableCell>
                      <div className="w-12 h-12 rounded overflow-hidden">
                        <MediaThumbnail
                          templateName={templateName}
                          cachedRelPath={item.mediaCache?.thumb ?? null}
                          liveUrl={item.displayUrl ?? ""}
                          aspect="square"
                          showVideoBadge={isVideo}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md text-xs line-clamp-2">
                      {item.caption || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.mediaType || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.likesCount?.toLocaleString() ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.commentsCount?.toLocaleString() ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-primary underline"
                        >
                          Open
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <PostDrawer
        item={drawerItem}
        open={drawerItem !== null}
        onClose={() => setDrawerItem(null)}
        templateName={templateName}
        carouselAspect={aspect}
      />
    </div>
  );
}
