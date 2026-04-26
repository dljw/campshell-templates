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
import type { RunHistoryItem } from "../hooks/useApifyTikTok.js";
import { ACTORS } from "../lib/actors.js";
import { ActorInfoCard } from "./ActorInfoCard.js";
import { PROXY_COUNTRIES } from "../lib/options.js";

interface VideoItem {
  id: string;
  text: string;
  playCount: number;
  diggCount: number;
  authorUsername: string;
  createTime: string;
}

export interface HashtagScrapeViewProps {
  onExecute: (operation: string, input: unknown) => Promise<unknown>;
  isExecuting: boolean;
  runs: RunHistoryItem[];
}

export function HashtagScrapeView({ onExecute, isExecuting }: HashtagScrapeViewProps) {
  const [hashtag, setHashtag] = useState("");
  const [videosLimit, setVideosLimit] = useState(20);
  const [proxyCountry, setProxyCountry] = useState("");
  const [videos, setVideos] = useState<VideoItem[] | null>(null);

  const handleExecute = async () => {
    const tag = hashtag.trim().replace(/^#/, "");
    if (!tag) return;
    try {
      const data: any = await onExecute("hashtag-scrape", {
        hashtag: tag,
        videosLimit,
        ...(proxyCountry ? { proxyCountry } : {}),
      });
      setVideos(data.output?.videos ?? []);
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
              placeholder="funny"
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
        </div>
        <div className="p-6 border-t border-border/40">
          <Button onClick={handleExecute} disabled={isExecuting || !hashtag.trim()} className="w-full">
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
              <Hash className="w-10 h-10 opacity-25" />
              <p className="font-medium text-sm">Hashtag videos will appear here</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <p className="text-sm">No videos found for #{hashtag}.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Caption</TableHead>
                  <TableHead className="text-right">Plays</TableHead>
                  <TableHead className="text-right">Likes</TableHead>
                  <TableHead>Posted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">@{v.authorUsername || "?"}</TableCell>
                    <TableCell className="max-w-md text-xs line-clamp-2">{v.text || "—"}</TableCell>
                    <TableCell className="text-right">{v.playCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-right">{v.diggCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {v.createTime ? new Date(v.createTime).toLocaleDateString() : "—"}
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
