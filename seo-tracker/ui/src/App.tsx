import { useState } from "react";
import { Button } from "@campshell/ui-components";
import {
  AlertTriangle,
  FileText,
  Link,
  Plus,
  Search,
  Users,
} from "lucide-react";
import type { UseSeoTrackerDataReturn } from "./hooks/useSeoTrackerData.js";
import { ConnectionStatus } from "./components/ConnectionStatus.js";
import { MetricCard } from "./components/MetricCard.js";
import { KeywordsView } from "./components/KeywordsView.js";
import { PagesView } from "./components/PagesView.js";
import { BacklinksView } from "./components/BacklinksView.js";
import { CompetitorsView } from "./components/CompetitorsView.js";
import { IssuesView } from "./components/IssuesView.js";

type View = "keywords" | "pages" | "backlinks" | "competitors" | "issues";

interface AppProps {
  data: UseSeoTrackerDataReturn;
}

const navItems: { id: View; label: string; icon: typeof Search }[] = [
  { id: "keywords", label: "Keywords", icon: Search },
  { id: "pages", label: "Pages", icon: FileText },
  { id: "backlinks", label: "Backlinks", icon: Link },
  { id: "competitors", label: "Competitors", icon: Users },
  { id: "issues", label: "Issues", icon: AlertTriangle },
];

const ctaLabels: Record<View, string> = {
  keywords: "Add Keyword",
  pages: "Add Page",
  backlinks: "Add Backlink",
  competitors: "Add Competitor",
  issues: "Report Issue",
};

export function App({ data }: AppProps) {
  const [activeView, setActiveView] = useState<View>("keywords");
  const [formTrigger, setFormTrigger] = useState(0);

  // Compute summary metrics
  const trackingKeywords = data.keywords.filter((k) => k.status !== "paused").length;
  const avgPosition =
    data.keywords.length > 0
      ? data.keywords.reduce((sum, k) => sum + (k.position ?? 0), 0) / data.keywords.length
      : 0;
  const activeBacklinks = data.backlinks.filter((b) => b.status === "active" || !b.status).length;
  const openIssues = data.issues.filter((i) => i.status !== "resolved").length;

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-8">
          <h1 className="text-lg font-semibold tracking-tight">SEO Tracker</h1>
          <nav className="flex items-center gap-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeView === id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveView(id)}
                className="gap-2"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ))}
          </nav>
        </div>
        <Button
          size="sm"
          onClick={() => setFormTrigger((n) => n + 1)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          {ctaLabels[activeView]}
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">
          {/* Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Tracked Keywords"
              value={trackingKeywords}
              subtitle={`${data.keywords.length} total`}
            />
            <MetricCard
              label="Avg Position"
              value={avgPosition > 0 ? avgPosition.toFixed(1) : "--"}
              subtitle="Across all keywords"
            />
            <MetricCard
              label="Active Backlinks"
              value={activeBacklinks}
              subtitle={`${data.backlinks.length} total`}
            />
            <MetricCard
              label="Open Issues"
              value={openIssues}
              subtitle={`${data.issues.length} total`}
            />
          </div>

          {/* Active View */}
          {activeView === "keywords" && (
            <KeywordsView
              key={formTrigger}
              keywords={data.keywords}
              pages={data.pages}
              onCreateKeyword={data.createKeyword}
              onUpdateKeyword={data.updateKeyword}
              onDeleteKeyword={data.deleteKeyword}
            />
          )}

          {activeView === "pages" && (
            <PagesView
              key={formTrigger}
              pages={data.pages}
              onCreatePage={data.createPage}
              onUpdatePage={data.updatePage}
              onDeletePage={data.deletePage}
            />
          )}

          {activeView === "backlinks" && (
            <BacklinksView
              key={formTrigger}
              backlinks={data.backlinks}
              pages={data.pages}
              onCreateBacklink={data.createBacklink}
              onUpdateBacklink={data.updateBacklink}
              onDeleteBacklink={data.deleteBacklink}
            />
          )}

          {activeView === "competitors" && (
            <CompetitorsView
              key={formTrigger}
              competitors={data.competitors}
              onUpdateCompetitors={data.updateCompetitors}
            />
          )}

          {activeView === "issues" && (
            <IssuesView
              key={formTrigger}
              issues={data.issues}
              onCreateIssue={data.createIssue}
              onUpdateIssue={data.updateIssue}
              onDeleteIssue={data.deleteIssue}
            />
          )}
        </div>
      </main>

      <ConnectionStatus status={data.status} />
    </div>
  );
}
