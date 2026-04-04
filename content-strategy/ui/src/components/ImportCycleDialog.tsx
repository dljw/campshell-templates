import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@campshell/ui-components";
import { AlertCircle, Check, FileUp, Loader2, Upload, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { UseContentStrategyDataReturn } from "../hooks/useContentStrategyData.js";
import { type GscFileSet, buildKeywordActions, identifyGscFile, parseGscCsvs } from "../lib/csv-parser.js";
import type { Cycle, KeywordImportAction, Keyword, ParsedGscData } from "../types.js";
import { ImportPreview } from "./ImportPreview.js";

interface ImportCycleDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: UseContentStrategyDataReturn;
	domainId: string | null;
}

type Step = "select" | "preview" | "importing" | "done";

interface SelectedFiles {
	queries?: File;
	pages?: File;
	chart?: File;
	filters?: File;
}

export function ImportCycleDialog({ open, onOpenChange, data, domainId }: ImportCycleDialogProps) {
	const [step, setStep] = useState<Step>("select");
	const [selectedFiles, setSelectedFiles] = useState<SelectedFiles>({});
	const [parsed, setParsed] = useState<ParsedGscData | null>(null);
	const [keywordActions, setKeywordActions] = useState<KeywordImportAction[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [progress, setProgress] = useState({ done: 0, total: 0 });

	const previousCycle = useMemo(() => {
		const sorted = [...data.cycles].sort((a, b) => b.cycleDate.localeCompare(a.cycleDate));
		return sorted[0] ?? null;
	}, [data.cycles]);

	const canParse = selectedFiles.queries && selectedFiles.pages;

	const handleFiles = useCallback((files: FileList | File[]) => {
		const newFiles = { ...selectedFiles };
		for (const file of files) {
			const type = identifyGscFile(file);
			if (type) {
				newFiles[type] = file;
			}
		}
		setSelectedFiles(newFiles);
		setError(null);
	}, [selectedFiles]);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		handleFiles(e.dataTransfer.files);
	}, [handleFiles]);

	const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) handleFiles(e.target.files);
	}, [handleFiles]);

	const handleParse = useCallback(async () => {
		if (!selectedFiles.queries || !selectedFiles.pages) return;
		setError(null);
		try {
			const fileSet: GscFileSet = {
				queries: selectedFiles.queries,
				pages: selectedFiles.pages,
				chart: selectedFiles.chart,
				filters: selectedFiles.filters,
			};
			const result = await parseGscCsvs(fileSet);
			const actions = buildKeywordActions(result.querySnapshots, data.keywords);
			setParsed(result);
			setKeywordActions(actions);
			setStep("preview");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to parse CSV files");
		}
	}, [selectedFiles, data.keywords]);

	const handleImport = useCallback(async () => {
		if (!parsed) return;
		setStep("importing");

		const now = new Date().toISOString();
		const cycleDate = parsed.periodEnd || now.split("T")[0];
		const cycleId = cycleDate;

		// Count quadrants
		const quadrantCounts = { stars: 0, quickWins: 0, ctrOpportunities: 0, longTermTargets: 0, earlySignals: 0, dogs: 0 };
		for (const action of keywordActions) {
			if (action.quadrant === "star") quadrantCounts.stars++;
			else if (action.quadrant === "quick-win") quadrantCounts.quickWins++;
			else if (action.quadrant === "ctr-opportunity") quadrantCounts.ctrOpportunities++;
			else if (action.quadrant === "long-term-target") quadrantCounts.longTermTargets++;
			else if (action.quadrant === "early-signal") quadrantCounts.earlySignals++;
			else quadrantCounts.dogs++;
		}

		// 1. Create cycle
		const cycle: Cycle = {
			id: cycleId,
			createdAt: now,
			cycleDate,
			periodStart: parsed.periodStart,
			periodEnd: parsed.periodEnd,
			sitewide: parsed.sitewide,
			dailyTrend: parsed.dailyTrend,
			quadrantCounts,
			pageSnapshots: parsed.pageSnapshots,
			querySnapshots: parsed.querySnapshots,
			...(domainId ? { domainId } : {}),
		};

		data.createCycle(cycle);
		const total = keywordActions.length + 1;
		setProgress({ done: 1, total });

		// 2. Create/update keywords
		for (let i = 0; i < keywordActions.length; i++) {
			const action = keywordActions[i];
			if (action.type === "update") {
				const existing = data.keywords.find((k) => k.id === action.keywordId);
				if (existing) {
					const updated: Keyword = {
						...existing,
						updatedAt: now,
						impressions: action.impressions,
						clicks: action.clicks,
						ctr: action.ctr,
						position: action.position,
						previousPosition: action.previousPosition,
						quadrant: action.quadrant,
					};
					data.updateKeyword(updated);
				}
			} else {
				const newKeyword: Keyword = {
					id: action.keywordId,
					createdAt: now,
					term: action.term,
					impressions: action.impressions,
					clicks: action.clicks,
					ctr: action.ctr,
					position: action.position,
					quadrant: action.quadrant,
					status: "tracking",
					...(domainId ? { domainId } : {}),
				};
				data.createKeyword(newKeyword);
			}
			setProgress({ done: i + 2, total });
		}

		setStep("done");
		toast.success(`Imported cycle ${cycleDate} with ${keywordActions.length} keywords`);
	}, [parsed, keywordActions, data, domainId]);

	const handleClose = useCallback(() => {
		setStep("select");
		setSelectedFiles({});
		setParsed(null);
		setKeywordActions([]);
		setError(null);
		setProgress({ done: 0, total: 0 });
		onOpenChange(false);
	}, [onOpenChange]);

	const fileStatus = (type: keyof SelectedFiles, label: string, required: boolean) => {
		const file = selectedFiles[type];
		return (
			<div className="flex items-center gap-2 text-sm">
				{file ? (
					<Check className="h-4 w-4 text-green-500" />
				) : (
					<span className={`h-4 w-4 rounded-full border ${required ? "border-orange-400" : "border-border"}`} />
				)}
				<span className={file ? "font-medium" : "text-muted-foreground"}>
					{file ? file.name : `${label}${required ? " (required)" : " (optional)"}`}
				</span>
			</div>
		);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Upload className="h-5 w-5" />
						Import GSC Cycle
					</DialogTitle>
				</DialogHeader>

				{step === "select" && (
					<div className="space-y-4">
						{/* Domain warning */}
						{!domainId && (
							<div className="flex items-center gap-2 rounded-md border border-orange-400 bg-orange-50 dark:bg-orange-950/30 px-3 py-2 text-sm text-orange-700 dark:text-orange-400">
								<AlertCircle className="h-4 w-4 shrink-0" />
								Select a domain in the header before importing so this data is tagged correctly.
							</div>
						)}
						{/* Drop zone */}
						<div
							onDrop={handleDrop}
							onDragOver={(e) => e.preventDefault()}
							className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
							onClick={() => document.getElementById("gsc-file-input")?.click()}
						>
							<FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
							<p className="text-sm text-muted-foreground">Drop GSC CSV files here or click to browse</p>
							<p className="text-xs text-muted-foreground mt-1">Export from Google Search Console → Performance</p>
							<input
								id="gsc-file-input"
								type="file"
								accept=".csv"
								multiple
								className="hidden"
								onChange={handleFileInput}
							/>
						</div>

						{/* File status */}
						<div className="space-y-2">
							{fileStatus("queries", "Queries.csv", true)}
							{fileStatus("pages", "Pages.csv", true)}
							{fileStatus("chart", "Chart.csv", false)}
							{fileStatus("filters", "Filters.csv", false)}
						</div>

						{error && (
							<div className="flex items-center gap-2 text-sm text-red-500">
								<AlertCircle className="h-4 w-4" />
								{error}
							</div>
						)}

						<div className="flex justify-end gap-2">
							<Button variant="ghost" className="text-foreground" onClick={handleClose}>Cancel</Button>
							<Button className="text-foreground" onClick={handleParse} disabled={!canParse || !domainId}>
								Parse & Preview
							</Button>
						</div>
					</div>
				)}

				{step === "preview" && parsed && (
					<div className="space-y-4">
						<ImportPreview parsed={parsed} keywordActions={keywordActions} previousCycle={previousCycle} />
						<div className="flex justify-end gap-2">
							<Button variant="ghost" className="text-foreground" onClick={() => setStep("select")}>Back</Button>
							<Button className="text-foreground" onClick={handleImport}>Import Cycle</Button>
						</div>
					</div>
				)}

				{step === "importing" && (
					<div className="flex flex-col items-center gap-3 py-8">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
						<p className="text-sm text-muted-foreground">
							Importing... {progress.done} / {progress.total}
						</p>
						<div className="w-full max-w-xs h-2 bg-muted rounded-full overflow-hidden">
							<div
								className="h-full bg-primary rounded-full transition-all"
								style={{ width: progress.total > 0 ? `${(progress.done / progress.total) * 100}%` : "0%" }}
							/>
						</div>
					</div>
				)}

				{step === "done" && (
					<div className="flex flex-col items-center gap-3 py-8">
						<div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
							<Check className="h-6 w-6 text-green-600" />
						</div>
						<p className="text-sm font-medium">Import Complete</p>
						<p className="text-xs text-muted-foreground">
							{keywordActions.filter((a) => a.type === "update").length} keywords updated,{" "}
							{keywordActions.filter((a) => a.type === "create").length} new keywords created
						</p>
						<Button onClick={handleClose} className="mt-2 text-foreground">Done</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
