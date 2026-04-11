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
} from "@campshell/ui-components";
import { Sparkles } from "lucide-react";
import { COUNTRY_OPTIONS, LANGUAGE_OPTIONS } from "../constants/geo.js";

export interface SerpAiSummaryViewProps {
  onExecute: (operation: string, input: unknown) => Promise<unknown>;
  isExecuting: boolean;
  runs: RunHistoryItem[];
}

function extractItems(rawResponse: any): { aiOverview: any | null; organic: any[] } {
  try {
    const task = rawResponse?.tasks?.[0];
    const result = task?.result?.[0];
    const items: any[] = result?.items ?? [];
    const aiOverview = items.find((item: any) => item.type === "ai_overview") ?? null;
    const organic = items.filter((item: any) => item.type === "organic");
    return { aiOverview, organic };
  } catch {
    return { aiOverview: null, organic: [] };
  }
}

export function SerpAiSummaryView({ onExecute, isExecuting, runs }: SerpAiSummaryViewProps) {
  const [keyword, setKeyword] = useState("");
  const [locationCode, setLocationCode] = useState(2840);
  const [languageCode, setLanguageCode] = useState("en");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [result, setResult] = useState<{ aiOverview: any | null; organic: any[] } | null>(null);
  const [meta, setMeta] = useState<{ cost?: number; searchedKeyword?: string } | null>(null);

  const handleExecute = async () => {
    if (!keyword.trim()) return;
    try {
      const data: any = await onExecute("serp-ai-summary", {
        keyword: keyword.trim(),
        locationCode,
        languageCode,
        device,
      });
      const raw = data?.output?.results?.[0];
      setResult(extractItems(raw));
      setMeta({ cost: raw?.cost, searchedKeyword: keyword.trim() });
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="flex h-full gap-0">
      {/* Left panel */}
      <div className="w-80 shrink-0 border-r border-border/40 flex flex-col">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">SERP AI Summary</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Retrieve Google SERP results with AI Overview/Summary for a keyword.
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
              placeholder="best hiking boots"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleExecute()}
            />
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
            <Label htmlFor="device">Device</Label>
            <Select value={device} onValueChange={(v) => setDevice(v as "desktop" | "mobile")}>
              <SelectTrigger id="device">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
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
            {isExecuting ? "Fetching..." : "Get AI Summary"}
          </Button>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border/40 flex items-center justify-between">
          <h2 className="font-semibold text-sm">
            {meta?.searchedKeyword ? `Results for "${meta.searchedKeyword}"` : "Results"}
          </h2>
          {meta?.cost != null && (
            <span className="text-xs text-muted-foreground">Cost: ${meta.cost.toFixed(4)}</span>
          )}
        </div>
        <div className="flex-1 overflow-auto">
          {result === null ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <Sparkles className="w-10 h-10 opacity-25" />
              <p className="font-medium text-sm">Your results will appear here</p>
              <p className="text-xs max-w-xs leading-relaxed">
                Enter a keyword and click{" "}
                <span className="font-medium text-foreground">Get AI Summary</span>.
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* AI Overview Section */}
              {result.aiOverview ? (
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">AI Overview</h3>
                  </div>
                  {result.aiOverview.items?.map((block: any, i: number) => (
                    <div key={i} className="space-y-2">
                      {block.title && <p className="font-medium text-sm">{block.title}</p>}
                      {block.text && <p className="text-sm text-muted-foreground leading-relaxed">{block.text}</p>}
                      {block.items?.length > 0 && (
                        <ul className="text-sm space-y-1 list-disc pl-4">
                          {block.items.map((sub: any, j: number) => (
                            <li key={j} className="text-muted-foreground">{sub.title ?? sub.text ?? JSON.stringify(sub)}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                  {result.aiOverview.references?.length > 0 && (
                    <div className="pt-2 border-t border-border/40">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Sources</p>
                      <div className="flex flex-wrap gap-2">
                        {result.aiOverview.references.map((ref: any, i: number) => (
                          <a
                            key={i}
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary underline truncate max-w-[200px]"
                          >
                            {ref.domain ?? ref.url}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-border/40 bg-muted/10 p-4 text-sm text-muted-foreground">
                  No AI Overview was returned for this query. Try a different keyword or location.
                </div>
              )}

              {/* Organic Results */}
              {result.organic.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Organic Results</h3>
                  <div className="space-y-3">
                    {result.organic.map((item: any, i: number) => (
                      <div key={i} className="rounded-md border border-border/40 p-3 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs text-muted-foreground">{item.domain}</p>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-primary hover:underline line-clamp-2"
                            >
                              {item.title}
                            </a>
                          </div>
                          <span className="text-xs font-mono text-muted-foreground shrink-0">#{item.rank_group ?? i + 1}</span>
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
