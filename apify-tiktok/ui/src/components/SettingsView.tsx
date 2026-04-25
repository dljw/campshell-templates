import { useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@campshell/ui-components";
import type { SecretsStatusResponse } from "../hooks/useApifyTikTok.js";

export interface SettingsViewProps {
  secretsStatus: SecretsStatusResponse | null;
  onSetSecrets: (secrets: Record<string, string>) => Promise<boolean>;
}

export function SettingsView({ secretsStatus, onSetSecrets }: SettingsViewProps) {
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!secretsStatus) return null;

  const hasValues = Object.values(secrets).some((v) => v.trim().length > 0);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const ok = await onSetSecrets(secrets);
      if (ok) {
        setSecrets({});
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Apify Configuration</CardTitle>
          <CardDescription>
            Add your Apify API token to enable TikTok scraping operations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {saveSuccess && (
            <div className="bg-green-500/10 text-green-700 border border-green-200 p-4 rounded-md text-sm font-medium">
              ✓ Token saved. You can now use all TikTok operations.
            </div>
          )}

          {!secretsStatus.allRequiredConfigured && !saveSuccess && (
            <div className="bg-yellow-500/10 text-yellow-600 p-4 rounded-md text-sm">
              Enter your Apify API token below to get started. Get one at console.apify.com/account/integrations.
            </div>
          )}

          <div className="space-y-4">
            {secretsStatus.secrets.map((secret) => (
              <div key={secret.key} className="space-y-2">
                <Label htmlFor={secret.key}>
                  {secret.label}
                  {secret.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id={secret.key}
                    type="password"
                    placeholder={secret.configured ? "••••••••" : "Enter value"}
                    value={secrets[secret.key] || ""}
                    onChange={(e) =>
                      setSecrets((prev) => ({ ...prev, [secret.key]: e.target.value }))
                    }
                  />
                </div>
                {secret.description && (
                  <p className="text-xs text-muted-foreground">{secret.description}</p>
                )}
                {secret.configured && !secrets[secret.key] && (
                  <p className="text-xs text-green-600">✓ Currently configured</p>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving || !hasValues}
            className="w-full"
          >
            {isSaving ? "Saving..." : "Save Configuration"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
