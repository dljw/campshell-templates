import { useState } from "react";
import {
  Badge,
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@campshell/ui-components";
import { ExternalLink, Tv } from "lucide-react";
import type { RunHistoryItem } from "../hooks/useApifyYouTube.js";
import { ACTORS } from "../lib/actors.js";
import { ActorInfoCard } from "./ActorInfoCard.js";
import { PROXY_COUNTRIES } from "../lib/options.js";
import { MediaThumbnail } from "./MediaThumbnail.js";

const TEMPLATE_NAME = "apify-youtube";

interface Channel {
  id?: string;
  channelId: string;
  channelName?: string;
  subscriberCount?: number | null;
  videosCount?: number | null;
  viewCount?: number | null;
  description?: string;
  channelUrl?: string;
  channelHandle?: string;
  channelAvatarUrl?: string;
  channelBannerUrl?: string;
  channelJoinedDate?: string;
  channelLocation?: string;
  channelLinks?: { name: string; url: string }[];
  isVerified?: boolean;
  mediaCache?: Record<string, string | null> | null;
}

export interface ChannelScrapeViewProps {
  onExecute: (operation: string, input: unknown) => Promise<any>;
  isExecuting: boolean;
  runs: RunHistoryItem[];
}

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString();
}

export function ChannelScrapeView({ onExecute, isExecuting }: ChannelScrapeViewProps) {
  const [urlsText, setUrlsText] = useState("");
  const [proxyCountry, setProxyCountry] = useState("");
  const [cacheMedia, setCacheMedia] = useState(true);
  const [channels, setChannels] = useState<Channel[] | null>(null);

  const handleExecute = async () => {
    const channelUrls = urlsText
      .split(/\n/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
    if (channelUrls.length === 0) return;
    try {
      const data = await onExecute("channel-scrape", {
        channelUrls,
        ...(proxyCountry ? { proxyCountry } : {}),
        cacheMedia,
      });
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
          <ActorInfoCard actor={ACTORS["streamers/youtube-scraper"]} />
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
            <p className="text-xs text-muted-foreground">One per line. Max 50 per call.</p>
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
          <label className="flex items-start gap-2 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={cacheMedia}
              onChange={(e) => setCacheMedia(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium">Cache avatars + banners</span>
              <p className="text-muted-foreground mt-0.5">Recommended on.</p>
            </span>
          </label>
        </div>
        <div className="p-6 border-t border-border/40">
          <Button onClick={handleExecute} disabled={isExecuting || !urlsText.trim()} className="w-full">
            {isExecuting ? "Scraping..." : "Get Channels"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
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
            <div className="space-y-4 p-6">
              {channels.map((c) => (
                <ChannelCard key={c.channelId} channel={c} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChannelCard({ channel: c }: { channel: Channel }) {
  return (
    <div className="rounded-lg border border-border/40 bg-card overflow-hidden">
      {c.channelBannerUrl && (
        <div className="aspect-[6/1] w-full">
          <MediaThumbnail
            templateName={TEMPLATE_NAME}
            cachedRelPath={c.mediaCache?.banner ?? null}
            liveUrl={c.channelBannerUrl}
            aspect="16:9"
            alt={c.channelName ?? ""}
          />
        </div>
      )}
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden shrink-0">
            <MediaThumbnail
              templateName={TEMPLATE_NAME}
              cachedRelPath={c.mediaCache?.avatar ?? null}
              liveUrl={c.channelAvatarUrl ?? ""}
              aspect="square"
              alt={c.channelName ?? ""}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-semibold text-sm truncate">
                {c.channelUrl ? (
                  <a href={c.channelUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {c.channelName ?? "—"}
                  </a>
                ) : (
                  c.channelName ?? "—"
                )}
              </h3>
              {c.isVerified && <span className="text-blue-500 text-xs" title="Verified">✓</span>}
              {c.channelHandle && (
                <Badge variant="outline" className="text-[10px]">
                  {c.channelHandle.startsWith("@") ? c.channelHandle : `@${c.channelHandle}`}
                </Badge>
              )}
            </div>
            {c.channelLocation && (
              <p className="text-[11px] text-muted-foreground mt-0.5">{c.channelLocation}</p>
            )}
            {c.channelJoinedDate && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Joined {c.channelJoinedDate}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat value={fmt(c.subscriberCount)} label="Subscribers" />
          <Stat value={fmt(c.videosCount)} label="Videos" />
          <Stat value={fmt(c.viewCount)} label="Total Views" />
        </div>

        {c.description && (
          <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-4">
            {c.description}
          </p>
        )}

        {(c.channelLinks?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-2">
            {c.channelLinks!.map((l, i) => (
              <a
                key={`${l.url}-${i}`}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="w-3 h-3 shrink-0" />
                <span>{l.name || l.url.replace(/^https?:\/\//, "")}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-semibold text-sm">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
    </div>
  );
}
