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
import { FileText } from "lucide-react";
import type { RunHistoryItem } from "../hooks/useApifyMeta.js";
import { ACTORS } from "../lib/actors.js";
import { ActorInfoCard } from "./ActorInfoCard.js";
import { PROXY_COUNTRIES } from "../lib/options.js";

interface Post {
  postId: string;
  text: string;
  time: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  url: string;
  mediaType: string;
}

export interface PostsScrapeViewProps {
  onExecute: (operation: string, input: unknown) => Promise<unknown>;
  isExecuting: boolean;
  runs: RunHistoryItem[];
}

export function PostsScrapeView({ onExecute, isExecuting }: PostsScrapeViewProps) {
  const [pageUrl, setPageUrl] = useState("");
  const [postsLimit, setPostsLimit] = useState(20);
  const [onlyNewerThan, setOnlyNewerThan] = useState("");
  const [onlyOlderThan, setOnlyOlderThan] = useState("");
  const [proxyCountry, setProxyCountry] = useState("");
  const [posts, setPosts] = useState<Post[] | null>(null);

  const handleExecute = async () => {
    const u = pageUrl.trim();
    if (!u) return;
    try {
      const data: any = await onExecute("posts-scrape", {
        pageUrl: u,
        postsLimit,
        ...(onlyNewerThan ? { onlyPostsNewerThan: onlyNewerThan } : {}),
        ...(onlyOlderThan ? { onlyPostsOlderThan: onlyOlderThan } : {}),
        ...(proxyCountry ? { proxyCountry } : {}),
      });
      setPosts(data.output?.posts ?? []);
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
        </div>
        <div className="p-6 border-t border-border/40">
          <Button onClick={handleExecute} disabled={isExecuting || !pageUrl.trim()} className="w-full">
            {isExecuting ? "Scraping..." : "Get Posts"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Results</h2>
        </div>
        <div className="flex-1 overflow-auto">
          {posts === null ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <FileText className="w-10 h-10 opacity-25" />
              <p className="font-medium text-sm">Posts will appear here</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <p className="text-sm">No posts found for that page.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Text</TableHead>
                  <TableHead className="text-right">Likes</TableHead>
                  <TableHead className="text-right">Comments</TableHead>
                  <TableHead className="text-right">Shares</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((p, i) => (
                  <TableRow key={p.postId || i}>
                    <TableCell className="max-w-md text-xs line-clamp-2">{p.text || "—"}</TableCell>
                    <TableCell className="text-right">{p.likesCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-right">{p.commentsCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-right">{p.sharesCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {p.time ? new Date(p.time).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      {p.url ? (
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">
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
