import "./globals.css";
import { Toaster } from "@campshell/ui-components";
import { App } from "./App.js";
import { useTemplateData } from "./hooks/useTemplateData.js";

export function SocialMediaDashboard() {
  const data = useTemplateData();

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

export default SocialMediaDashboard;
