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
import { Search } from "lucide-react";
import type { RunHistoryItem } from "../hooks/useApifyYouTube.js";
import { ACTORS } from "../lib/actors.js";
import { ActorInfoCard } from "./ActorInfoCard.js";
import {
  DURATION_OPTIONS,
  PROXY_COUNTRIES,
  SEARCH_SORT_OPTIONS,
  UPLOAD_DATE_OPTIONS,
} from "../lib/options.js";
import { PostsResultsView } from "./PostsResultsView.js";

const TEMPLATE_NAME = "apify-youtube";

interface SearchResultItem {
  id?: string;
  videoId?: string;
  title?: string;
  caption?: string;
  description?: string;
  channelName?: string;
  channelUrl?: string;
  viewCount?: number | null;
  videoViewCount?: number | null;
  publishedAt?: string;
  timestamp?: string;
  url?: string;
  thumbnailUrl?: string;
  displayUrl?: string;
  videoUrl?: string;
  durationSeconds?: number | null;
  videoDurationSeconds?: number | null;
  hashtags?: string[];
  isShorts?: boolean;
  kind?: string;
  shortcode?: string;
  mediaType?: string;
  productType?: string;
  childPosts?: { id?: string; type?: string; displayUrl?: string; videoUrl?: string }[];
  mediaCache?: Record<string, string | null> | null;
  _raw?: Record<string, unknown> | null;
}

export interface SearchScrapeViewProps {
  onExecute: (operation: string, input: unknown) => Promise<any>;
  isExecuting: boolean;
  runs: RunHistoryItem[];
  onDownloadZip: (runId: string, itemIds: string[]) => Promise<void>;
}

export function SearchScrapeView({
  onExecute,
  isExecuting,
  onDownloadZip,
}: SearchScrapeViewProps) {
  const [query, setQuery] = useState("");
  const [maxResults, setMaxResults] = useState(20);
  const [uploadDate, setUploadDate] = useState("all");
  const [duration, setDuration] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [proxyCountry, setProxyCountry] = useState("");
  const [cacheMedia, setCacheMedia] = useState(false);
  const [results, setResults] = useState<SearchResultItem[] | null>(null);
  const [runId, setRunId] = useState<string | null>(null);

  const handleExecute = async () => {
    const q = query.trim();
    if (!q) return;
    try {
      const data = await onExecute("search-scrape", {
        query: q,
        maxResults,
        uploadDate,
        duration,
        sortBy,
        ...(proxyCountry ? { proxyCountry } : {}),
        cacheMedia,
      });
      setResults(data.output?.results ?? []);
      setRunId(data.runId ?? null);
    } catch {}
  };

  return (
    <div className="flex h-full">
      <div className="w-80 shrink-0 border-r border-border/40 flex flex-col">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Search Scraper</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Run a YouTube search and get back ranked video results.
          </p>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <ActorInfoCard actor={ACTORS["streamers/youtube-scraper"]} />
          <div className="space-y-2">
            <Label htmlFor="query">
              Search query<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="query"
              placeholder="react server components"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxResults">Number of results</Label>
            <Input
              id="maxResults"
              type="number"
              min={1}
              max={200}
              value={maxResults}
              onChange={(e) => setMaxResults(Math.min(200, Math.max(1, Number(e.target.value) || 20)))}
            />
            <p className="text-xs text-muted-foreground">Max 200 per call.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="uploadDate">Uploaded</Label>
            <Select value={uploadDate} onValueChange={setUploadDate}>
              <SelectTrigger id="uploadDate">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UPLOAD_DATE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger id="duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortBy">Sort by</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sortBy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEARCH_SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                Download thumbnails so historical search runs render later.
              </p>
            </span>
          </label>
        </div>
        <div className="p-6 border-t border-border/40">
          <Button onClick={handleExecute} disabled={isExecuting || !query.trim()} className="w-full">
            {isExecuting ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {results === null ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
            <Search className="w-10 h-10 opacity-25" />
            <p className="font-medium text-sm">Search results will appear here</p>
          </div>
        ) : (
          <PostsResultsView
            items={results}
            templateName={TEMPLATE_NAME}
            runId={runId}
            aspect="16:9"
            emptyMessage="No results found."
            onDownloadZip={onDownloadZip}
          />
        )}
      </div>
    </div>
  );
}
