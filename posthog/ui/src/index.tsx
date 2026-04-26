import "./globals.css";
import { Toaster } from "@campshell/ui-components";
import { usePosthog } from "./hooks/usePosthog.js";
import { App } from "./App.js";

export function PosthogDashboard() {
  const data = usePosthog();

  if (data.isLoading) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading PostHog...</p>
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

export default PosthogDashboard;
