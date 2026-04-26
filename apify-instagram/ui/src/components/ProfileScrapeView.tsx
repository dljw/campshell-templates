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
import { ExternalLink, User } from "lucide-react";
import type { RunHistoryItem } from "../hooks/useApifyInstagram.js";
import { ACTORS } from "../lib/actors.js";
import { ActorInfoCard } from "./ActorInfoCard.js";
import { PROXY_COUNTRIES } from "../lib/options.js";
import { MediaThumbnail } from "./MediaThumbnail.js";

const TEMPLATE_NAME = "apify-instagram";

interface LatestPost {
  shortCode: string;
  displayUrl: string;
  type: string;
  likesCount: number | null;
  commentsCount: number | null;
}

interface Profile {
  username: string;
  fullName?: string;
  followersCount?: number | null;
  followingCount?: number | null;
  postsCount?: number | null;
  biography?: string;
  isVerified?: boolean;
  profilePicUrl?: string;
  externalUrl?: string;
  businessCategory?: string;
  isBusinessAccount?: boolean;
  latestPosts?: LatestPost[];
  mediaCache?: Record<string, string | null> | null;
}

export interface ProfileScrapeViewProps {
  onExecute: (operation: string, input: unknown) => Promise<any>;
  isExecuting: boolean;
  runs: RunHistoryItem[];
}

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString();
}

export function ProfileScrapeView({ onExecute, isExecuting }: ProfileScrapeViewProps) {
  const [usernamesText, setUsernamesText] = useState("");
  const [proxyCountry, setProxyCountry] = useState("");
  const [cacheMedia, setCacheMedia] = useState(true);
  const [profiles, setProfiles] = useState<Profile[] | null>(null);

  const handleExecute = async () => {
    const usernames = usernamesText
      .split(/[\n,]/)
      .map((u) => u.trim().replace(/^@/, ""))
      .filter((u) => u.length > 0);
    if (usernames.length === 0) return;

    try {
      const data = await onExecute("profile-scrape", {
        usernames,
        ...(proxyCountry ? { proxyCountry } : {}),
        cacheMedia,
      });
      setProfiles(data.output?.profiles ?? []);
    } catch {
      // toast handled
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-80 shrink-0 border-r border-border/40 flex flex-col">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Profile Scraper</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Look up follower stats and bio for one or more public Instagram accounts.
          </p>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <ActorInfoCard actor={ACTORS["apify/instagram-scraper"]} />
          <div className="space-y-2">
            <Label htmlFor="usernames">
              Usernames<span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="usernames"
              placeholder={"nasa\nnatgeo\nnike"}
              value={usernamesText}
              onChange={(e) => setUsernamesText(e.target.value)}
              rows={6}
              className="resize-none text-sm font-mono"
            />
            <p className="text-xs text-muted-foreground">
              One per line or comma-separated. Max 50 per call. Skip the @.
            </p>
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
            <p className="text-xs text-muted-foreground">Use when scraping is geo-sensitive.</p>
          </div>
          <label className="flex items-start gap-2 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={cacheMedia}
              onChange={(e) => setCacheMedia(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium">Cache avatars + thumbnails</span>
              <p className="text-muted-foreground mt-0.5">
                Recommended on — avatars are tiny and Instagram CDN URLs expire after a few hours.
              </p>
            </span>
          </label>
        </div>
        <div className="p-6 border-t border-border/40">
          <Button
            onClick={handleExecute}
            disabled={isExecuting || !usernamesText.trim()}
            className="w-full"
          >
            {isExecuting ? "Scraping..." : "Get Profiles"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          {profiles === null ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <User className="w-10 h-10 opacity-25" />
              <p className="font-medium text-sm">Profile data will appear here</p>
              <p className="text-xs max-w-xs">
                Enter usernames on the left, then click <span className="font-medium text-foreground">Get Profiles</span>.
              </p>
            </div>
          ) : profiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <p className="text-sm">No profiles found.</p>
              <p className="text-xs">Check the usernames are spelled correctly and the accounts are public.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6">
              {profiles.map((p) => (
                <ProfileCard key={p.username} profile={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileCard({ profile: p }: { profile: Profile }) {
  return (
    <div className="rounded-lg border border-border/40 bg-card p-5 space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden shrink-0">
          <MediaThumbnail
            templateName={TEMPLATE_NAME}
            cachedRelPath={p.mediaCache?.avatar ?? null}
            liveUrl={p.profilePicUrl ?? ""}
            aspect="square"
            alt={p.username}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-sm truncate">@{p.username}</h3>
            {p.isVerified && (
              <span className="text-blue-500 text-xs" title="Verified">✓</span>
            )}
            {p.isBusinessAccount && (
              <Badge variant="secondary" className="text-[10px]">Business</Badge>
            )}
          </div>
          {p.fullName && <p className="text-xs text-muted-foreground truncate">{p.fullName}</p>}
          {p.businessCategory && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{p.businessCategory}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat value={fmt(p.followersCount)} label="Followers" />
        <Stat value={fmt(p.followingCount)} label="Following" />
        <Stat value={fmt(p.postsCount)} label="Posts" />
      </div>

      {p.biography && (
        <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-4">
          {p.biography}
        </p>
      )}

      {p.externalUrl && (
        <a
          href={p.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline truncate max-w-full"
        >
          <ExternalLink className="w-3 h-3 shrink-0" />
          <span className="truncate">{p.externalUrl.replace(/^https?:\/\//, "")}</span>
        </a>
      )}

      {(p.latestPosts?.length ?? 0) > 0 && (
        <div className="grid grid-cols-6 gap-1">
          {p.latestPosts!.slice(0, 6).map((post, i) => (
            <a
              key={post.shortCode || i}
              href={post.shortCode ? `https://www.instagram.com/p/${post.shortCode}/` : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded overflow-hidden"
            >
              <MediaThumbnail
                templateName={TEMPLATE_NAME}
                cachedRelPath={p.mediaCache?.[`latest-${i}-thumb`] ?? null}
                liveUrl={post.displayUrl}
                aspect="square"
              />
            </a>
          ))}
        </div>
      )}
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
