import { Button } from "@campshell/ui-components";
import { BarChart3, Building2, CalendarDays, Lightbulb, Layers, Settings, Target } from "lucide-react";
import { useState } from "react";
import type { UseTemplateDataReturn } from "./hooks/useTemplateData.js";
import { CalendarView } from "./components/CalendarView.js";
import { PipelineView } from "./components/PipelineView.js";
import { IdeasView } from "./components/IdeasView.js";
import { CampaignsView } from "./components/CampaignsView.js";
import { AnalyticsView } from "./components/AnalyticsView.js";
import { PlatformsView } from "./components/PlatformsView.js";
import { BusinessesView } from "./components/BusinessesView.js";
import { ConnectionStatus } from "./components/ConnectionStatus.js";

type Tab = "calendar" | "pipeline" | "ideas" | "campaigns" | "analytics" | "platforms" | "businesses";

interface AppProps {
  data: UseTemplateDataReturn;
}

const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  { id: "calendar", label: "Calendar", icon: <CalendarDays className="h-4 w-4" /> },
  { id: "pipeline", label: "Pipeline", icon: <Layers className="h-4 w-4" /> },
  { id: "ideas", label: "Ideas", icon: <Lightbulb className="h-4 w-4" /> },
  { id: "campaigns", label: "Campaigns", icon: <Target className="h-4 w-4" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "platforms", label: "Platforms", icon: <Settings className="h-4 w-4" /> },
  { id: "businesses", label: "Businesses", icon: <Building2 className="h-4 w-4" /> },
];

export function App({ data }: AppProps) {
  const [tab, setTab] = useState<Tab>("calendar");

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="flex items-center px-6 py-3 border-b border-border/40 shrink-0 gap-6">
        <h1 className="text-base font-semibold tracking-tight">Social Media</h1>
        <nav className="flex items-center gap-1">
          {TABS.map((t) => (
            <Button
              key={t.id}
              variant={tab === t.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTab(t.id)}
              className="gap-1.5"
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </Button>
          ))}
        </nav>
      </header>

      <main className="flex-1 overflow-auto">
        {tab === "calendar" && <CalendarView data={data} />}
        {tab === "pipeline" && <PipelineView data={data} />}
        {tab === "ideas" && <IdeasView data={data} />}
        {tab === "campaigns" && <CampaignsView data={data} />}
        {tab === "analytics" && <AnalyticsView data={data} />}
        {tab === "platforms" && <PlatformsView data={data} />}
        {tab === "businesses" && <BusinessesView data={data} />}
      </main>

      <ConnectionStatus status={data.status} />
    </div>
  );
}
