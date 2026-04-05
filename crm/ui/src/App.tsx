import { Button } from "@campshell/ui-components";
import { Activity as ActivityIcon, Handshake, Users } from "lucide-react";
import { useState } from "react";
import type { UseCrmDataReturn } from "./hooks/useCrmData.js";
import { PipelineView } from "./components/PipelineView.js";
import { ContactsView } from "./components/ContactsView.js";
import { ActivityView } from "./components/ActivityView.js";
import { ConnectionStatus } from "./components/ConnectionStatus.js";

type Tab = "pipeline" | "contacts" | "activity";

interface AppProps {
  data: UseCrmDataReturn;
}

const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  { id: "pipeline", label: "Pipeline", icon: <Handshake className="h-4 w-4" /> },
  { id: "contacts", label: "Contacts", icon: <Users className="h-4 w-4" /> },
  { id: "activity", label: "Activity", icon: <ActivityIcon className="h-4 w-4" /> },
];

export function App({ data }: AppProps) {
  const [tab, setTab] = useState<Tab>("pipeline");

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="flex items-center px-6 py-3 border-b border-border/40 shrink-0 gap-6">
        <h1 className="text-base font-semibold tracking-tight">CRM</h1>
        <nav className="flex items-center gap-1">
          {TABS.map((t) => (
            <Button
              key={t.id}
              variant={tab === t.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTab(t.id)}
              className="gap-1.5 bg-transparent text-white"
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </Button>
          ))}
        </nav>
      </header>

      <main className="flex-1 overflow-auto">
        {tab === "pipeline" && (
          <PipelineView
            deals={data.deals}
            contacts={data.contacts}
            activities={data.activities}
            createDeal={data.createDeal}
            updateDeal={data.updateDeal}
            deleteDeal={data.deleteDeal}
          />
        )}
        {tab === "contacts" && (
          <ContactsView
            contacts={data.contacts}
            deals={data.deals}
            activities={data.activities}
            createContact={data.createContact}
            updateContact={data.updateContact}
            deleteContact={data.deleteContact}
          />
        )}
        {tab === "activity" && (
          <ActivityView
            activities={data.activities}
            contacts={data.contacts}
            deals={data.deals}
            createActivity={data.createActivity}
            updateActivity={data.updateActivity}
            deleteActivity={data.deleteActivity}
          />
        )}
      </main>

      <ConnectionStatus status={data.status} />
    </div>
  );
}
