import { useState } from "react";
import {
  Button,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@campshell/ui-components";
import { ListOrdered } from "lucide-react";

export interface ListEventsViewProps {
  onExecute: (operation: string, input: unknown) => Promise<unknown>;
  isExecuting: boolean;
}

interface EventRow {
  id: string;
  event: string;
  distinctId: string;
  timestamp: string;
  properties: Record<string, unknown>;
}

export function ListEventsView({ onExecute, isExecuting }: ListEventsViewProps) {
  const [limit, setLimit] = useState(100);
  const [after, setAfter] = useState("");
  const [eventName, setEventName] = useState("");
  const [results, setResults] = useState<EventRow[] | null>(null);

  const handleExecute = async () => {
    try {
      const data: any = await onExecute("list-events", {
        limit,
        ...(after.trim() ? { after: after.trim() } : {}),
        ...(eventName.trim() ? { eventName: eventName.trim() } : {}),
      });
      setResults(data?.output?.results ?? []);
    } catch {
      // toast handled by hook
    }
  };

  return (
    <div className="flex h-full gap-0">
      <div className="w-80 shrink-0 border-r border-border/40 flex flex-col">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">List Events</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Query recent events. Requires Personal API Key + Project ID secrets.
          </p>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="limit">Limit</Label>
            <Input
              id="limit"
              type="number"
              min={1}
              max={1000}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value) || 100)}
            />
            <p className="text-xs text-muted-foreground">1–1000 (default 100).</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventName">Event name (optional)</Label>
            <Input
              id="eventName"
              placeholder="signup_completed"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="after">After (optional)</Label>
            <Input
              id="after"
              placeholder="2026-04-01T00:00:00Z"
              value={after}
              onChange={(e) => setAfter(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">ISO 8601 timestamp.</p>
          </div>
        </div>
        <div className="p-6 border-t border-border/40">
          <Button onClick={handleExecute} disabled={isExecuting} className="w-full">
            {isExecuting ? "Loading..." : "List Events"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Events</h2>
        </div>
        <div className="flex-1 overflow-auto">
          {results === null ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <ListOrdered className="w-10 h-10 opacity-25" />
              <p className="font-medium text-sm">No events loaded</p>
              <p className="text-xs max-w-xs leading-relaxed">
                Click <span className="font-medium text-foreground">List Events</span> to fetch
                recent events from your project.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <p className="text-sm">No events found.</p>
              <p className="text-xs">Try widening the time range or removing the event filter.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Distinct ID</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Properties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.event}</TableCell>
                    <TableCell className="font-mono text-xs">{row.distinctId}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(row.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell
                      className="font-mono text-xs max-w-md truncate"
                      title={JSON.stringify(row.properties)}
                    >
                      {JSON.stringify(row.properties)}
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
