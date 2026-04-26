import { useState } from "react";
import { Button } from "@campshell/ui-components";
import { Flag, History, ListOrdered, Send, Settings } from "lucide-react";
import type { UsePosthogReturn } from "./hooks/usePosthog.js";
import { SettingsView } from "./components/SettingsView.js";
import { CaptureEventView } from "./components/CaptureEventView.js";
import { GetFeatureFlagsView } from "./components/GetFeatureFlagsView.js";
import { ListEventsView } from "./components/ListEventsView.js";
import { HistoryView } from "./components/HistoryView.js";

type View = "capture-event" | "get-feature-flags" | "list-events" | "history" | "settings";

interface AppProps {
  data: UsePosthogReturn;
}

const navItems: { id: View; label: string; icon: typeof Send }[] = [
  { id: "capture-event", label: "Capture Event", icon: Send },
  { id: "get-feature-flags", label: "Feature Flags", icon: Flag },
  { id: "list-events", label: "List Events", icon: ListOrdered },
  { id: "history", label: "History", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
];

export function App({ data }: AppProps) {
  const [activeView, setActiveView] = useState<View>("capture-event");

  const isConfigured = data.secretsStatus?.allRequiredConfigured ?? false;
  const currentView = isConfigured ? activeView : "settings";

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="flex items-center justify-between px-8 py-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-8">
          <h1 className="text-lg font-semibold tracking-tight">PostHog</h1>
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
          <SettingsView
            secretsStatus={data.secretsStatus}
            onSetSecrets={data.setSecrets}
          />
        )}

        {currentView === "capture-event" && (
          <div className="flex-1 overflow-hidden">
            <CaptureEventView onExecute={data.executeOperation} isExecuting={data.isExecuting} />
          </div>
        )}

        {currentView === "get-feature-flags" && (
          <div className="flex-1 overflow-hidden">
            <GetFeatureFlagsView
              onExecute={data.executeOperation}
              isExecuting={data.isExecuting}
            />
          </div>
        )}

        {currentView === "list-events" && (
          <div className="flex-1 overflow-hidden">
            <ListEventsView onExecute={data.executeOperation} isExecuting={data.isExecuting} />
          </div>
        )}

        {currentView === "history" && <HistoryView runs={data.runs} />}
      </main>
    </div>
  );
}
