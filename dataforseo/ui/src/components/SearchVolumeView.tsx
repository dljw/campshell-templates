import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  Textarea,
} from "@campshell/ui-components";
import { BarChart2 } from "lucide-react";
import { COUNTRY_OPTIONS, LANGUAGE_OPTIONS } from "../constants/geo.js";

export interface SearchVolumeViewProps {
  onExecute: (operation: string, input: unknown) => Promise<unknown>;
  isExecuting: boolean;
}

export function SearchVolumeView({ onExecute, isExecuting }: SearchVolumeViewProps) {
  const [keywords, setKeywords] = useState("");
  const [locationCode, setLocationCode] = useState(2840);
  const [languageCode, setLanguageCode] = useState("en");
  const [results, setResults] = useState<any[] | null>(null);

  const handleExecute = async () => {
    const keywordList = keywords
      .split("\n")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (keywordList.length === 0) return;

    try {
      const data: any = await onExecute("search-volume", {
        keywords: keywordList,
        locationCode,
        languageCode,
      });
      setResults(data.output?.results || []);
    } catch (err) {
      // Error is handled by hook
    }
  };

  return (
    <div className="flex h-full gap-0">
      {/* Left panel — inputs */}
      <div className="w-80 shrink-0 border-r border-border/40 flex flex-col">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Search Volume</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Find out how many people search for your keywords each month.
          </p>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="keywords">
              Keywords
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="keywords"
              placeholder={"camping tent\nbest hiking boots\noutdoor gear"}
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              rows={6}
              className="resize-none text-sm"
            />
            <p className="text-xs text-muted-foreground">Enter one keyword per line (up to 50)</p>
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
        </div>
        <div className="p-6 border-t border-border/40">
          <Button
            onClick={handleExecute}
            disabled={isExecuting || !keywords.trim()}
            className="w-full"
          >
            {isExecuting ? "Fetching data..." : "Get Search Volume"}
          </Button>
        </div>
      </div>

      {/* Right panel — results */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Results</h2>
        </div>
        <div className="flex-1 overflow-auto">
          {results === null ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <BarChart2 className="w-10 h-10 opacity-25" />
              <p className="font-medium text-sm">Your results will appear here</p>
              <p className="text-xs max-w-xs leading-relaxed">
                Enter your keywords on the left, choose a country and language, then click{" "}
                <span className="font-medium text-foreground">Get Search Volume</span>.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <p className="text-sm">No data found for these keywords.</p>
              <p className="text-xs">Try different keywords or a different country.</p>
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
                    <TableCell className="text-right">
                      {row.competitionLevel ?? row.competition ?? "—"}
                    </TableCell>
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
