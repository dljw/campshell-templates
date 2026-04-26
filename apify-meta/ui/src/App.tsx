import { useState } from "react";
import { Button } from "@campshell/ui-components";
import { FileText, History, Settings, Users } from "lucide-react";
import type { UseApifyMetaReturn } from "./hooks/useApifyMeta.js";
import { SettingsView } from "./components/SettingsView.js";
import { PagesScrapeView } from "./components/PagesScrapeView.js";
import { PostsScrapeView } from "./components/PostsScrapeView.js";
import { HistoryView } from "./components/HistoryView.js";

type View = "pages-scrape" | "posts-scrape" | "history" | "settings";

interface AppProps {
  data: UseApifyMetaReturn;
}

const navItems: { id: View; label: string; icon: typeof Users }[] = [
  { id: "pages-scrape", label: "Pages", icon: Users },
  { id: "posts-scrape", label: "Posts", icon: FileText },
  { id: "history", label: "History", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
];

export function App({ data }: AppProps) {
  const [activeView, setActiveView] = useState<View>("pages-scrape");

  const isConfigured = data.secretsStatus?.allRequiredConfigured ?? false;
  const currentView = isConfigured ? activeView : "settings";

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="flex items-center justify-between px-8 py-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-8">
          <h1 className="text-lg font-semibold tracking-tight">Meta Analytics</h1>
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

        {currentView === "pages-scrape" && (
          <div className="flex-1 overflow-hidden">
            <PagesScrapeView onExecute={data.executeOperation} isExecuting={data.isExecuting} runs={data.runs} />
          </div>
        )}

        {currentView === "posts-scrape" && (
          <div className="flex-1 overflow-hidden">
            <PostsScrapeView onExecute={data.executeOperation} isExecuting={data.isExecuting} runs={data.runs} />
          </div>
        )}

        {currentView === "history" && <HistoryView runs={data.runs} />}
      </main>
    </div>
  );
}
