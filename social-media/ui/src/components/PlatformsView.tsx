import { Badge, cn, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Sheet, SheetContent, SheetHeader, SheetTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@campshell/ui-components";
import { Settings } from "lucide-react";
import { useMemo, useState } from "react";
import type { UseTemplateDataReturn } from "../hooks/useTemplateData.js";

const PLATFORM_EMOJI: Record<string, string> = {
  instagram: "\ud83d\udcf7",
  tiktok: "\ud83c\udfb5",
  linkedin: "\ud83d\udcbc",
  youtube: "\ud83c\udfa5",
  facebook: "\ud83d\udc4d",
  lemon8: "\ud83c\udf4b",
};

function formatNumber(n?: number): string {
  if (n == null) return "—";
  return n.toLocaleString();
}

export function PlatformsView({ data }: { data: UseTemplateDataReturn }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [businessFilter, setBusinessFilter] = useState<string>("all");
  const selected = data.platforms.find((p) => p.id === selectedId);

  const businessMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const b of data.businesses) map.set(b.id, b.name);
    return map;
  }, [data.businesses]);

  const filtered = useMemo(() => {
    if (businessFilter === "all") return data.platforms;
    return data.platforms.filter((p) => p.businessId === businessFilter);
  }, [data.platforms, businessFilter]);

  if (data.platforms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
          <Settings className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-medium">No platform accounts yet</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            Add your social media accounts for each business to configure posting schedules.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
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
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Handle</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Posts/Week</TableHead>
                <TableHead className="text-right">Followers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((platform) => (
                <TableRow
                  key={platform.id}
                  className={cn("cursor-pointer", selectedId === platform.id && "bg-muted")}
                  data-campshell-entity={`social-media/platforms/platforms/${platform.id}.json`}
                  onClick={() => setSelectedId(platform.id)}
                >
                  <TableCell className="font-medium">
                    <span className="mr-1.5">{PLATFORM_EMOJI[platform.platform] ?? ""}</span>
                    {platform.platform}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{businessMap.get(platform.businessId) ?? platform.businessId}</TableCell>
                  <TableCell className="text-muted-foreground">{platform.handle ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("text-xs font-normal", platform.active ? "bg-[var(--success-muted)] text-success" : "bg-muted text-muted-foreground")}>
                      {platform.active ? "active" : "inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{platform.postsPerWeek ?? "—"}</TableCell>
                  <TableCell className="text-right">{formatNumber(platform.followers)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selected ? `${PLATFORM_EMOJI[selected.platform] ?? ""} ${selected.platform}` : ""}</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-4 space-y-3">
              <Field label="Business" value={businessMap.get(selected.businessId) ?? selected.businessId} />
              <Field label="Handle" value={selected.handle ?? "—"} />
              <Field label="Active" value={selected.active ? "Yes" : "No"} />
              <Field label="Posts per Week" value={String(selected.postsPerWeek ?? "—")} />
              <Field label="Followers" value={formatNumber(selected.followers)} />
              {selected.bestTimes && selected.bestTimes.length > 0 && (
                <Field label="Best Times" value={selected.bestTimes.join(", ")} />
              )}
              {selected.primaryFormats && selected.primaryFormats.length > 0 && (
                <Field label="Primary Formats" value={
                  <div className="flex gap-1 flex-wrap">
                    {selected.primaryFormats.map((f) => (
                      <Badge key={f} variant="outline" className="text-xs font-normal">{f}</Badge>
                    ))}
                  </div>
                } />
              )}
              {selected.profileUrl && (
                <Field label="Profile URL" value={<a href={selected.profileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">{selected.profileUrl}</a>} />
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
