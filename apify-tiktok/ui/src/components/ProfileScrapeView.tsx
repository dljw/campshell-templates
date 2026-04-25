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
import { User } from "lucide-react";
import type { RunHistoryItem } from "../hooks/useApifyTikTok.js";

interface Profile {
  username: string;
  nickname: string;
  followerCount: number;
  followingCount: number;
  videoCount: number;
  heartCount: number;
  bio: string;
  verified: boolean;
  avatarUrl: string;
}

export interface ProfileScrapeViewProps {
  onExecute: (operation: string, input: unknown) => Promise<unknown>;
  isExecuting: boolean;
  runs: RunHistoryItem[];
}

export function ProfileScrapeView({ onExecute, isExecuting }: ProfileScrapeViewProps) {
  const [usernamesText, setUsernamesText] = useState("");
  const [profiles, setProfiles] = useState<Profile[] | null>(null);

  const handleExecute = async () => {
    const usernames = usernamesText
      .split(/[\n,]/)
      .map((u) => u.trim().replace(/^@/, ""))
      .filter((u) => u.length > 0);
    if (usernames.length === 0) return;

    try {
      const data: any = await onExecute("profile-scrape", { usernames });
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
            Look up follower stats for one or more public TikTok accounts.
          </p>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
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
              One per line or comma-separated. Max 10 per call. Skip the @.
            </p>
          </div>
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
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Results</h2>
        </div>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Nickname</TableHead>
                  <TableHead className="text-right">Followers</TableHead>
                  <TableHead className="text-right">Following</TableHead>
                  <TableHead className="text-right">Videos</TableHead>
                  <TableHead className="text-right">Hearts</TableHead>
                  <TableHead>Bio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((p) => (
                  <TableRow key={p.username}>
                    <TableCell className="font-medium">
                      @{p.username}
                      {p.verified && <span className="ml-1 text-blue-500" title="Verified">✓</span>}
                    </TableCell>
                    <TableCell>{p.nickname || "—"}</TableCell>
                    <TableCell className="text-right">{p.followerCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-right">{p.followingCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-right">{p.videoCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-right">{p.heartCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="max-w-md text-xs text-muted-foreground line-clamp-2">
                      {p.bio || "—"}
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
