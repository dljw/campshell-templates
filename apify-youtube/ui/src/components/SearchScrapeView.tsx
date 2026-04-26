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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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

interface Result {
  videoId: string;
  title: string;
  channelName: string;
  viewCount: number;
  publishedAt: string;
  url: string;
}

export interface SearchScrapeViewProps {
  onExecute: (operation: string, input: unknown) => Promise<unknown>;
  isExecuting: boolean;
  runs: RunHistoryItem[];
}

export function SearchScrapeView({ onExecute, isExecuting }: SearchScrapeViewProps) {
  const [query, setQuery] = useState("");
  const [maxResults, setMaxResults] = useState(20);
  const [uploadDate, setUploadDate] = useState("all");
  const [duration, setDuration] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [proxyCountry, setProxyCountry] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);

  const handleExecute = async () => {
    const q = query.trim();
    if (!q) return;
    try {
      const data: any = await onExecute("search-scrape", {
        query: q,
        maxResults,
        uploadDate,
        duration,
        sortBy,
        ...(proxyCountry ? { proxyCountry } : {}),
      });
      setResults(data.output?.results ?? []);
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
        </div>
        <div className="p-6 border-t border-border/40">
          <Button onClick={handleExecute} disabled={isExecuting || !query.trim()} className="w-full">
            {isExecuting ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Results</h2>
        </div>
        <div className="flex-1 overflow-auto">
          {results === null ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <Search className="w-10 h-10 opacity-25" />
              <p className="font-medium text-sm">Search results will appear here</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <p className="text-sm">No results found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r) => (
                  <TableRow key={r.videoId}>
                    <TableCell className="max-w-md text-xs line-clamp-2 font-medium">{r.title || "—"}</TableCell>
                    <TableCell className="text-xs">{r.channelName || "—"}</TableCell>
                    <TableCell className="text-right">{r.viewCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {r.publishedAt ? new Date(r.publishedAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      {r.url ? (
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">
                          Open
                        </a>
                      ) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
