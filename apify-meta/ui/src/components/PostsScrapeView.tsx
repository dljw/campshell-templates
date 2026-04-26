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
import { FileText } from "lucide-react";
import type { RunHistoryItem } from "../hooks/useApifyMeta.js";
import { ACTORS } from "../lib/actors.js";
import { ActorInfoCard } from "./ActorInfoCard.js";
import { PROXY_COUNTRIES } from "../lib/options.js";
import { PostsResultsView } from "./PostsResultsView.js";

const TEMPLATE_NAME = "apify-meta";

interface MetaPost {
  id?: string;
  postId?: string;
  caption?: string;
  timestamp?: string;
  shortcode?: string;
  text?: string;
  time?: string;
  likesCount?: number | null;
  commentsCount?: number | null;
  sharesCount?: number | null;
  viewsCount?: number | null;
  url?: string;
  displayUrl?: string;
  videoUrl?: string;
  mediaType?: string;
  hashtags?: string[];
  mentions?: string[];
  isSponsored?: boolean;
  reactions?: Record<string, number | null>;
  media?: { type?: string; url?: string; thumbnailUrl?: string }[];
  link?: { url: string; title: string; description: string; image: string } | null;
  pageName?: string;
  pageUrl?: string;
  childPosts?: { id?: string; type?: string; displayUrl?: string; videoUrl?: string }[];
  mediaCache?: Record<string, string | null> | null;
  _raw?: Record<string, unknown> | null;
}

export interface PostsScrapeViewProps {
  onExecute: (operation: string, input: unknown) => Promise<any>;
  isExecuting: boolean;
  runs: RunHistoryItem[];
  onDownloadZip: (runId: string, itemIds: string[]) => Promise<void>;
}

export function PostsScrapeView({
  onExecute,
  isExecuting,
  onDownloadZip,
}: PostsScrapeViewProps) {
  const [pageUrl, setPageUrl] = useState("");
  const [postsLimit, setPostsLimit] = useState(20);
  const [onlyNewerThan, setOnlyNewerThan] = useState("");
  const [onlyOlderThan, setOnlyOlderThan] = useState("");
  const [proxyCountry, setProxyCountry] = useState("");
  const [cacheMedia, setCacheMedia] = useState(false);
  const [posts, setPosts] = useState<MetaPost[] | null>(null);
  const [runId, setRunId] = useState<string | null>(null);

  const handleExecute = async () => {
    const u = pageUrl.trim();
    if (!u) return;
    try {
      const data = await onExecute("posts-scrape", {
        pageUrl: u,
        postsLimit,
        ...(onlyNewerThan ? { onlyPostsNewerThan: onlyNewerThan } : {}),
        ...(onlyOlderThan ? { onlyPostsOlderThan: onlyOlderThan } : {}),
        ...(proxyCountry ? { proxyCountry } : {}),
        cacheMedia,
      });
      setPosts(data.output?.posts ?? []);
      setRunId(data.runId ?? null);
    } catch {}
  };

  return (
    <div className="flex h-full">
      <div className="w-80 shrink-0 border-r border-border/40 flex flex-col">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Posts Scraper</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Pull recent posts from a public Facebook page, with engagement counts.
          </p>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <ActorInfoCard actor={ACTORS["apify/facebook-posts-scraper"]} />
          <div className="space-y-2">
            <Label htmlFor="pageUrl">
              Page URL<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="pageUrl"
              placeholder="https://www.facebook.com/nasa"
              value={pageUrl}
              onChange={(e) => setPageUrl(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postsLimit">Number of posts</Label>
            <Input
              id="postsLimit"
              type="number"
              min={1}
              max={200}
              value={postsLimit}
              onChange={(e) => setPostsLimit(Math.min(200, Math.max(1, Number(e.target.value) || 20)))}
            />
            <p className="text-xs text-muted-foreground">Max 200 per call.</p>
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
                Download thumbnails so historical runs render later.
              </p>
            </span>
          </label>
        </div>
        <div className="p-6 border-t border-border/40">
          <Button onClick={handleExecute} disabled={isExecuting || !pageUrl.trim()} className="w-full">
            {isExecuting ? "Scraping..." : "Get Posts"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {posts === null ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
            <FileText className="w-10 h-10 opacity-25" />
            <p className="font-medium text-sm">Posts will appear here</p>
          </div>
        ) : (
          <PostsResultsView
            items={posts}
            templateName={TEMPLATE_NAME}
            runId={runId}
            aspect="16:9"
            emptyMessage="No posts found for that page."
            onDownloadZip={onDownloadZip}
          />
        )}
      </div>
    </div>
  );
}
