import "./globals.css";
import { Toaster } from "@campshell/ui-components";
import { App } from "./App.js";
import { useContentStrategyData } from "./hooks/useContentStrategyData.js";

export function ContentStrategyDashboard() {
	const data = useContentStrategyData();

	if (data.isLoading) {
		return (
			<div className="h-full bg-background flex items-center justify-center">
				<p className="text-muted-foreground text-sm">Loading\u2026</p>
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

export default ContentStrategyDashboard;
