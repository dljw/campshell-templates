import { useState } from "react";
import { Button } from "@campshell/ui-components";
import {
  BarChart,
  History,
  Lightbulb,
  Search,
  Settings,
} from "lucide-react";
import type { UseDataForSeoReturn } from "./hooks/useDataForSeo.js";
import { SettingsView } from "./components/SettingsView.js";
import { SearchVolumeView } from "./components/SearchVolumeView.js";
import { SerpAnalysisView } from "./components/SerpAnalysisView.js";
import { KeywordSuggestionsView } from "./components/KeywordSuggestionsView.js";
import { HistoryView } from "./components/HistoryView.js";

type View = "search-volume" | "serp-analysis" | "keyword-suggestions" | "history" | "settings";

interface AppProps {
  data: UseDataForSeoReturn;
}

const navItems: { id: View; label: string; icon: typeof Search }[] = [
  { id: "search-volume", label: "Search Volume", icon: BarChart },
  { id: "serp-analysis", label: "SERP Analysis", icon: Search },
  { id: "keyword-suggestions", label: "Suggestions", icon: Lightbulb },
  { id: "history", label: "History", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
];

export function App({ data }: AppProps) {
  const [activeView, setActiveView] = useState<View>("search-volume");

  // Force settings view if required secrets are missing
  const isConfigured = data.secretsStatus?.allRequiredConfigured ?? false;
  const currentView = isConfigured ? activeView : "settings";

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-8">
          <h1 className="text-lg font-semibold tracking-tight">DataForSEO</h1>
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

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {currentView === "settings" && (
          <SettingsView
            secretsStatus={data.secretsStatus}
            onSetSecrets={data.setSecrets}
          />
        )}

        {currentView === "search-volume" && (
          <div className="flex-1 overflow-hidden">
            <SearchVolumeView
              onExecute={data.executeOperation}
              isExecuting={data.isExecuting}
            />
          </div>
        )}

        {currentView === "serp-analysis" && (
          <div className="flex-1 overflow-hidden">
            <SerpAnalysisView
              onExecute={data.executeOperation}
              isExecuting={data.isExecuting}
            />
          </div>
        )}

        {currentView === "keyword-suggestions" && (
          <div className="flex-1 overflow-hidden">
            <KeywordSuggestionsView
              onExecute={data.executeOperation}
              isExecuting={data.isExecuting}
            />
          </div>
        )}

        {currentView === "history" && (
          <HistoryView runs={data.runs} />
        )}
      </main>
    </div>
  );
}
