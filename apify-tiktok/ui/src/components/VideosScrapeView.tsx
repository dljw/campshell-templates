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
import { Video } from "lucide-react";
import type { RunHistoryItem } from "../hooks/useApifyTikTok.js";
import { ACTORS } from "../lib/actors.js";
import { ActorInfoCard } from "./ActorInfoCard.js";
import { PROXY_COUNTRIES } from "../lib/options.js";

interface VideoItem {
  id: string;
  text: string;
  playCount: number;
  diggCount: number;
  commentCount: number;
  shareCount: number;
  createTime: string;
  webVideoUrl: string;
  musicTitle: string;
}

export interface VideosScrapeViewProps {
  onExecute: (operation: string, input: unknown) => Promise<unknown>;
  isExecuting: boolean;
  runs: RunHistoryItem[];
}

export function VideosScrapeView({ onExecute, isExecuting }: VideosScrapeViewProps) {
  const [username, setUsername] = useState("");
  const [videosLimit, setVideosLimit] = useState(20);
  const [onlyNewerThan, setOnlyNewerThan] = useState("");
  const [onlyOlderThan, setOnlyOlderThan] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "popular">("latest");
  const [proxyCountry, setProxyCountry] = useState("");
  const [videos, setVideos] = useState<VideoItem[] | null>(null);

  const handleExecute = async () => {
    const u = username.trim().replace(/^@/, "");
    if (!u) return;
    try {
      const data: any = await onExecute("videos-scrape", {
        username: u,
        videosLimit,
        sortBy,
        ...(onlyNewerThan ? { onlyPostsNewerThan: onlyNewerThan } : {}),
        ...(onlyOlderThan ? { onlyPostsOlderThan: onlyOlderThan } : {}),
        ...(proxyCountry ? { proxyCountry } : {}),
      });
      setVideos(data.output?.videos ?? []);
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
        </div>
        <div className="p-6 border-t border-border/40">
          <Button onClick={handleExecute} disabled={isExecuting || !username.trim()} className="w-full">
            {isExecuting ? "Scraping..." : "Get Videos"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Results</h2>
        </div>
        <div className="flex-1 overflow-auto">
          {videos === null ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <Video className="w-10 h-10 opacity-25" />
              <p className="font-medium text-sm">Videos will appear here</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <p className="text-sm">No videos found for @{username}.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Caption</TableHead>
                  <TableHead className="text-right">Plays</TableHead>
                  <TableHead className="text-right">Likes</TableHead>
                  <TableHead className="text-right">Comments</TableHead>
                  <TableHead className="text-right">Shares</TableHead>
                  <TableHead>Music</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="max-w-md text-xs line-clamp-2">{v.text || "—"}</TableCell>
                    <TableCell className="text-right">{v.playCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-right">{v.diggCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-right">{v.commentCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-right">{v.shareCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[160px] line-clamp-1">
                      {v.musicTitle || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {v.createTime ? new Date(v.createTime).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      {v.webVideoUrl ? (
                        <a href={v.webVideoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">
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
