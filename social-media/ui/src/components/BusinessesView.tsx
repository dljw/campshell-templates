import { Badge, Card, CardContent, CardHeader, CardTitle, cn } from "@campshell/ui-components";
import { Building2 } from "lucide-react";
import { useMemo } from "react";
import type { UseTemplateDataReturn } from "../hooks/useTemplateData.js";

export function BusinessesView({ data }: { data: UseTemplateDataReturn }) {
  const platformCountByBusiness = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of data.platforms) {
      if (p.active) counts.set(p.businessId, (counts.get(p.businessId) ?? 0) + 1);
    }
    return counts;
  }, [data.platforms]);

  const postCountByBusiness = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of data.posts) {
      counts.set(p.businessId, (counts.get(p.businessId) ?? 0) + 1);
    }
    return counts;
  }, [data.posts]);

  const campaignCountByBusiness = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of data.campaigns) {
      counts.set(c.businessId, (counts.get(c.businessId) ?? 0) + 1);
    }
    return counts;
  }, [data.campaigns]);

  if (data.businesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
          <Building2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-medium">No businesses yet</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            Add your first business or brand to get started. Each business gets its own content calendar and platform accounts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
        {data.businesses.map((business) => (
          <Card key={business.id} className="hover:bg-surface-raised transition-colors" data-campshell-entity={`social-media/business/businesses/${business.id}.json`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{business.name}</CardTitle>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs font-normal",
                    business.active ? "bg-[var(--success-muted)] text-success" : "bg-muted text-muted-foreground",
                  )}
                >
                  {business.active ? "active" : "inactive"}
                </Badge>
              </div>
              {business.industry && (
                <p className="text-xs text-muted-foreground">{business.industry}</p>
              )}
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {business.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{business.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{platformCountByBusiness.get(business.id) ?? 0} platforms</span>
                <span>{postCountByBusiness.get(business.id) ?? 0} posts</span>
                <span>{campaignCountByBusiness.get(business.id) ?? 0} campaigns</span>
              </div>
              {business.website && (
                <a href={business.website} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                  {business.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
