import "./globals.css";
import { Toaster } from "@campshell/ui-components";
import { useSeoTrackerData } from "./hooks/useSeoTrackerData.js";
import { App } from "./App.js";

export function SeoTrackerDashboard() {
  const data = useSeoTrackerData();

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

export default SeoTrackerDashboard;
