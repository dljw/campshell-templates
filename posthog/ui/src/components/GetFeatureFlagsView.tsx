import { useState } from "react";
import {
  Badge,
  Button,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from "@campshell/ui-components";
import { Flag } from "lucide-react";

export interface GetFeatureFlagsViewProps {
  onExecute: (operation: string, input: unknown) => Promise<unknown>;
  isExecuting: boolean;
}

export function GetFeatureFlagsView({ onExecute, isExecuting }: GetFeatureFlagsViewProps) {
  const [distinctId, setDistinctId] = useState("");
  const [groupsText, setGroupsText] = useState("");
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    flags: Record<string, unknown>;
    featureFlagPayloads: Record<string, unknown>;
  } | null>(null);

  const handleExecute = async () => {
    setResult(null);
    setGroupsError(null);

    let groups: Record<string, string> | undefined;
    if (groupsText.trim()) {
      try {
        const parsed = JSON.parse(groupsText);
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
          throw new Error("must be a JSON object of string→string");
        }
        groups = parsed as Record<string, string>;
      } catch (err) {
        setGroupsError(`Invalid JSON: ${err instanceof Error ? err.message : String(err)}`);
        return;
      }
    }

    try {
      const data: any = await onExecute("get-feature-flags", {
        distinctId: distinctId.trim(),
        ...(groups ? { groups } : {}),
      });
      setResult(data?.output ?? null);
    } catch {
      // toast handled by hook
    }
  };

  const flagRows = result
    ? Object.entries(result.flags).map(([key, value]) => ({
        key,
        value,
        payload: result.featureFlagPayloads?.[key],
      }))
    : [];

  return (
    <div className="flex h-full gap-0">
      <div className="w-96 shrink-0 border-r border-border/40 flex flex-col">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Get Feature Flags</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Evaluate flags for a user via <code>POST /decide/?v=3</code>.
          </p>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-5">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="groups">Groups (JSON object, optional)</Label>
            <Textarea
              id="groups"
              rows={4}
              placeholder={'{\n  "company": "acme-corp"\n}'}
              value={groupsText}
              onChange={(e) => setGroupsText(e.target.value)}
              className="resize-none text-sm font-mono"
            />
            {groupsError && <p className="text-xs text-red-500">{groupsError}</p>}
            <p className="text-xs text-muted-foreground">
              Group properties for group-based feature flags.
            </p>
          </div>
        </div>
        <div className="p-6 border-t border-border/40">
          <Button
            onClick={handleExecute}
            disabled={isExecuting || !distinctId.trim()}
            className="w-full"
          >
            {isExecuting ? "Evaluating..." : "Evaluate Flags"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-semibold text-sm">Flags</h2>
        </div>
        <div className="flex-1 overflow-auto">
          {result === null ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <Flag className="w-10 h-10 opacity-25" />
              <p className="font-medium text-sm">No flags evaluated yet</p>
              <p className="text-xs max-w-xs leading-relaxed">
                Enter a distinct ID and click{" "}
                <span className="font-medium text-foreground">Evaluate Flags</span>.
              </p>
            </div>
          ) : flagRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16 text-muted-foreground">
              <p className="text-sm">No feature flags returned for this user.</p>
              <p className="text-xs">Either there are no flags defined, or none match this user.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flag</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Payload</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flagRows.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell className="font-medium">{row.key}</TableCell>
                    <TableCell>
                      {typeof row.value === "boolean" ? (
                        <Badge variant={row.value ? "default" : "secondary"}>
                          {String(row.value)}
                        </Badge>
                      ) : (
                        <span className="font-mono text-xs">{JSON.stringify(row.value)}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {row.payload != null ? JSON.stringify(row.payload) : "—"}
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
