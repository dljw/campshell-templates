import "./globals.css";
import { Toaster } from "@campshell/ui-components";
import { App } from "./App.js";
import { useJournalData } from "./hooks/useJournalData.js";

export function JournalDashboard() {
  const data = useJournalData();

  if (data.isLoading) {
    return (
      <div className="h-full bg-background flex flex-col items-center justify-center gap-3">
        <span className="text-4xl animate-pulse">🌸</span>
        <p className="text-sm text-muted-foreground">Loading your journal…</p>
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

export default JournalDashboard;
