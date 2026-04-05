import { Badge, cn, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Sheet, SheetContent, SheetHeader, SheetTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@campshell/ui-components";
import { Lightbulb } from "lucide-react";
import { useMemo, useState } from "react";
import type { UseTemplateDataReturn } from "../hooks/useTemplateData.js";
import type { Idea } from "../types.js";

const STATUS_COLORS: Record<string, string> = {
  captured: "bg-muted text-muted-foreground",
  evaluating: "bg-[var(--warning-muted)] text-warning",
  approved: "bg-[var(--success-muted)] text-success",
  rejected: "bg-[var(--destructive-muted)] text-destructive",
  converted: "bg-[var(--info-muted)] text-info",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-[var(--destructive-muted)] text-destructive",
  medium: "bg-[var(--warning-muted)] text-warning",
  low: "bg-muted text-muted-foreground",
};

export function IdeasView({ data }: { data: UseTemplateDataReturn }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [businessFilter, setBusinessFilter] = useState<string>("all");

  const selected = data.ideas.find((i) => i.id === selectedId);

  const pillarMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of data.pillars) map.set(p.id, `${p.emoji ?? ""} ${p.name}`.trim());
    return map;
  }, [data.pillars]);

  const businessMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const b of data.businesses) map.set(b.id, b.name);
    return map;
  }, [data.businesses]);

  const filtered = useMemo(() => {
    let result = data.ideas;
    if (statusFilter !== "all") result = result.filter((i) => i.status === statusFilter);
    if (businessFilter !== "all") result = result.filter((i) => i.businessId === businessFilter);
    return result;
  }, [data.ideas, statusFilter, businessFilter]);

  if (data.ideas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
          <Lightbulb className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-medium">No ideas captured yet</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            Save content ideas as they come to you. Even a rough concept is worth capturing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-end gap-2 px-4 py-2 border-b border-border/40 shrink-0">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-8">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {["captured", "evaluating", "approved", "rejected", "converted"].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Pillar</TableHead>
                <TableHead>Business</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((idea) => (
                <TableRow
                  key={idea.id}
                  className={cn("cursor-pointer", selectedId === idea.id && "bg-muted")}
                  onClick={() => setSelectedId(idea.id)}
                >
                  <TableCell className="font-medium">{idea.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("text-xs font-normal", STATUS_COLORS[idea.status])}>
                      {idea.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {idea.priority && (
                      <Badge variant="secondary" className={cn("text-xs font-normal", PRIORITY_COLORS[idea.priority])}>
                        {idea.priority}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{idea.platform ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{idea.pillarId ? pillarMap.get(idea.pillarId) ?? idea.pillarId : "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{idea.businessId ? businessMap.get(idea.businessId) ?? idea.businessId : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selected?.title}</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-4 space-y-3">
              <Field label="Status" value={<Badge variant="secondary" className={cn("text-xs font-normal", STATUS_COLORS[selected.status])}>{selected.status}</Badge>} />
              {selected.priority && <Field label="Priority" value={<Badge variant="secondary" className={cn("text-xs font-normal", PRIORITY_COLORS[selected.priority])}>{selected.priority}</Badge>} />}
              {selected.platform && <Field label="Platform" value={selected.platform} />}
              {selected.format && <Field label="Format" value={selected.format} />}
              {selected.pillarId && <Field label="Pillar" value={pillarMap.get(selected.pillarId) ?? selected.pillarId} />}
              {selected.businessId && <Field label="Business" value={businessMap.get(selected.businessId) ?? selected.businessId} />}
              {selected.hook && <Field label="Hook" value={selected.hook} />}
              {selected.description && <Field label="Description" value={selected.description} />}
              {selected.source && <Field label="Source" value={selected.source} />}
              {selected.sourceUrl && <Field label="Source URL" value={<a href={selected.sourceUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">{selected.sourceUrl}</a>} />}
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
