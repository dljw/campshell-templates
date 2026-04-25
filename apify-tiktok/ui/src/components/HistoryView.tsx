import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@campshell/ui-components";
import type { RunHistoryItem } from "../hooks/useApifyTikTok.js";

export interface HistoryViewProps {
  runs: RunHistoryItem[];
}

function formatDuration(ms: number | null) {
  if (ms === null) return "--";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleString();
}

export function HistoryView({ runs }: HistoryViewProps) {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Run History</CardTitle>
          <CardDescription>
            Recent TikTok scraping operations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Started At</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No run history found
                  </TableCell>
                </TableRow>
              ) : (
                runs.map((run) => (
                  <TableRow key={run.runId}>
                    <TableCell className="font-medium">{run.operation}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          run.status === "success"
                            ? "default"
                            : run.status === "error"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {run.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDuration(run.durationMs)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(run.startedAt)}
                    </TableCell>
                    <TableCell>
                      {run.error && (
                        <span className="text-xs text-red-500 line-clamp-1" title={run.error}>
                          {run.error}
                        </span>
                      )}
                      {!run.error && run.status === "success" && (
                        <span className="text-xs text-muted-foreground">Success</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
