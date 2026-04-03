import "./globals.css";
import { Toaster } from "@campshell/ui-components";
import { useBrainVaultData } from "./hooks/useBrainVaultData.js";
import { App } from "./App.js";

export function BrainVaultDashboard() {
  const data = useBrainVaultData();

  if (data.isLoading) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <App data={data} />
      <Toaster richColors position="bottom-right" />
    </>
  );
}

export default BrainVaultDashboard;
