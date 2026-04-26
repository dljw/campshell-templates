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
import { Hash } from "lucide-react";
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
  videoViewCount?: number | null;
  likesCount?: number | null;
  commentsCount?: number | null;
  createTime?: string;
  timestamp?: string;
  webVideoUrl?: string;
  url?: string;
  coverUrl?: string;
  displayUrl?: string;
  videoUrl?: string;
  mediaType?: string;
  hashtags?: string[];
  authorUsername?: string;
  shortcode?: string;
  childPosts?: { id?: string; type?: string; displayUrl?: string; videoUrl?: string }[];
  mediaCache?: Record<string, string | null> | null;
  _raw?: Record<string, unknown> | null;
}

export interface HashtagScrapeViewProps {
  onExecute: (operation: string, input: unknown) => Promise<any>;
  isExecuting: boolean;
  runs: RunHistoryItem[];
  onDownloadZip: (runId: string, itemIds: string[]) => Promise<void>;
}

export function HashtagScrapeView({
  onExecute,
  isExecuting,
  onDownloadZip,
}: HashtagScrapeViewProps) {
  const [hashtag, setHashtag] = useState("");
  const [videosLimit, setVideosLimit] = useState(20);
  const [proxyCountry, setProxyCountry] = useState("");
  const [cacheMedia, setCacheMedia] = useState(false);
  const [cacheVideos, setCacheVideos] = useState(false);
  const [videos, setVideos] = useState<VideoItem[] | null>(null);
  const [runId, setRunId] = useState<string | null>(null);

  const handleExecute = async () => {
    const tag = hashtag.trim().replace(/^#/, "");
    if (!tag) return;
    try {
      const data = await onExecute("hashtag-scrape", {
        hashtag: tag,
        videosLimit,
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
          <h2 className="font-semibold text-sm">Hashtag Scraper</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Pull recent videos using a given hashtag.
          </p>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <ActorInfoCard actor={ACTORS["clockworks/free-tiktok-scraper"]} />
          <div className="space-y-2">
            <Label htmlFor="hashtag">
              Hashtag<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="hashtag"
              placeholder="fyp"
              value={hashtag}
              onChange={(e) => setHashtag(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">No # symbol needed.</p>
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
                Also download MP4 files. Storage-heavy.
              </p>
            </span>
          </label>
        </div>
        <div className="p-6 border-t border-border/40">
          <Button onClick={handleExecute} disabled={isExecuting || !hashtag.trim()} className="w-full">
            {isExecuting ? "Scraping..." : "Get Videos"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {videos === null ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
            <Hash className="w-10 h-10 opacity-25" />
            <p className="font-medium text-sm">Hashtag videos will appear here</p>
          </div>
        ) : (
          <PostsResultsView
            items={videos}
            templateName={TEMPLATE_NAME}
            runId={runId}
            aspect="9:16"
            emptyMessage={`No videos found for #${hashtag}.`}
            onDownloadZip={onDownloadZip}
          />
        )}
      </div>
    </div>
  );
}
