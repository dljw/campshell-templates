import { useState } from "react";
import type { RunHistoryItem } from "../hooks/useDataForSeo.js";
import {
  Button,
  Input,
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
} from "@campshell/ui-components";
import { Globe } from "lucide-react";
import { COUNTRY_OPTIONS, LANGUAGE_OPTIONS } from "../constants/geo.js";

const LIMIT_OPTIONS = [
  { label: "Top 50 keywords", value: 50 },
  { label: "Top 100 keywords", value: 100 },
  { label: "Top 200 keywords", value: 200 },
  { label: "Top 500 keywords", value: 500 },
];

export interface RankedKeywordsViewProps {
  onExecute: (operation: string, input: unknown) => Promise<unknown>;
  isExecuting: boolean;
  runs: RunHistoryItem[];
}

function extractItems(rawResponse: any): any[] {
  try {
    const task = rawResponse?.tasks?.[0];
    const result = task?.result?.[0];
    return result?.items ?? [];
  } catch {
    return [];
  }
}

export function RankedKeywordsView({ onExecute, isExecuting, runs }: RankedKeywordsViewProps) {
  const [target, setTarget] = useState("");
  const [locationCode, setLocationCode] = useState(2840);
  const [languageCode, setLanguageCode] = useState("en");
  const [limit, setLimit] = useState(100);
  const [items, setItems] = useState<any[] | null>(null);
  const [meta, setMeta] = useState<{ cost?: number; totalCount?: number } | null>(null);

  const handleExecute = async () => {
    if (!target.trim()) return;
    try {
      const data: any = await onExecute("ranked-keywords", {
        target: target.trim(),
        locationCode,
        languageCode,
        limit,
      });
      const raw = data?.output?.results?.[0];
      setItems(extractItems(raw));
      setMeta({
        cost: raw?.cost,
        totalCount: raw?.tasks?.[0]?.result?.[0]?.total_count,
      });
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="flex h-full gap-0">
      {/* Left panel */}
      <div className="w-80 shrink-0 border-r border-border/40 flex flex-col">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Ranked Keywords</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Discover which keywords a domain or URL ranks for in Google search.
          </p>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="target">
              Domain or URL
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="target"
              placeholder="example.com"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Domain without https:// or www, or full URL with protocol
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select value={String(locationCode)} onValueChange={(v) => setLocationCode(Number(v))}>
              <SelectTrigger id="country">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={languageCode} onValueChange={setLanguageCode}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit">Result Limit</Label>
            <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
              <SelectTrigger id="limit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="p-6 border-t border-border/40">
          <Button
            onClick={handleExecute}
            disabled={isExecuting || !target.trim()}
            className="w-full"
          >
            {isExecuting ? "Fetching..." : "Get Ranked Keywords"}
          </Button>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border/40 flex items-center justify-between">
          <h2 className="font-semibold text-sm">Results</h2>
          {meta && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {meta.totalCount != null && <span>{meta.totalCount.toLocaleString()} total keywords</span>}
              {meta.cost != null && <span>Cost: ${meta.cost.toFixed(4)}</span>}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-auto">
          {items === null ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <Globe className="w-10 h-10 opacity-25" />
              <p className="font-medium text-sm">Your results will appear here</p>
              <p className="text-xs max-w-xs leading-relaxed">
                Enter a domain on the left and click{" "}
                <span className="font-medium text-foreground">Get Ranked Keywords</span>.
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <p className="text-sm">No ranked keywords found for this domain.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead className="text-right">Rank</TableHead>
                  <TableHead className="text-right">Rank Abs.</TableHead>
                  <TableHead className="text-right">Search Volume</TableHead>
                  <TableHead className="text-right">ETV</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item: any, i: number) => {
                  const kd = item.keyword_data ?? {};
                  const kInfo = kd.keyword_info ?? {};
                  const serpInfo = item.ranked_serp_element?.serp_item ?? {};
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{item.keyword_data?.keyword ?? item.keyword ?? "—"}</TableCell>
                      <TableCell className="text-right">{serpInfo.rank_group ?? "—"}</TableCell>
                      <TableCell className="text-right">{serpInfo.rank_absolute ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        {kInfo.search_volume != null ? kInfo.search_volume.toLocaleString() : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {serpInfo.etv != null ? Number(serpInfo.etv).toFixed(0) : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {serpInfo.type ?? item.type ?? "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
