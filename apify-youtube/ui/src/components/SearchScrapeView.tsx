import { useState } from "react";
import {
  Button,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@campshell/ui-components";
import { Search } from "lucide-react";
import type { RunHistoryItem } from "../hooks/useApifyYouTube.js";

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
  const [results, setResults] = useState<Result[] | null>(null);

  const handleExecute = async () => {
    const q = query.trim();
    if (!q) return;
    try {
      const data: any = await onExecute("search-scrape", { query: q, maxResults });
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
              max={50}
              value={maxResults}
              onChange={(e) => setMaxResults(Math.min(50, Math.max(1, Number(e.target.value) || 20)))}
            />
            <p className="text-xs text-muted-foreground">Max 50 per call.</p>
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
