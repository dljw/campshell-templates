import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@campshell/ui-components";
import type { SecretsStatusResponse } from "../hooks/useApifyTikTok.js";
import { ApifySharedSecretCard } from "./ApifySharedSecretCard.js";

export interface SettingsViewProps {
  secretsStatus: SecretsStatusResponse | null;
  onRefresh: () => Promise<void>;
}

export function SettingsView({ secretsStatus, onRefresh }: SettingsViewProps) {
  if (!secretsStatus) return null;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Apify Configuration</CardTitle>
          <CardDescription>
            Your Apify token is shared across every installed apify-* template — set it once and
            all of them are configured.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApifySharedSecretCard selfTemplate="apify-tiktok" onSaved={onRefresh} />
        </CardContent>
      </Card>
    </div>
  );
}
