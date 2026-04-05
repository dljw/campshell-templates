import { Badge, cn, Sheet, SheetContent, SheetHeader, SheetTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@campshell/ui-components";
import { BarChart3 } from "lucide-react";
import { useMemo, useState } from "react";
import type { UseTemplateDataReturn } from "../hooks/useTemplateData.js";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatNumber(n?: number): string {
  if (n == null) return "—";
  return n.toLocaleString();
}

function formatPercent(n?: number): string {
  if (n == null) return "—";
  return `${n.toFixed(1)}%`;
}

function engagementColor(rate?: number): string {
  if (rate == null) return "";
  if (rate >= 5) return "text-success";
  if (rate >= 3) return "text-info";
  if (rate >= 1) return "text-warning";
  return "text-destructive";
}

export function AnalyticsView({ data }: { data: UseTemplateDataReturn }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = data.analytics.find((a) => a.id === selectedId);

  const postMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of data.posts) map.set(p.id, p.title);
    return map;
  }, [data.posts]);

  const sorted = useMemo(() => {
    return [...data.analytics].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  }, [data.analytics]);

  if (data.analytics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
          <BarChart3 className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-medium">No analytics yet</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            Log performance metrics after publishing a post. Track impressions, engagement, and growth.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Post</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Impressions</TableHead>
              <TableHead className="text-right">Reach</TableHead>
              <TableHead className="text-right">Likes</TableHead>
              <TableHead className="text-right">Comments</TableHead>
              <TableHead className="text-right">Saves</TableHead>
              <TableHead className="text-right">Engagement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((record) => (
              <TableRow
                key={record.id}
                className={cn("cursor-pointer", selectedId === record.id && "bg-muted")}
                onClick={() => setSelectedId(record.id)}
              >
                <TableCell className="font-medium">{postMap.get(record.postId) ?? record.postId}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(record.recordedAt)}</TableCell>
                <TableCell className="text-right">{formatNumber(record.impressions)}</TableCell>
                <TableCell className="text-right">{formatNumber(record.reach)}</TableCell>
                <TableCell className="text-right">{formatNumber(record.likes)}</TableCell>
                <TableCell className="text-right">{formatNumber(record.comments)}</TableCell>
                <TableCell className="text-right">{formatNumber(record.saves)}</TableCell>
                <TableCell className="text-right">
                  <span className={engagementColor(record.engagementRate)}>{formatPercent(record.engagementRate)}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selected ? postMap.get(selected.postId) ?? selected.postId : ""}</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-4 space-y-3">
              <Field label="Recorded" value={formatDate(selected.recordedAt)} />
              <Field label="Impressions" value={formatNumber(selected.impressions)} />
              <Field label="Reach" value={formatNumber(selected.reach)} />
              <Field label="Likes" value={formatNumber(selected.likes)} />
              <Field label="Comments" value={formatNumber(selected.comments)} />
              <Field label="Shares" value={formatNumber(selected.shares)} />
              <Field label="Saves" value={formatNumber(selected.saves)} />
              <Field label="Clicks" value={formatNumber(selected.clicks)} />
              <Field label="Engagement Rate" value={<span className={engagementColor(selected.engagementRate)}>{formatPercent(selected.engagementRate)}</span>} />
              {selected.videoViews != null && <Field label="Video Views" value={formatNumber(selected.videoViews)} />}
              {selected.videoCompletionRate != null && <Field label="Completion Rate" value={formatPercent(selected.videoCompletionRate)} />}
              {selected.followerChange != null && (
                <Field label="Follower Change" value={
                  <span className={selected.followerChange > 0 ? "text-success" : selected.followerChange < 0 ? "text-destructive" : ""}>
                    {selected.followerChange > 0 ? "+" : ""}{selected.followerChange}
                  </span>
                } />
              )}
              {selected.notes && <Field label="Notes" value={selected.notes} />}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm">{value}</div>
    </div>
  );
}
