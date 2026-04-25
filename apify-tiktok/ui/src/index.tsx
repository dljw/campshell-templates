import "./globals.css";
import { Toaster } from "@campshell/ui-components";
import { useApifyTikTok } from "./hooks/useApifyTikTok.js";
import { App } from "./App.js";

export function ApifyTikTokDashboard() {
  const data = useApifyTikTok();

  if (data.isLoading) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading TikTok Analytics...</p>
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

export default ApifyTikTokDashboard;
