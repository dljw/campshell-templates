import { useState, useMemo } from "react";
import type { RunHistoryItem } from "../hooks/useDataForSeo.js";
import {
  Button,
  Card,
  CardContent,
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
import { Search, ChevronUp } from "lucide-react";
import { COUNTRY_OPTIONS } from "../constants/geo.js";

const DEPTH_OPTIONS = [
  { label: "Top 10 results", value: 10 },
  { label: "Top 20 results", value: 20 },
  { label: "Top 50 results", value: 50 },
  { label: "Top 100 results", value: 100 },
];

export interface SerpAnalysisViewProps {
  onExecute: (operation: string, input: unknown) => Promise<unknown>;
  isExecuting: boolean;
  runs: RunHistoryItem[];
}

export function SerpAnalysisView({ onExecute, isExecuting, runs }: SerpAnalysisViewProps) {
  const [keyword, setKeyword] = useState("");
  const [locationCode, setLocationCode] = useState(2840);
  const [depth, setDepth] = useState(10);
  const [results, setResults] = useState<any[] | null>(null);
  const [searchedKeyword, setSearchedKeyword] = useState("");
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleExecute = async () => {
    if (!keyword.trim()) return;

    try {
      const data: any = await onExecute("serp-analysis", {
        keyword: keyword.trim(),
        locationCode,
        depth,
      });
      setSearchedKeyword(keyword.trim());
      setCurrentRunId(data.runId);
      setResults(data.output?.results || []);
    } catch (err) {
      // Error is handled by hook
    }
  };

  const historyRows = useMemo(() =>
    runs
      .filter((r) => r.operation === "serp-analysis" && r.status === "success" && r.runId !== currentRunId)
      .flatMap((r) =>
        ((r.output as any)?.results ?? []).map((item: any) => ({
          ...item,
          searchedAt: r.startedAt,
          searchedKeyword: (r.input as any)?.keyword ?? "",
        }))
      ),
    [runs, currentRunId]
  );

  return (
    <div className="flex h-full gap-0">
      {/* Left panel — inputs */}
      <div className="w-80 shrink-0 border-r border-border/40 flex flex-col">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">SERP Analysis</h2>
          <p className="text-xs text-muted-foreground mt-1">
            See which websites rank on Google for any keyword.
          </p>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="keyword">
              Keyword
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="keyword"
              placeholder="e.g. best camping tents"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleExecute()}
            />
            <p className="text-xs text-muted-foreground">
              The search term you want to analyse
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select
              value={String(locationCode)}
              onValueChange={(v) => setLocationCode(Number(v))}
            >
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
            <Label htmlFor="depth">Number of results</Label>
            <Select
              value={String(depth)}
              onValueChange={(v) => setDepth(Number(v))}
            >
              <SelectTrigger id="depth">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPTH_OPTIONS.map((opt) => (
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
            disabled={isExecuting || !keyword.trim()}
            className="w-full"
          >
            {isExecuting ? "Searching..." : "Analyse SERP"}
          </Button>
        </div>
      </div>

      {/* Right panel — results */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">
            {searchedKeyword ? `Top results for "${searchedKeyword}"` : "Results"}
          </h2>
        </div>
        <div className="flex-1 overflow-auto">
          {results === null ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <Search className="w-10 h-10 opacity-25" />
              <p className="font-medium text-sm">Your results will appear here</p>
              <p className="text-xs max-w-xs leading-relaxed">
                Type a keyword on the left, choose a country, then click{" "}
                <span className="font-medium text-foreground">Analyse SERP</span> to see
                who's ranking on Google.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <p className="text-sm">No ranking pages found.</p>
              <p className="text-xs">Try a different keyword or country.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14 text-center">Rank</TableHead>
                  <TableHead className="w-40">Website</TableHead>
                  <TableHead>Page</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-bold text-center text-muted-foreground">
                      #{row.rank_absolute ?? row.position ?? i + 1}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{row.domain}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm leading-snug">{row.title}</div>
                        <a
                          href={row.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline break-all"
                        >
                          {row.breadcrumb ?? row.url}
                        </a>
                        {row.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {row.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {historyRows.length > 0 && (
          <div className="border-t border-border/40 bg-background flex flex-col mt-auto">
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors w-full text-left"
            >
              <div className="flex items-center gap-2">
                <ChevronUp className={`w-4 h-4 transition-transform ${isHistoryOpen ? "rotate-180" : ""}`} />
                <h3 className="font-semibold text-sm">Search History</h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {historyRows.length} result{historyRows.length !== 1 ? "s" : ""}
              </span>
            </button>
            {isHistoryOpen && (
              <div className="overflow-auto max-h-64 border-t border-border/40">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-14 text-center">Rank</TableHead>
                      <TableHead>Searched At</TableHead>
                      <TableHead>Keyword</TableHead>
                      <TableHead className="w-40">Website</TableHead>
                      <TableHead>Title</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyRows.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-bold text-center text-muted-foreground">
                          #{row.rank_absolute ?? row.position ?? i + 1}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(row.searchedAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs font-medium">{row.searchedKeyword}</TableCell>
                        <TableCell className="text-sm font-medium">{row.domain}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm leading-snug">{row.title}</div>
                            <a
                              href={row.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline break-all"
                            >
                              {row.breadcrumb ?? row.url}
                            </a>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
