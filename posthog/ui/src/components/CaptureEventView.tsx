import { useState } from "react";
import {
  Button,
  Input,
  Label,
  Textarea,
} from "@campshell/ui-components";
import { Send } from "lucide-react";

export interface CaptureEventViewProps {
  onExecute: (operation: string, input: unknown) => Promise<unknown>;
  isExecuting: boolean;
}

export function CaptureEventView({ onExecute, isExecuting }: CaptureEventViewProps) {
  const [event, setEvent] = useState("");
  const [distinctId, setDistinctId] = useState("");
  const [propertiesText, setPropertiesText] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [propertiesError, setPropertiesError] = useState<string | null>(null);
  const [result, setResult] = useState<{ success: boolean; status: number } | null>(null);

  const handleExecute = async () => {
    setResult(null);
    setPropertiesError(null);

    let properties: Record<string, unknown> | undefined;
    if (propertiesText.trim()) {
      try {
        const parsed = JSON.parse(propertiesText);
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
          throw new Error("must be a JSON object");
        }
        properties = parsed as Record<string, unknown>;
      } catch (err) {
        setPropertiesError(`Invalid JSON: ${err instanceof Error ? err.message : String(err)}`);
        return;
      }
    }

    try {
      const data: any = await onExecute("capture-event", {
        event: event.trim(),
        distinctId: distinctId.trim(),
        ...(properties ? { properties } : {}),
        ...(timestamp.trim() ? { timestamp: timestamp.trim() } : {}),
      });
      setResult(data?.output ?? null);
    } catch {
      // toast handled by hook
    }
  };

  return (
    <div className="flex h-full gap-0">
      <div className="w-96 shrink-0 border-r border-border/40 flex flex-col">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Capture Event</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Track a custom event for a user. Sent to <code>POST /capture/</code>.
          </p>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="event">
              Event name<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="event"
              placeholder="signup_completed"
              value={event}
              onChange={(e) => setEvent(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="distinctId">
              Distinct ID<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="distinctId"
              placeholder="user_42"
              value={distinctId}
              onChange={(e) => setDistinctId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Stable per-user identifier (e.g. internal user id or anonymous cookie id).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="properties">Properties (JSON object)</Label>
            <Textarea
              id="properties"
              rows={6}
              placeholder={'{\n  "plan": "pro",\n  "source": "landing_page"\n}'}
              value={propertiesText}
              onChange={(e) => setPropertiesText(e.target.value)}
              className="resize-none text-sm font-mono"
            />
            {propertiesError && (
              <p className="text-xs text-red-500">{propertiesError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="timestamp">Timestamp (optional)</Label>
            <Input
              id="timestamp"
              placeholder="2026-04-26T12:34:56Z"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">ISO 8601; defaults to now.</p>
          </div>
        </div>
        <div className="p-6 border-t border-border/40">
          <Button
            onClick={handleExecute}
            disabled={isExecuting || !event.trim() || !distinctId.trim()}
            className="w-full"
          >
            {isExecuting ? "Sending..." : "Capture Event"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Result</h2>
        </div>
        <div className="flex-1 overflow-auto p-6">
          {result === null ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <Send className="w-10 h-10 opacity-25" />
              <p className="font-medium text-sm">No event sent yet</p>
              <p className="text-xs max-w-xs leading-relaxed">
                Fill in event and distinct ID on the left, then click{" "}
                <span className="font-medium text-foreground">Capture Event</span>.
              </p>
            </div>
          ) : (
            <div className="max-w-md space-y-3">
              <div className="rounded-md border border-border/40 p-4 bg-muted/30">
                <div className="text-xs text-muted-foreground">Success</div>
                <div className="font-mono text-sm">{String(result.success)}</div>
              </div>
              <div className="rounded-md border border-border/40 p-4 bg-muted/30">
                <div className="text-xs text-muted-foreground">HTTP Status</div>
                <div className="font-mono text-sm">{result.status}</div>
              </div>
              <p className="text-xs text-muted-foreground">
                The event has been queued in PostHog. It may take a few seconds to appear in Live
                Events.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
