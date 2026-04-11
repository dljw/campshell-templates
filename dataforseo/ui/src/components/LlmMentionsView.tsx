import { useState } from "react";
import type { RunHistoryItem } from "../hooks/useDataForSeo.js";
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
} from "@campshell/ui-components";
import { MessageSquare, Plus, X, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { COUNTRY_OPTIONS, LANGUAGE_OPTIONS } from "../constants/geo.js";

export interface LlmMentionsViewProps {
  onExecute: (operation: string, input: unknown) => Promise<unknown>;
  isExecuting: boolean;
  runs: RunHistoryItem[];
}

interface Target {
  id: string;
  type: "domain" | "keyword";
  value: string;
  searchFilter: "include" | "exclude";
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

export function LlmMentionsView({ onExecute, isExecuting, runs }: LlmMentionsViewProps) {
  const [targets, setTargets] = useState<Target[]>([
    { id: "1", type: "domain", value: "", searchFilter: "include" },
  ]);
  const [platform, setPlatform] = useState<"chat_gpt" | "google">("google");
  const [locationCode, setLocationCode] = useState(2840);
  const [languageCode, setLanguageCode] = useState("en");
  const [limit, setLimit] = useState(100);
  const [items, setItems] = useState<any[] | null>(null);
  const [meta, setMeta] = useState<{ cost?: number; totalCount?: number } | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addTarget = () => {
    if (targets.length >= 10) return;
    setTargets((prev) => [
      ...prev,
      { id: String(Date.now()), type: "keyword", value: "", searchFilter: "include" },
    ]);
  };

  const removeTarget = (id: string) => {
    if (targets.length <= 1) return;
    setTargets((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTarget = (id: string, updates: Partial<Target>) => {
    setTargets((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const handleExecute = async () => {
    const validTargets = targets.filter((t) => t.value.trim().length > 0);
    if (validTargets.length === 0) return;

    setError(null);
    try {
      const data: any = await onExecute("llm-mentions", {
        targets: validTargets.map((t) => ({
          type: t.type,
          value: t.value.trim(),
          searchFilter: t.searchFilter,
        })),
        platform,
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
    } catch (err) {
      setItems(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const isValid = targets.some((t) => t.value.trim().length > 0);

  return (
    <div className="flex h-full gap-0">
      {/* Left panel */}
      <div className="w-80 shrink-0 border-r border-border/40 flex flex-col">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">LLM Mentions</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Track how brands and keywords are mentioned in AI platforms like ChatGPT and Google AI.
          </p>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          {/* Target builder */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Targets</Label>
              <span className="text-xs text-muted-foreground">{targets.length}/10</span>
            </div>
            <div className="space-y-2">
              {targets.map((t) => (
                <div key={t.id} className="rounded-md border border-border/40 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Select value={t.type} onValueChange={(v) => updateTarget(t.id, { type: v as "domain" | "keyword" })}>
                      <SelectTrigger className="h-7 text-xs w-24 shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="domain">Domain</SelectItem>
                        <SelectItem value="keyword">Keyword</SelectItem>
                      </SelectContent>
                    </Select>
                    <input
                      className="flex-1 h-7 text-xs bg-transparent border border-border rounded-md px-2 outline-none focus:ring-1 focus:ring-ring"
                      placeholder={t.type === "domain" ? "example.com" : "your brand"}
                      value={t.value}
                      onChange={(e) => updateTarget(t.id, { value: e.target.value })}
                    />
                    {targets.length > 1 && (
                      <button
                        onClick={() => removeTarget(t.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <Select value={t.searchFilter} onValueChange={(v) => updateTarget(t.id, { searchFilter: v as "include" | "exclude" })}>
                    <SelectTrigger className="h-7 text-xs w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="include">Include</SelectItem>
                      <SelectItem value="exclude">Exclude</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            {targets.length < 10 && (
              <button
                onClick={addTarget}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add target
              </button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">AI Platform</Label>
            <Select value={platform} onValueChange={(v) => setPlatform(v as "chat_gpt" | "google")}>
              <SelectTrigger id="platform">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google AI</SelectItem>
                <SelectItem value="chat_gpt">ChatGPT</SelectItem>
              </SelectContent>
            </Select>
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
                <SelectItem value="50">50 results</SelectItem>
                <SelectItem value="100">100 results</SelectItem>
                <SelectItem value="250">250 results</SelectItem>
                <SelectItem value="500">500 results</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="p-6 border-t border-border/40">
          <Button
            onClick={handleExecute}
            disabled={isExecuting || !isValid}
            className="w-full"
          >
            {isExecuting ? "Fetching..." : "Search Mentions"}
          </Button>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border/40 flex items-center justify-between">
          <h2 className="font-semibold text-sm">Results</h2>
          {meta && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {meta.totalCount != null && <span>{meta.totalCount.toLocaleString()} total mentions</span>}
              {meta.cost != null && <span>Cost: ${meta.cost.toFixed(4)}</span>}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-auto">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16 px-8">
              <AlertCircle className="w-10 h-10 text-destructive opacity-70" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Request failed</p>
                <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">{error}</p>
              </div>
              {error.toLowerCase().includes("access denied") && (
                <p className="text-xs text-muted-foreground max-w-sm leading-relaxed border border-border/40 rounded-md p-3 bg-muted/20">
                  The LLM Mentions API requires a separate subscription on your DataForSEO account.
                  Visit <span className="font-medium text-foreground">app.dataforseo.com → Plans & Subscriptions</span> to activate it.
                </p>
              )}
            </div>
          ) : items === null ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <MessageSquare className="w-10 h-10 opacity-25" />
              <p className="font-medium text-sm">Your results will appear here</p>
              <p className="text-xs max-w-xs leading-relaxed">
                Add your targets on the left and click{" "}
                <span className="font-medium text-foreground">Search Mentions</span>.
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <p className="text-sm">No mentions found for these targets.</p>
              <p className="text-xs">Try different targets, a different platform, or fewer filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-right">AI Search Vol.</TableHead>
                  <TableHead className="text-right">Sources</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item: any, i: number) => (
                  <>
                    <TableRow
                      key={i}
                      className="cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                    >
                      <TableCell className="font-medium max-w-[300px]">
                        <span className="line-clamp-2">{item.question ?? "—"}</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground capitalize">
                        {item.platform?.replace("_", " ") ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.model_name ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        {item.ai_search_volume != null ? item.ai_search_volume.toLocaleString() : "—"}
                      </TableCell>
                      <TableCell className="text-right">{item.sources?.length ?? 0}</TableCell>
                      <TableCell>
                        {expandedRow === i ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedRow === i && (
                      <TableRow key={`${i}-expanded`}>
                        <TableCell colSpan={6} className="bg-muted/20 p-4">
                          <div className="space-y-3 max-w-2xl">
                            {item.answer && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">AI Answer</p>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.answer}</p>
                              </div>
                            )}
                            {item.sources?.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Sources</p>
                                <div className="flex flex-wrap gap-2">
                                  {item.sources.map((s: any, j: number) => (
                                    <a
                                      key={j}
                                      href={s.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary underline truncate max-w-[200px]"
                                    >
                                      {s.domain ?? s.url}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
