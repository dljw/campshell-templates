import { useCallback, useEffect, useState } from "react";
import { Button, Input, Label } from "@campshell/ui-components";
import { Check, AlertTriangle, Link2, Minus, Loader2 } from "lucide-react";
import {
  discoverApifySiblings,
  saveApifyTokenToAllSiblings,
  type ApifySibling,
  type SaveResult,
} from "../lib/apifySharedSecret.js";

export interface ApifySharedSecretCardProps {
  selfTemplate: string;
  apiBase?: string;
  onSaved?: () => void | Promise<void>;
}

export function ApifySharedSecretCard({
  selfTemplate,
  apiBase = "",
  onSaved,
}: ApifySharedSecretCardProps) {
  const [siblings, setSiblings] = useState<ApifySibling[] | null>(null);
  const [token, setToken] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [results, setResults] = useState<SaveResult[] | null>(null);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await discoverApifySiblings(apiBase, selfTemplate);
      setSiblings(data);
      setDiscoveryError(null);
    } catch (err) {
      setDiscoveryError((err as Error).message);
    }
  }, [apiBase, selfTemplate]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!results || results.some((r) => !r.ok)) return;
    const t = setTimeout(() => setResults(null), 4000);
    return () => clearTimeout(t);
  }, [results]);

  const handleSave = async () => {
    const value = token.trim();
    if (!value || !siblings || siblings.length === 0) return;
    setIsSaving(true);
    setResults(null);
    try {
      const out = await saveApifyTokenToAllSiblings(apiBase, value, siblings);
      setResults(out);
      if (out.every((r) => r.ok)) setToken("");
      await refresh();
      if (onSaved) await onSaved();
    } finally {
      setIsSaving(false);
    }
  };

  const someConfigured = siblings?.some((s) => s.configured) ?? false;
  const someMissing = siblings?.some((s) => !s.configured) ?? false;
  const showDrift = someConfigured && someMissing;

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-4">
      <div className="flex items-start gap-2">
        <Link2 className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
        <div className="space-y-1 min-w-0">
          <p className="text-sm font-semibold">Apify API Token (shared)</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            One token unlocks all your Apify templates. Paste it once here and every installed
            apify-* template gets configured.
          </p>
        </div>
      </div>

      {discoveryError && (
        <p className="text-xs text-red-600 bg-red-500/10 border border-red-200 rounded-md p-2">
          Couldn't discover sibling templates: {discoveryError}
        </p>
      )}

      {siblings && siblings.length > 0 && (
        <div className="rounded-md border border-border/40 bg-background/40 divide-y divide-border/40 text-xs">
          {siblings.map((s) => (
            <div key={s.name} className="flex items-center justify-between gap-2 px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base leading-none">{s.emoji}</span>
                <span className="truncate font-medium">{s.displayName}</span>
                {s.isSelf && (
                  <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/60 rounded px-1.5 py-0.5">
                    this template
                  </span>
                )}
              </div>
              {s.configured ? (
                <span className="shrink-0 inline-flex items-center gap-1 text-green-600">
                  <Check className="w-3.5 h-3.5" />
                  configured
                </span>
              ) : (
                <span className="shrink-0 inline-flex items-center gap-1 text-muted-foreground">
                  <Minus className="w-3.5 h-3.5" />
                  not configured
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {siblings && siblings.length === 0 && !discoveryError && (
        <p className="text-xs text-muted-foreground">No apify-* templates detected.</p>
      )}

      {showDrift && (
        <div className="flex items-start gap-2 text-xs text-yellow-700 bg-yellow-500/10 border border-yellow-200 rounded-md p-2">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>Some templates are missing this token — paste it again to resync.</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="apify-shared-token">
          Apify API token<span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="apify-shared-token"
          type="password"
          placeholder={someConfigured ? "••••••••  (paste to overwrite all)" : "Paste your Apify token"}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">
          Get one at console.apify.com/account/integrations.
        </p>
      </div>

      <Button
        onClick={handleSave}
        disabled={isSaving || !token.trim() || !siblings || siblings.length === 0}
        className="w-full"
      >
        {isSaving ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving to {siblings?.length ?? 0} template{(siblings?.length ?? 0) === 1 ? "" : "s"}...
          </span>
        ) : (
          `Save to ${siblings?.length ?? 0} apify template${(siblings?.length ?? 0) === 1 ? "" : "s"}`
        )}
      </Button>

      {results && (
        <ul className="text-xs space-y-1">
          {results.map((r) => (
            <li
              key={r.name}
              className={r.ok ? "text-green-600" : "text-red-600"}
            >
              {r.ok ? "✓" : "✗"} {r.ok ? "Saved to" : "Failed to save to"} {r.displayName}
              {!r.ok && r.error ? `: ${r.error}` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
