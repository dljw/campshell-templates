import { useState } from "react";
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
import { Lightbulb } from "lucide-react";
import { COUNTRY_OPTIONS } from "../constants/geo.js";

const LIMIT_OPTIONS = [
  { label: "10 suggestions", value: 10 },
  { label: "20 suggestions", value: 20 },
  { label: "50 suggestions", value: 50 },
  { label: "100 suggestions", value: 100 },
];

export interface KeywordSuggestionsViewProps {
  onExecute: (operation: string, input: unknown) => Promise<unknown>;
  isExecuting: boolean;
}

export function KeywordSuggestionsView({ onExecute, isExecuting }: KeywordSuggestionsViewProps) {
  const [seed, setSeed] = useState("");
  const [locationCode, setLocationCode] = useState(2840);
  const [limit, setLimit] = useState(20);
  const [results, setResults] = useState<any[] | null>(null);
  const [searchedSeed, setSearchedSeed] = useState("");

  const handleExecute = async () => {
    if (!seed.trim()) return;

    try {
      const data: any = await onExecute("keyword-suggestions", {
        seed: seed.trim(),
        locationCode,
        limit,
      });
      setSearchedSeed(seed.trim());
      setResults(data.output?.suggestions || []);
    } catch (err) {
      // Error is handled by hook
    }
  };

  return (
    <div className="flex h-full gap-0">
      {/* Left panel — inputs */}
      <div className="w-80 shrink-0 border-r border-border/40 flex flex-col">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Keyword Suggestions</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Discover related keywords based on a topic or phrase.
          </p>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="seed">
              Topic or keyword
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="seed"
              placeholder="e.g. camping gear"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleExecute()}
            />
            <p className="text-xs text-muted-foreground">
              We'll find related keywords people are searching for
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
            <Label htmlFor="limit">How many suggestions?</Label>
            <Select
              value={String(limit)}
              onValueChange={(v) => setLimit(Number(v))}
            >
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
            disabled={isExecuting || !seed.trim()}
            className="w-full"
          >
            {isExecuting ? "Finding keywords..." : "Get Suggestions"}
          </Button>
        </div>
      </div>

      {/* Right panel — results */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">
            {searchedSeed ? `Suggestions for "${searchedSeed}"` : "Results"}
          </h2>
        </div>
        <div className="flex-1 overflow-auto">
          {results === null ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <Lightbulb className="w-10 h-10 opacity-25" />
              <p className="font-medium text-sm">Keyword ideas will appear here</p>
              <p className="text-xs max-w-xs leading-relaxed">
                Enter a topic or keyword on the left, choose a country, then click{" "}
                <span className="font-medium text-foreground">Get Suggestions</span> to
                discover related search terms.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <p className="text-sm">No suggestions found.</p>
              <p className="text-xs">Try a broader topic or different country.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead className="text-right">Monthly Searches</TableHead>
                  <TableHead className="text-right">CPC ($)</TableHead>
                  <TableHead className="text-right">Competition</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{row.keyword}</TableCell>
                    <TableCell className="text-right">
                      {row.searchVolume?.toLocaleString() ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.cpc != null ? `$${row.cpc.toFixed(2)}` : "—"}
                    </TableCell>
                    <TableCell className="text-right">{row.competition ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
