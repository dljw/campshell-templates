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
import { Video } from "lucide-react";
import type { RunHistoryItem } from "../hooks/useApifyYouTube.js";

interface VideoItem {
  videoId: string;
  title: string;
  viewCount: number;
  likesCount: number;
  commentsCount: number;
  durationSeconds: number;
  publishedAt: string;
  url: string;
  thumbnailUrl: string;
}

export interface VideosScrapeViewProps {
  onExecute: (operation: string, input: unknown) => Promise<unknown>;
  isExecuting: boolean;
  runs: RunHistoryItem[];
}

function formatDuration(seconds: number) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function VideosScrapeView({ onExecute, isExecuting }: VideosScrapeViewProps) {
  const [channelUrl, setChannelUrl] = useState("");
  const [maxVideos, setMaxVideos] = useState(20);
  const [videos, setVideos] = useState<VideoItem[] | null>(null);

  const handleExecute = async () => {
    const u = channelUrl.trim();
    if (!u) return;
    try {
      const data: any = await onExecute("videos-scrape", { channelUrl: u, maxVideos });
      setVideos(data.output?.videos ?? []);
    } catch {}
  };

  return (
    <div className="flex h-full">
      <div className="w-80 shrink-0 border-r border-border/40 flex flex-col">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Videos Scraper</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Pull recent videos from a public YouTube channel.
          </p>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="channelUrl">
              Channel URL<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="channelUrl"
              placeholder="https://www.youtube.com/@MrBeast"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxVideos">Number of videos</Label>
            <Input
              id="maxVideos"
              type="number"
              min={1}
              max={50}
              value={maxVideos}
              onChange={(e) => setMaxVideos(Math.min(50, Math.max(1, Number(e.target.value) || 20)))}
            />
            <p className="text-xs text-muted-foreground">Max 50 per call.</p>
          </div>
        </div>
        <div className="p-6 border-t border-border/40">
          <Button onClick={handleExecute} disabled={isExecuting || !channelUrl.trim()} className="w-full">
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
              <p className="text-sm">No videos found for that channel.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Likes</TableHead>
                  <TableHead className="text-right">Comments</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((v) => (
                  <TableRow key={v.videoId}>
                    <TableCell className="max-w-md text-xs line-clamp-2 font-medium">{v.title || "—"}</TableCell>
                    <TableCell className="text-right">{v.viewCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-right">{v.likesCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-right">{v.commentsCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDuration(v.durationSeconds)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {v.publishedAt ? new Date(v.publishedAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      {v.url ? (
                        <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">
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
