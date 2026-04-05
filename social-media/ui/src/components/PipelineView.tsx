import { Badge, Card, CardContent, cn, ScrollArea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@campshell/ui-components";
import { useMemo, useState } from "react";
import type { UseTemplateDataReturn } from "../hooks/useTemplateData.js";
import type { Post, PostStatus } from "../types.js";

const PLATFORM_EMOJI: Record<string, string> = {
  instagram: "\ud83d\udcf7",
  tiktok: "\ud83c\udfb5",
  linkedin: "\ud83d\udcbc",
  youtube: "\ud83c\udfa5",
  facebook: "\ud83d\udc4d",
  lemon8: "\ud83c\udf4b",
};

const STATUSES: { id: PostStatus; label: string; color: string }[] = [
  { id: "idea", label: "Idea", color: "bg-muted text-muted-foreground" },
  { id: "drafting", label: "Drafting", color: "bg-[var(--info-muted)] text-info" },
  { id: "ready", label: "Ready", color: "bg-[var(--warning-muted)] text-warning" },
  { id: "scheduled", label: "Scheduled", color: "bg-[var(--info-muted)] text-info" },
  { id: "published", label: "Published", color: "bg-[var(--success-muted)] text-success" },
  { id: "archived", label: "Archived", color: "bg-muted text-muted-foreground" },
];

const TIER_COLORS: Record<string, string> = {
  hero: "bg-[var(--destructive-muted)] text-destructive",
  hub: "bg-[var(--warning-muted)] text-warning",
  hygiene: "bg-muted text-muted-foreground",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function PipelineView({ data }: { data: UseTemplateDataReturn }) {
  const [businessFilter, setBusinessFilter] = useState<string>("all");

  const filteredPosts = useMemo(() => {
    if (businessFilter === "all") return data.posts;
    return data.posts.filter((p) => p.businessId === businessFilter);
  }, [data.posts, businessFilter]);

  const pillarMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of data.pillars) map.set(p.id, `${p.emoji ?? ""} ${p.name}`.trim());
    return map;
  }, [data.pillars]);

  const campaignMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of data.campaigns) map.set(c.id, c.name);
    return map;
  }, [data.campaigns]);

  const postsByStatus = useMemo(() => {
    const grouped: Record<string, Post[]> = {};
    for (const s of STATUSES) grouped[s.id] = [];
    for (const post of filteredPosts) {
      (grouped[post.status] ??= []).push(post);
    }
    return grouped;
  }, [filteredPosts]);

  if (data.posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
        <h2 className="text-lg font-medium">No posts yet</h2>
        <p className="text-muted-foreground text-sm max-w-sm">Create your first post to see the pipeline.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-end px-4 py-2 border-b border-border/40 shrink-0">
        <Select value={businessFilter} onValueChange={setBusinessFilter}>
          <SelectTrigger className="w-44 h-8">
            <SelectValue placeholder="All businesses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All businesses</SelectItem>
            {data.businesses.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-4 flex-1 overflow-x-auto p-4">
        {STATUSES.map((stage) => {
          const items = postsByStatus[stage.id] ?? [];
          return (
            <div key={stage.id} className="flex flex-col w-64 shrink-0">
              <div className="flex items-center justify-between mb-3 px-1">
                <Badge variant="secondary" className={cn("text-xs font-normal", stage.color)}>
                  {stage.label}
                </Badge>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <ScrollArea className="flex-1">
                <div className="space-y-2 pr-2">
                  {items.map((post) => (
                    <Card key={post.id} className="hover:bg-surface-raised transition-colors">
                      <CardContent className="p-3 text-sm space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base leading-none">{PLATFORM_EMOJI[post.platform] ?? ""}</span>
                          <p className="font-medium truncate flex-1">{post.title}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          <Badge variant="outline" className="text-[10px] font-normal">{post.format}</Badge>
                          {post.contentTier && (
                            <Badge variant="secondary" className={cn("text-[10px] font-normal", TIER_COLORS[post.contentTier])}>
                              {post.contentTier}
                            </Badge>
                          )}
                        </div>
                        {post.pillarId && pillarMap.has(post.pillarId) && (
                          <p className="text-xs text-muted-foreground truncate">{pillarMap.get(post.pillarId)}</p>
                        )}
                        {post.campaignId && campaignMap.has(post.campaignId) && (
                          <p className="text-[10px] text-muted-foreground truncate">{campaignMap.get(post.campaignId)}</p>
                        )}
                        {post.scheduledAt && (
                          <p className="text-[10px] text-muted-foreground">{formatDate(post.scheduledAt)}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {items.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">Empty</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>
    </div>
  );
}
