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
import { ExternalLink, Users } from "lucide-react";
import type { RunHistoryItem } from "../hooks/useApifyMeta.js";
import { ACTORS } from "../lib/actors.js";
import { ActorInfoCard } from "./ActorInfoCard.js";
import { PROXY_COUNTRIES } from "../lib/options.js";
import { MediaThumbnail } from "./MediaThumbnail.js";

const TEMPLATE_NAME = "apify-meta";

interface Page {
  id?: string;
  pageId?: string;
  name?: string;
  followers?: number | null;
  likes?: number | null;
  category?: string;
  about?: string;
  websites?: string[];
  profilePictureUrl?: string;
  coverPhotoUrl?: string;
  pageUrl?: string;
  verified?: boolean;
  address?: string;
  phone?: string;
  email?: string;
  priceRange?: string;
  creationDate?: string;
  categories?: string[];
  mediaCache?: Record<string, string | null> | null;
}

export interface PagesScrapeViewProps {
  onExecute: (operation: string, input: unknown) => Promise<any>;
  isExecuting: boolean;
  runs: RunHistoryItem[];
}

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString();
}

export function PagesScrapeView({ onExecute, isExecuting }: PagesScrapeViewProps) {
  const [urlsText, setUrlsText] = useState("");
  const [proxyCountry, setProxyCountry] = useState("");
  const [cacheMedia, setCacheMedia] = useState(true);
  const [pages, setPages] = useState<Page[] | null>(null);

  const handleExecute = async () => {
    const pageUrls = urlsText
      .split(/\n/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
    if (pageUrls.length === 0) return;
    try {
      const data = await onExecute("pages-scrape", {
        pageUrls,
        ...(proxyCountry ? { proxyCountry } : {}),
        cacheMedia,
      });
      setPages(data.output?.pages ?? []);
    } catch {}
  };

  return (
    <div className="flex h-full">
      <div className="w-80 shrink-0 border-r border-border/40 flex flex-col">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Pages Scraper</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Look up follower stats and bio for one or more public Facebook pages.
          </p>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <ActorInfoCard actor={ACTORS["apify/facebook-pages-scraper"]} />
          <div className="space-y-2">
            <Label htmlFor="urls">
              Page URLs<span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="urls"
              placeholder={"https://www.facebook.com/nasa\nhttps://www.facebook.com/natgeo"}
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
              <span className="font-medium">Cache profile + cover</span>
              <p className="text-muted-foreground mt-0.5">Recommended on.</p>
            </span>
          </label>
        </div>
        <div className="p-6 border-t border-border/40">
          <Button onClick={handleExecute} disabled={isExecuting || !urlsText.trim()} className="w-full">
            {isExecuting ? "Scraping..." : "Get Pages"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          {pages === null ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <Users className="w-10 h-10 opacity-25" />
              <p className="font-medium text-sm">Page data will appear here</p>
            </div>
          ) : pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <p className="text-sm">No pages found.</p>
            </div>
          ) : (
            <div className="space-y-4 p-6">
              {pages.map((p, i) => (
                <PageCard key={p.pageId ?? p.id ?? i} page={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PageCard({ page: p }: { page: Page }) {
  return (
    <div className="rounded-lg border border-border/40 bg-card overflow-hidden">
      {p.coverPhotoUrl && (
        <div className="aspect-[6/1] w-full">
          <MediaThumbnail
            templateName={TEMPLATE_NAME}
            cachedRelPath={p.mediaCache?.cover ?? null}
            liveUrl={p.coverPhotoUrl}
            aspect="16:9"
            alt={p.name ?? ""}
          />
        </div>
      )}
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-border/40">
            <MediaThumbnail
              templateName={TEMPLATE_NAME}
              cachedRelPath={p.mediaCache?.avatar ?? null}
              liveUrl={p.profilePictureUrl ?? ""}
              aspect="square"
              alt={p.name ?? ""}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-semibold text-sm truncate">
                {p.pageUrl ? (
                  <a href={p.pageUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {p.name ?? "—"}
                  </a>
                ) : (
                  p.name ?? "—"
                )}
              </h3>
              {p.verified && <span className="text-blue-500 text-xs" title="Verified">✓</span>}
              {p.category && (
                <Badge variant="outline" className="text-[10px]">{p.category}</Badge>
              )}
            </div>
            {p.address && (
              <p className="text-[11px] text-muted-foreground mt-0.5">{p.address}</p>
            )}
            {p.creationDate && (
              <p className="text-[11px] text-muted-foreground mt-0.5">Joined {p.creationDate}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <Stat value={fmt(p.followers)} label="Followers" />
          <Stat value={fmt(p.likes)} label="Likes" />
        </div>

        {p.about && (
          <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-4">{p.about}</p>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {p.phone && <span>📞 {p.phone}</span>}
          {p.email && <span>✉ {p.email}</span>}
          {p.priceRange && <span>{p.priceRange}</span>}
        </div>

        {(p.websites?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-2">
            {p.websites!.map((url, i) => {
              let host = url;
              try { host = new URL(url).hostname; } catch {}
              return (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  {host}
                </a>
              );
            })}
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
