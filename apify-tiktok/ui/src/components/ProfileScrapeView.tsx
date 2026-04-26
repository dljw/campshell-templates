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
import type { RunHistoryItem } from "../hooks/useApifyTikTok.js";
import { ACTORS } from "../lib/actors.js";
import { ActorInfoCard } from "./ActorInfoCard.js";
import { PROXY_COUNTRIES } from "../lib/options.js";
import { MediaThumbnail } from "./MediaThumbnail.js";

const TEMPLATE_NAME = "apify-tiktok";

interface Profile {
  username: string;
  nickname?: string;
  followerCount?: number | null;
  followingCount?: number | null;
  videoCount?: number | null;
  heartCount?: number | null;
  bio?: string;
  verified?: boolean;
  avatarUrl?: string;
  avatarLargerUrl?: string;
  region?: string;
  privateAccount?: boolean;
  bioLink?: string;
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
    } catch {}
  };

  return (
    <div className="flex h-full">
      <div className="w-80 shrink-0 border-r border-border/40 flex flex-col">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Profile Scraper</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Look up follower stats for one or more public TikTok accounts.
          </p>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <ActorInfoCard actor={ACTORS["clockworks/free-tiktok-scraper"]} />
          <div className="space-y-2">
            <Label htmlFor="usernames">
              Usernames<span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="usernames"
              placeholder={"zachking\nkhaby.lame\ncharlidamelio"}
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
          </div>
          <label className="flex items-start gap-2 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={cacheMedia}
              onChange={(e) => setCacheMedia(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium">Cache avatars</span>
              <p className="text-muted-foreground mt-0.5">
                Recommended on — TikTok CDN URLs expire after a few hours.
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
            </div>
          ) : profiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <p className="text-sm">No profiles found.</p>
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
            liveUrl={p.avatarLargerUrl || p.avatarUrl || ""}
            aspect="square"
            alt={p.username}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-sm truncate">@{p.username}</h3>
            {p.verified && <span className="text-blue-500 text-xs" title="Verified">✓</span>}
            {p.privateAccount && <Badge variant="secondary" className="text-[10px]">Private</Badge>}
          </div>
          {p.nickname && <p className="text-xs text-muted-foreground truncate">{p.nickname}</p>}
          {p.region && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{p.region}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <Stat value={fmt(p.followerCount)} label="Followers" />
        <Stat value={fmt(p.followingCount)} label="Following" />
        <Stat value={fmt(p.videoCount)} label="Videos" />
        <Stat value={fmt(p.heartCount)} label="Hearts" />
      </div>

      {p.bio && (
        <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-4">
          {p.bio}
        </p>
      )}

      {p.bioLink && (
        <a
          href={p.bioLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline truncate max-w-full"
        >
          <ExternalLink className="w-3 h-3 shrink-0" />
          <span className="truncate">{p.bioLink.replace(/^https?:\/\//, "")}</span>
        </a>
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
