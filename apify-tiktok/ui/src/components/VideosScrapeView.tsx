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
import type { RunHistoryItem } from "../hooks/useApifyTikTok.js";

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
  const [videos, setVideos] = useState<VideoItem[] | null>(null);

  const handleExecute = async () => {
    const u = username.trim().replace(/^@/, "");
    if (!u) return;
    try {
      const data: any = await onExecute("videos-scrape", { username: u, videosLimit });
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
              max={50}
              value={videosLimit}
              onChange={(e) =>
                setVideosLimit(Math.min(50, Math.max(1, Number(e.target.value) || 20)))
              }
            />
            <p className="text-xs text-muted-foreground">Max 50 per call.</p>
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
