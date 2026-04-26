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
import { Image as ImageIcon } from "lucide-react";
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
  mediaUrl: string;
  mediaType: string;
  url: string;
}

export interface PostsScrapeViewProps {
  onExecute: (operation: string, input: unknown) => Promise<unknown>;
  isExecuting: boolean;
  runs: RunHistoryItem[];
}

export function PostsScrapeView({ onExecute, isExecuting }: PostsScrapeViewProps) {
  const [username, setUsername] = useState("");
  const [postsLimit, setPostsLimit] = useState(20);
  const [onlyNewerThan, setOnlyNewerThan] = useState("");
  const [onlyOlderThan, setOnlyOlderThan] = useState("");
  const [commentsLimit, setCommentsLimit] = useState(0);
  const [proxyCountry, setProxyCountry] = useState("");
  const [posts, setPosts] = useState<Post[] | null>(null);

  const handleExecute = async () => {
    const u = username.trim().replace(/^@/, "");
    if (!u) return;
    try {
      const data: any = await onExecute("posts-scrape", {
        username: u,
        postsLimit,
        ...(onlyNewerThan ? { onlyPostsNewerThan: onlyNewerThan } : {}),
        ...(onlyOlderThan ? { onlyPostsOlderThan: onlyOlderThan } : {}),
        ...(commentsLimit > 0 ? { commentsLimit } : {}),
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
          <h2 className="font-semibold text-sm">Posts Scraper</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Pull recent posts from a public Instagram profile, with engagement counts.
          </p>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <ActorInfoCard actor={ACTORS["apify/instagram-scraper"]} />
          <div className="space-y-2">
            <Label htmlFor="username">
              Username<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="username"
              placeholder="nasa"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="font-mono"
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
            <p className="text-xs text-muted-foreground">Max 200 per call. Larger = slower + more cost.</p>
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
            <Label htmlFor="commentsLimit">Comments per post</Label>
            <Input
              id="commentsLimit"
              type="number"
              min={0}
              max={50}
              value={commentsLimit}
              onChange={(e) => setCommentsLimit(Math.min(50, Math.max(0, Number(e.target.value) || 0)))}
            />
            <p className="text-xs text-muted-foreground">0 = no comments. Comments cost extra results.</p>
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
          <Button onClick={handleExecute} disabled={isExecuting || !username.trim()} className="w-full">
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
              <ImageIcon className="w-10 h-10 opacity-25" />
              <p className="font-medium text-sm">Posts will appear here</p>
              <p className="text-xs max-w-xs">
                Enter a username and click <span className="font-medium text-foreground">Get Posts</span>.
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <p className="text-sm">No posts found for @{username}.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Caption</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Likes</TableHead>
                  <TableHead className="text-right">Comments</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((p) => (
                  <TableRow key={p.id || p.shortcode}>
                    <TableCell className="max-w-md text-xs line-clamp-2">{p.caption || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.mediaType || "—"}</TableCell>
                    <TableCell className="text-right">{p.likesCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-right">{p.commentsCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {p.timestamp ? new Date(p.timestamp).toLocaleDateString() : "—"}
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
