import { Badge, Card, CardContent, CardHeader, CardTitle, cn, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@campshell/ui-components";
import { Target } from "lucide-react";
import { useMemo, useState } from "react";
import type { UseTemplateDataReturn } from "../hooks/useTemplateData.js";

const STATUS_COLORS: Record<string, string> = {
  planning: "bg-muted text-muted-foreground",
  active: "bg-[var(--info-muted)] text-info",
  completed: "bg-[var(--success-muted)] text-success",
  paused: "bg-[var(--warning-muted)] text-warning",
};

const TIER_COLORS: Record<string, string> = {
  hero: "bg-[var(--destructive-muted)] text-destructive",
  hub: "bg-[var(--warning-muted)] text-warning",
  hygiene: "bg-muted text-muted-foreground",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function CampaignsView({ data }: { data: UseTemplateDataReturn }) {
  const [businessFilter, setBusinessFilter] = useState<string>("all");

  const businessMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const b of data.businesses) map.set(b.id, b.name);
    return map;
  }, [data.businesses]);

  const postCountByCampaign = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of data.posts) {
      if (p.campaignId) counts.set(p.campaignId, (counts.get(p.campaignId) ?? 0) + 1);
    }
    return counts;
  }, [data.posts]);

  const filtered = useMemo(() => {
    if (businessFilter === "all") return data.campaigns;
    return data.campaigns.filter((c) => c.businessId === businessFilter);
  }, [data.campaigns, businessFilter]);

  if (data.campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
          <Target className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-medium">No campaigns yet</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            Create a campaign to coordinate content around a theme, launch, or series.
          </p>
        </div>
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
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
          {filtered.map((campaign) => (
            <Card key={campaign.id} className="hover:bg-surface-raised transition-colors" data-campshell-entity={`social-media/campaigns/campaigns/${campaign.id}.json`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{campaign.name}</CardTitle>
                  <Badge variant="secondary" className={cn("text-xs font-normal", STATUS_COLORS[campaign.status])}>
                    {campaign.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{businessMap.get(campaign.businessId) ?? campaign.businessId}</p>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                {campaign.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{campaign.description}</p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  {campaign.tier && (
                    <Badge variant="secondary" className={cn("text-[10px] font-normal", TIER_COLORS[campaign.tier])}>
                      {campaign.tier}
                    </Badge>
                  )}
                  {campaign.goal && (
                    <Badge variant="outline" className="text-[10px] font-normal">{campaign.goal}</Badge>
                  )}
                  {(postCountByCampaign.get(campaign.id) ?? 0) > 0 && (
                    <span className="text-[10px] text-muted-foreground">{postCountByCampaign.get(campaign.id)} posts</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {campaign.startDate && <span>{formatDate(campaign.startDate)}</span>}
                  {campaign.startDate && campaign.endDate && <span>—</span>}
                  {campaign.endDate && <span>{formatDate(campaign.endDate)}</span>}
                </div>
                {campaign.platforms && campaign.platforms.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {campaign.platforms.map((p) => (
                      <Badge key={p} variant="outline" className="text-[10px] font-normal">{p}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
