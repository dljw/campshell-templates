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
import type { RunHistoryItem } from "../hooks/useApifyTikTok.js";
import { ACTORS } from "../lib/actors.js";
import { ActorInfoCard } from "./ActorInfoCard.js";
import { PROXY_COUNTRIES } from "../lib/options.js";
import { PostsResultsView } from "./PostsResultsView.js";

const TEMPLATE_NAME = "apify-tiktok";

interface VideoItem {
  id?: string;
  caption?: string;
  text?: string;
  playCount?: number | null;
  diggCount?: number | null;
  commentCount?: number | null;
  shareCount?: number | null;
  videoViewCount?: number | null;
  likesCount?: number | null;
  commentsCount?: number | null;
  videoDurationSeconds?: number | null;
  createTime?: string;
  timestamp?: string;
  webVideoUrl?: string;
  url?: string;
  coverUrl?: string;
  displayUrl?: string;
  videoUrl?: string;
  mediaType?: string;
  hashtags?: string[];
  mentions?: string[];
  musicTitle?: string;
  childPosts?: { id?: string; type?: string; displayUrl?: string; videoUrl?: string }[];
  authorUsername?: string;
  shortcode?: string;
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
  const [username, setUsername] = useState("");
  const [videosLimit, setVideosLimit] = useState(20);
  const [onlyNewerThan, setOnlyNewerThan] = useState("");
  const [onlyOlderThan, setOnlyOlderThan] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "popular">("latest");
  const [proxyCountry, setProxyCountry] = useState("");
  const [cacheMedia, setCacheMedia] = useState(false);
  const [cacheVideos, setCacheVideos] = useState(false);
  const [videos, setVideos] = useState<VideoItem[] | null>(null);
  const [runId, setRunId] = useState<string | null>(null);

  const handleExecute = async () => {
    const u = username.trim().replace(/^@/, "");
    if (!u) return;
    try {
      const data = await onExecute("videos-scrape", {
        username: u,
        videosLimit,
        sortBy,
        ...(onlyNewerThan ? { onlyPostsNewerThan: onlyNewerThan } : {}),
        ...(onlyOlderThan ? { onlyPostsOlderThan: onlyOlderThan } : {}),
        ...(proxyCountry ? { proxyCountry } : {}),
        cacheMedia,
        cacheVideos,
      });
      setVideos(data.output?.videos ?? []);
      setRunId(data.runId ?? null);
    } catch {}
  };

  return (
    <div className="flex h-full">
      <div className="w-80 shrink-0 border-r border-border/40 flex flex-col">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Videos Scraper</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Pull recent videos from a public TikTok profile, with engagement counts.
          </p>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <ActorInfoCard actor={ACTORS["clockworks/free-tiktok-scraper"]} />
          <div className="space-y-2">
            <Label htmlFor="username">
              Username<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="username"
              placeholder="zachking"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="videosLimit">Number of videos</Label>
            <Input
              id="videosLimit"
              type="number"
              min={1}
              max={200}
              value={videosLimit}
              onChange={(e) => setVideosLimit(Math.min(200, Math.max(1, Number(e.target.value) || 20)))}
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
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="popular">Most popular</SelectItem>
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
                Download cover images so historical runs render after TikTok URLs expire.
              </p>
            </span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={cacheVideos}
              onChange={(e) => setCacheVideos(e.target.checked)}
              disabled={!cacheMedia}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium">Cache full videos</span>
              <p className="text-muted-foreground mt-0.5">
                Also download MP4 files. Storage-heavy — use only if you need them offline.
              </p>
            </span>
          </label>
        </div>
        <div className="p-6 border-t border-border/40">
          <Button onClick={handleExecute} disabled={isExecuting || !username.trim()} className="w-full">
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
            aspect="9:16"
            emptyMessage={`No videos found for @${username}.`}
            onDownloadZip={onDownloadZip}
          />
        )}
      </div>
    </div>
  );
}
