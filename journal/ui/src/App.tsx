import { Tabs, TabsContent, TabsList, TabsTrigger } from "@campshell/ui-components";
import { CalendarDays, Heart, PenLine, Sparkles } from "lucide-react";
import type { UseJournalDataReturn } from "./hooks/useJournalData.js";
import { CalendarView } from "./components/CalendarView.js";
import { ConnectionStatus } from "./components/ConnectionStatus.js";
import { MoodInsightsView } from "./components/MoodInsightsView.js";
import { PromptsView } from "./components/PromptsView.js";
import { TimelineView } from "./components/TimelineView.js";

interface AppProps {
  data: UseJournalDataReturn;
}

export function App({ data }: AppProps) {
  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Header */}
      <header className="shrink-0 border-b border-border/40 px-4 pt-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🌸</span>
            <h1 className="text-lg font-semibold tracking-tight">Journal</h1>
          </div>
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="h-9 bg-transparent gap-0 border-0 p-0 w-full justify-start">
              <TabsTrigger
                value="timeline"
                className="gap-1.5 px-3 h-9 rounded-none border-b-2 border-transparent bg-transparent text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none text-sm transition-colors"
              >
                <PenLine className="w-3.5 h-3.5" />
                Timeline
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="gap-1.5 px-3 h-9 rounded-none border-b-2 border-transparent bg-transparent text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none text-sm transition-colors"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                Calendar
              </TabsTrigger>
              <TabsTrigger
                value="moods"
                className="gap-1.5 px-3 h-9 rounded-none border-b-2 border-transparent bg-transparent text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none text-sm transition-colors"
              >
                <Heart className="w-3.5 h-3.5" />
                Moods
              </TabsTrigger>
              <TabsTrigger
                value="prompts"
                className="gap-1.5 px-3 h-9 rounded-none border-b-2 border-transparent bg-transparent text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none text-sm transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Prompts
              </TabsTrigger>
            </TabsList>

            {/* Content area */}
            <div className="overflow-auto" style={{ height: "calc(100vh - 120px)" }}>
              <TabsContent value="timeline" className="mt-0 h-full">
                <TimelineView
                  entries={data.entries}
                  tags={data.tags}
                  prompts={data.prompts}
                  isLoading={data.isLoading}
                  onCreateEntry={data.createEntry}
                  onUpdateEntry={data.updateEntry}
                  onDeleteEntry={data.deleteEntry}
                />
              </TabsContent>
              <TabsContent value="calendar" className="mt-0 h-full">
                <CalendarView
                  entries={data.entries}
                  tags={data.tags}
                  isLoading={data.isLoading}
                  onUpdateEntry={data.updateEntry}
                  onDeleteEntry={data.deleteEntry}
                />
              </TabsContent>
              <TabsContent value="moods" className="mt-0 h-full">
                <MoodInsightsView entries={data.entries} isLoading={data.isLoading} />
              </TabsContent>
              <TabsContent value="prompts" className="mt-0 h-full">
                <PromptsView
                  prompts={data.prompts}
                  entries={data.entries}
                  tags={data.tags}
                  isLoading={data.isLoading}
                  onCreateEntry={data.createEntry}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </header>

      <ConnectionStatus status={data.status} />
    </div>
  );
}
