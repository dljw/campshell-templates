import "./globals.css";
import { Toaster } from "@campshell/ui-components";
import { useDataForSeo } from "./hooks/useDataForSeo.js";
import { App } from "./App.js";

export function DataForSeoDashboard() {
  const data = useDataForSeo();

  if (data.isLoading) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading DataForSEO...</p>
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

export default DataForSeoDashboard;
