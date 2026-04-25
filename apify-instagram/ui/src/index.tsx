import "./globals.css";
import { Toaster } from "@campshell/ui-components";
import { useApifyInstagram } from "./hooks/useApifyInstagram.js";
import { App } from "./App.js";

export function ApifyInstagramDashboard() {
  const data = useApifyInstagram();

  if (data.isLoading) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading Instagram Analytics...</p>
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

export default ApifyInstagramDashboard;
