import "./globals.css";
import { Toaster } from "@campshell/ui-components";
import { useApifyYouTube } from "./hooks/useApifyYouTube.js";
import { App } from "./App.js";

export function ApifyYouTubeDashboard() {
  const data = useApifyYouTube();

  if (data.isLoading) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading YouTube Analytics...</p>
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

export default ApifyYouTubeDashboard;
