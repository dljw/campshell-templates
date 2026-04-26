import { useState } from "react";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@campshell/ui-components";
import { Video } from "lucide-react";
import type { RunHistoryItem } from "../hooks/useApifyYouTube.js";
import { ACTORS } from "../lib/actors.js";
import { ActorInfoCard } from "./ActorInfoCard.js";
import { PROXY_COUNTRIES, VIDEOS_SORT_OPTIONS } from "../lib/options.js";
import { PostsResultsView } from "./PostsResultsView.js";
import type { Aspect } from "./MediaThumbnail.js";

const TEMPLATE_NAME = "apify-youtube";

interface YtVideoItem {
  id?: string;
  videoId?: string;
  title?: string;
  caption?: string;
  description?: string;
  viewCount?: number | null;
  likesCount?: number | null;
  commentsCount?: number | null;
  videoViewCount?: number | null;
  durationSeconds?: number | null;
  videoDurationSeconds?: number | null;
  publishedAt?: string;
  timestamp?: string;
  url?: string;
  thumbnailUrl?: string;
  displayUrl?: string;
  videoUrl?: string;
  channelName?: string;
  channelUrl?: string;
  hashtags?: string[];
  isShorts?: boolean;
  isLive?: boolean;
  shortcode?: string;
  mediaType?: string;
  productType?: string;
  childPosts?: { id?: string; type?: string; displayUrl?: string; videoUrl?: string }[];
  mediaCache?: Record<string, string | null> | null;
  _raw?: Record<string, unknown> | null;
}

export interface VideosScrapeViewProps {
  onExecute: (operation: string, input: unknown) => Promise<any>;
  isExecuting: boolean;
  runs: RunHistoryItem[];
  onDownloadZip: (runId: string, itemIds: string[]) => Promise<void>;
}

export function VideosScrapeView({
  onExecute,
  isExecuting,
  onDownloadZip,
}: VideosScrapeViewProps) {
  const [channelUrl, setChannelUrl] = useState("");
  const [maxVideos, setMaxVideos] = useState(20);
  const [onlyNewerThan, setOnlyNewerThan] = useState("");
  const [onlyOlderThan, setOnlyOlderThan] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "oldest">("newest");
  const [proxyCountry, setProxyCountry] = useState("");
  const [cacheMedia, setCacheMedia] = useState(true);
  const [videos, setVideos] = useState<YtVideoItem[] | null>(null);
  const [runId, setRunId] = useState<string | null>(null);

  const handleExecute = async () => {
    const u = channelUrl.trim();
    if (!u) return;
    try {
      const data = await onExecute("videos-scrape", {
        channelUrl: u,
        maxVideos,
        sortBy,
        ...(onlyNewerThan ? { onlyPostsNewerThan: onlyNewerThan } : {}),
        ...(onlyOlderThan ? { onlyPostsOlderThan: onlyOlderThan } : {}),
        ...(proxyCountry ? { proxyCountry } : {}),
        cacheMedia,
      });
      setVideos(data.output?.videos ?? []);
      setRunId(data.runId ?? null);
    } catch {}
  };

  // Choose aspect: 9:16 if all results are Shorts, otherwise 16:9.
  const allShorts =
    videos !== null && videos.length > 0 && videos.every((v) => v.isShorts);
  const aspect: Aspect = allShorts ? "9:16" : "16:9";

  return (
    <div className="flex h-full">
      <div className="w-80 shrink-0 border-r border-border/40 flex flex-col">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Videos Scraper</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Pull recent videos from a public YouTube channel.
          </p>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <ActorInfoCard actor={ACTORS["streamers/youtube-scraper"]} />
          <div className="space-y-2">
            <Label htmlFor="channelUrl">
              Channel URL<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="channelUrl"
              placeholder="https://www.youtube.com/@MrBeast"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxVideos">Number of videos</Label>
            <Input
              id="maxVideos"
              type="number"
              min={1}
              max={200}
              value={maxVideos}
              onChange={(e) => setMaxVideos(Math.min(200, Math.max(1, Number(e.target.value) || 20)))}
            />
            <p className="text-xs text-muted-foreground">Max 200 per call.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortBy">Sort by</Label>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger id="sortBy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VIDEOS_SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="newer">Newer than</Label>
              <Input id="newer" type="date" value={onlyNewerThan} onChange={(e) => setOnlyNewerThan(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="older">Older than</Label>
              <Input id="older" type="date" value={onlyOlderThan} onChange={(e) => setOnlyOlderThan(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="proxy">Proxy country</Label>
            <Select value={proxyCountry || "auto"} onValueChange={(v) => setProxyCountry(v === "auto" ? "" : v)}>
              <SelectTrigger id="proxy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Automatic</SelectItem>
                {PROXY_COUNTRIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-start gap-2 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={cacheMedia}
              onChange={(e) => setCacheMedia(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium">Cache thumbnails</span>
              <p className="text-muted-foreground mt-0.5">
                Recommended on — YouTube thumbnails are tiny.
              </p>
            </span>
          </label>
        </div>
        <div className="p-6 border-t border-border/40">
          <Button onClick={handleExecute} disabled={isExecuting || !channelUrl.trim()} className="w-full">
            {isExecuting ? "Scraping..." : "Get Videos"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {videos === null ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
            <Video className="w-10 h-10 opacity-25" />
            <p className="font-medium text-sm">Videos will appear here</p>
          </div>
        ) : (
          <PostsResultsView
            items={videos}
            templateName={TEMPLATE_NAME}
            runId={runId}
            aspect={aspect}
            emptyMessage="No videos found for that channel."
            onDownloadZip={onDownloadZip}
          />
        )}
      </div>
    </div>
  );
}
