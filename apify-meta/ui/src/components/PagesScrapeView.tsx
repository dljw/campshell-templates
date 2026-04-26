import { useState } from "react";
import {
  Button,
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
  Textarea,
} from "@campshell/ui-components";
import { Users } from "lucide-react";
import type { RunHistoryItem } from "../hooks/useApifyMeta.js";
import { ACTORS } from "../lib/actors.js";
import { ActorInfoCard } from "./ActorInfoCard.js";
import { PROXY_COUNTRIES } from "../lib/options.js";

interface Page {
  pageId: string;
  name: string;
  followers: number;
  likes: number;
  category: string;
  about: string;
  websites: string[];
  profilePictureUrl: string;
}

export interface PagesScrapeViewProps {
  onExecute: (operation: string, input: unknown) => Promise<unknown>;
  isExecuting: boolean;
  runs: RunHistoryItem[];
}

export function PagesScrapeView({ onExecute, isExecuting }: PagesScrapeViewProps) {
  const [urlsText, setUrlsText] = useState("");
  const [proxyCountry, setProxyCountry] = useState("");
  const [pages, setPages] = useState<Page[] | null>(null);

  const handleExecute = async () => {
    const pageUrls = urlsText
      .split(/\n/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
    if (pageUrls.length === 0) return;
    try {
      const data: any = await onExecute("pages-scrape", {
        pageUrls,
        ...(proxyCountry ? { proxyCountry } : {}),
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
        </div>
        <div className="p-6 border-t border-border/40">
          <Button onClick={handleExecute} disabled={isExecuting || !urlsText.trim()} className="w-full">
            {isExecuting ? "Scraping..." : "Get Pages"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Results</h2>
        </div>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Followers</TableHead>
                  <TableHead className="text-right">Likes</TableHead>
                  <TableHead>About</TableHead>
                  <TableHead>Website</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((p, i) => (
                  <TableRow key={p.pageId || i}>
                    <TableCell className="font-medium">{p.name || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.category || "—"}</TableCell>
                    <TableCell className="text-right">{p.followers?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-right">{p.likes?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="max-w-md text-xs text-muted-foreground line-clamp-2">
                      {p.about || "—"}
                    </TableCell>
                    <TableCell>
                      {p.websites?.[0] ? (
                        <a href={p.websites[0]} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">
                          {new URL(p.websites[0]).hostname}
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
