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
import { FileText } from "lucide-react";
import type { RunHistoryItem } from "../hooks/useApifyMeta.js";

interface Post {
  postId: string;
  text: string;
  time: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  url: string;
  mediaType: string;
}

export interface PostsScrapeViewProps {
  onExecute: (operation: string, input: unknown) => Promise<unknown>;
  isExecuting: boolean;
  runs: RunHistoryItem[];
}

export function PostsScrapeView({ onExecute, isExecuting }: PostsScrapeViewProps) {
  const [pageUrl, setPageUrl] = useState("");
  const [postsLimit, setPostsLimit] = useState(20);
  const [posts, setPosts] = useState<Post[] | null>(null);

  const handleExecute = async () => {
    const u = pageUrl.trim();
    if (!u) return;
    try {
      const data: any = await onExecute("posts-scrape", { pageUrl: u, postsLimit });
      setPosts(data.output?.posts ?? []);
    } catch {}
  };

  return (
    <div className="flex h-full">
      <div className="w-80 shrink-0 border-r border-border/40 flex flex-col">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Posts Scraper</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Pull recent posts from a public Facebook page, with engagement counts.
          </p>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="pageUrl">
              Page URL<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="pageUrl"
              placeholder="https://www.facebook.com/nasa"
              value={pageUrl}
              onChange={(e) => setPageUrl(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postsLimit">Number of posts</Label>
            <Input
              id="postsLimit"
              type="number"
              min={1}
              max={50}
              value={postsLimit}
              onChange={(e) => setPostsLimit(Math.min(50, Math.max(1, Number(e.target.value) || 20)))}
            />
            <p className="text-xs text-muted-foreground">Max 50 per call.</p>
          </div>
        </div>
        <div className="p-6 border-t border-border/40">
          <Button onClick={handleExecute} disabled={isExecuting || !pageUrl.trim()} className="w-full">
            {isExecuting ? "Scraping..." : "Get Posts"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Results</h2>
        </div>
        <div className="flex-1 overflow-auto">
          {posts === null ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <FileText className="w-10 h-10 opacity-25" />
              <p className="font-medium text-sm">Posts will appear here</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <p className="text-sm">No posts found for that page.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Text</TableHead>
                  <TableHead className="text-right">Likes</TableHead>
                  <TableHead className="text-right">Comments</TableHead>
                  <TableHead className="text-right">Shares</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((p, i) => (
                  <TableRow key={p.postId || i}>
                    <TableCell className="max-w-md text-xs line-clamp-2">{p.text || "—"}</TableCell>
                    <TableCell className="text-right">{p.likesCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-right">{p.commentsCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-right">{p.sharesCount?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {p.time ? new Date(p.time).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      {p.url ? (
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">
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
