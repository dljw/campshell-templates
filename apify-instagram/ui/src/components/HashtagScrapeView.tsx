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
import { Hash } from "lucide-react";
import type { RunHistoryItem } from "../hooks/useApifyInstagram.js";
import { ACTORS } from "../lib/actors.js";
import { ActorInfoCard } from "./ActorInfoCard.js";
import { PROXY_COUNTRIES } from "../lib/options.js";

interface Post {
  id: string;
  shortcode: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  timestamp: string;
  ownerUsername: string;
}

export interface HashtagScrapeViewProps {
  onExecute: (operation: string, input: unknown) => Promise<unknown>;
  isExecuting: boolean;
  runs: RunHistoryItem[];
}

export function HashtagScrapeView({ onExecute, isExecuting }: HashtagScrapeViewProps) {
  const [hashtag, setHashtag] = useState("");
  const [postsLimit, setPostsLimit] = useState(20);
  const [onlyNewerThan, setOnlyNewerThan] = useState("");
  const [onlyOlderThan, setOnlyOlderThan] = useState("");
  const [proxyCountry, setProxyCountry] = useState("");
  const [posts, setPosts] = useState<Post[] | null>(null);

  const handleExecute = async () => {
    const tag = hashtag.trim().replace(/^#/, "");
    if (!tag) return;
    try {
      const data: any = await onExecute("hashtag-scrape", {
        hashtag: tag,
        postsLimit,
        ...(onlyNewerThan ? { onlyPostsNewerThan: onlyNewerThan } : {}),
        ...(onlyOlderThan ? { onlyPostsOlderThan: onlyOlderThan } : {}),
        ...(proxyCountry ? { proxyCountry } : {}),
      });
      setPosts(data.output?.posts ?? []);
    } catch {
      // toast handled
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-80 shrink-0 border-r border-border/40 flex flex-col">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Hashtag Scraper</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Pull recent posts using a given hashtag.
          </p>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <ActorInfoCard actor={ACTORS["apify/instagram-scraper"]} />
          <div className="space-y-2">
            <Label htmlFor="hashtag">
              Hashtag<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="hashtag"
              placeholder="travel"
              value={hashtag}
              onChange={(e) => setHashtag(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">No # symbol needed.</p>
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
          <Button onClick={handleExecute} disabled={isExecuting || !hashtag.trim()} className="w-full">
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
              <Hash className="w-10 h-10 opacity-25" />
              <p className="font-medium text-sm">Hashtag posts will appear here</p>
              <p className="text-xs max-w-xs">
                Enter a hashtag and click <span className="font-medium text-foreground">Get Posts</span>.
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <p className="text-sm">No posts found for #{hashtag}.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Owner</TableHead>
                  <TableHead>Caption</TableHead>
                  <TableHead className="text-right">Likes</TableHead>
                  <TableHead className="text-right">Comments</TableHead>
                  <TableHead>Posted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((p) => (
                  <TableRow key={p.id || p.shortcode}>
                    <TableCell className="font-medium">@{p.ownerUsername || "?"}</TableCell>
                    <TableCell className="max-w-md text-xs line-clamp-2">{p.caption || "—"}</TableCell>
                    <TableCell className="text-right">{p.likesCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-right">{p.commentsCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {p.timestamp ? new Date(p.timestamp).toLocaleDateString() : "—"}
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
