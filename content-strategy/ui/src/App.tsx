import { Button } from "@campshell/ui-components";
import {
	BarChart3,
	FileText,
	GitBranch,
	LayoutList,
	Search,
	Zap,
} from "lucide-react";
import { useState } from "react";
import type { UseContentStrategyDataReturn } from "./hooks/useContentStrategyData.js";
import { ConnectionStatus } from "./components/ConnectionStatus.js";
import { DomainPicker } from "./components/DomainPicker.js";
import { OverviewView } from "./components/OverviewView.js";
import { PipelineView } from "./components/PipelineView.js";
import { KeywordsView } from "./components/KeywordsView.js";
import { ArticlesView } from "./components/ArticlesView.js";
import { TrendsView } from "./components/TrendsView.js";
import { ActionsView } from "./components/ActionsView.js";
import { HubsView } from "./components/HubsView.js";

type Tab = "overview" | "pipeline" | "keywords" | "articles" | "trends" | "actions" | "hubs";

interface AppProps {
	data: UseContentStrategyDataReturn;
}

const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
	{ id: "overview", label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
	{ id: "pipeline", label: "Pipeline", icon: <LayoutList className="h-4 w-4" /> },
	{ id: "keywords", label: "Keywords", icon: <Search className="h-4 w-4" /> },
	{ id: "articles", label: "Articles", icon: <FileText className="h-4 w-4" /> },
	{ id: "trends", label: "Trends", icon: <BarChart3 className="h-4 w-4" /> },
	{ id: "actions", label: "Actions", icon: <Zap className="h-4 w-4" /> },
	{ id: "hubs", label: "Hubs", icon: <GitBranch className="h-4 w-4" /> },
];

export function App({ data }: AppProps) {
	const [tab, setTab] = useState<Tab>("overview");
	const [activeDomainId, setActiveDomainId] = useState<string | null>(null);

	const activeDomain = data.domains.find((d) => d.id === activeDomainId);

	return (
		<div className="flex flex-col h-full bg-background text-foreground">
			{/* Header */}
			<header className="flex items-center px-6 py-3 border-b border-border/40 shrink-0 gap-4">
				<h1 className="text-base font-semibold tracking-tight">Content Strategy</h1>
				<DomainPicker
					domains={data.domains}
					activeDomainId={activeDomainId}
					onSelect={setActiveDomainId}
					onUpdateDomains={data.updateDomains}
				/>
				<nav className="flex items-center gap-1 ml-auto">
					{TABS.map((t) => (
						<Button
							key={t.id}
							variant={tab === t.id ? "secondary" : "ghost"}
							size="sm"
							onClick={() => setTab(t.id)}
							className="gap-1.5 text-foreground"
						>
							{t.icon}
							<span className="hidden sm:inline">{t.label}</span>
						</Button>
					))}
				</nav>
			</header>

			{/* Content */}
			<main className="flex-1 overflow-auto p-6">
				<div className="max-w-7xl mx-auto">
					{tab === "overview" && <OverviewView data={data} domainId={activeDomainId} activeDomain={activeDomain} />}
					{tab === "pipeline" && <PipelineView data={data} domainId={activeDomainId} />}
					{tab === "keywords" && <KeywordsView data={data} domainId={activeDomainId} />}
					{tab === "articles" && <ArticlesView data={data} domainId={activeDomainId} activeDomain={activeDomain} />}
					{tab === "trends" && <TrendsView data={data} domainId={activeDomainId} />}
					{tab === "actions" && <ActionsView data={data} domainId={activeDomainId} activeDomain={activeDomain} />}
					{tab === "hubs" && <HubsView data={data} domainId={activeDomainId} />}
				</div>
			</main>

			<ConnectionStatus status={data.status} />
		</div>
	);
}
