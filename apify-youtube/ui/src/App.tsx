import { useState } from "react";
import { Button } from "@campshell/ui-components";
import { History, Search, Settings, Tv, Video } from "lucide-react";
import type { UseApifyYouTubeReturn } from "./hooks/useApifyYouTube.js";
import { SettingsView } from "./components/SettingsView.js";
import { ChannelScrapeView } from "./components/ChannelScrapeView.js";
import { VideosScrapeView } from "./components/VideosScrapeView.js";
import { SearchScrapeView } from "./components/SearchScrapeView.js";
import { HistoryView } from "./components/HistoryView.js";

type View = "channel-scrape" | "videos-scrape" | "search-scrape" | "history" | "settings";

interface AppProps {
  data: UseApifyYouTubeReturn;
}

const navItems: { id: View; label: string; icon: typeof Tv }[] = [
  { id: "channel-scrape", label: "Channel", icon: Tv },
  { id: "videos-scrape", label: "Videos", icon: Video },
  { id: "search-scrape", label: "Search", icon: Search },
  { id: "history", label: "History", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
];

export function App({ data }: AppProps) {
  const [activeView, setActiveView] = useState<View>("channel-scrape");

  const isConfigured = data.secretsStatus?.allRequiredConfigured ?? false;
  const currentView = isConfigured ? activeView : "settings";

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="flex items-center justify-between px-8 py-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-8">
          <h1 className="text-lg font-semibold tracking-tight">YouTube Analytics</h1>
          <nav className="flex items-center gap-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={currentView === id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveView(id)}
                className="gap-2"
                disabled={!isConfigured && id !== "settings"}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col">
        {currentView === "settings" && (
          <SettingsView secretsStatus={data.secretsStatus} onRefresh={data.fetchSecretsStatus} />
        )}

        {currentView === "channel-scrape" && (
          <div className="flex-1 overflow-hidden">
            <ChannelScrapeView onExecute={data.executeOperation} isExecuting={data.isExecuting} runs={data.runs} />
          </div>
        )}

        {currentView === "videos-scrape" && (
          <div className="flex-1 overflow-hidden">
            <VideosScrapeView
              onExecute={data.executeOperation}
              isExecuting={data.isExecuting}
              runs={data.runs}
              onDownloadZip={data.downloadMediaZip}
            />
          </div>
        )}

        {currentView === "search-scrape" && (
          <div className="flex-1 overflow-hidden">
            <SearchScrapeView
              onExecute={data.executeOperation}
              isExecuting={data.isExecuting}
              runs={data.runs}
              onDownloadZip={data.downloadMediaZip}
            />
          </div>
        )}

        {currentView === "history" && <HistoryView runs={data.runs} />}
      </main>
    </div>
  );
}
