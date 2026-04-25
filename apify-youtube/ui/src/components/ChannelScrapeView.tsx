import { useState } from "react";
import {
  Button,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from "@campshell/ui-components";
import { Tv } from "lucide-react";
import type { RunHistoryItem } from "../hooks/useApifyYouTube.js";

interface Channel {
  channelId: string;
  channelName: string;
  subscriberCount: number;
  videosCount: number;
  viewCount: number;
  description: string;
  channelUrl: string;
}

export interface ChannelScrapeViewProps {
  onExecute: (operation: string, input: unknown) => Promise<unknown>;
  isExecuting: boolean;
  runs: RunHistoryItem[];
}

export function ChannelScrapeView({ onExecute, isExecuting }: ChannelScrapeViewProps) {
  const [urlsText, setUrlsText] = useState("");
  const [channels, setChannels] = useState<Channel[] | null>(null);

  const handleExecute = async () => {
    const channelUrls = urlsText
      .split(/\n/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
    if (channelUrls.length === 0) return;
    try {
      const data: any = await onExecute("channel-scrape", { channelUrls });
      setChannels(data.output?.channels ?? []);
    } catch {}
  };

  return (
    <div className="flex h-full">
      <div className="w-80 shrink-0 border-r border-border/40 flex flex-col">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Channel Scraper</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Look up subscriber stats for one or more public YouTube channels.
          </p>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="urls">
              Channel URLs<span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="urls"
              placeholder={"https://www.youtube.com/@MrBeast\nhttps://www.youtube.com/@veritasium"}
              value={urlsText}
              onChange={(e) => setUrlsText(e.target.value)}
              rows={6}
              className="resize-none text-xs font-mono"
            />
            <p className="text-xs text-muted-foreground">One per line. Max 10 per call.</p>
          </div>
        </div>
        <div className="p-6 border-t border-border/40">
          <Button onClick={handleExecute} disabled={isExecuting || !urlsText.trim()} className="w-full">
            {isExecuting ? "Scraping..." : "Get Channels"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Results</h2>
        </div>
        <div className="flex-1 overflow-auto">
          {channels === null ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <Tv className="w-10 h-10 opacity-25" />
              <p className="font-medium text-sm">Channel data will appear here</p>
            </div>
          ) : channels.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <p className="text-sm">No channels found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead className="text-right">Subscribers</TableHead>
                  <TableHead className="text-right">Videos</TableHead>
                  <TableHead className="text-right">Total Views</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.map((c, i) => (
                  <TableRow key={c.channelId || i}>
                    <TableCell className="font-medium">
                      {c.channelUrl ? (
                        <a href={c.channelUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                          {c.channelName || "—"}
                        </a>
                      ) : (
                        c.channelName || "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right">{c.subscriberCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-right">{c.videosCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-right">{c.viewCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="max-w-md text-xs text-muted-foreground line-clamp-2">
                      {c.description || "—"}
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
