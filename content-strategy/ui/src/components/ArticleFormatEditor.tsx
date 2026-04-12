import { Button } from "@campshell/ui-components";
import { ChevronDown, ChevronRight, GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ArticleFormat, ArticleFormatSection } from "../types.js";

interface ArticleFormatEditorProps {
	value: ArticleFormat | undefined;
	onChange: (format: ArticleFormat) => void;
}

export function ArticleFormatEditor({ value, onChange }: ArticleFormatEditorProps) {
	const [expanded, setExpanded] = useState(false);
	const format = value ?? {};
	const sections = format.sections ?? [];

	const update = (patch: Partial<ArticleFormat>) => {
		onChange({ ...format, ...patch });
	};

	const updateSection = (index: number, patch: Partial<ArticleFormatSection>) => {
		const next = [...sections];
		next[index] = { ...next[index], ...patch };
		update({ sections: next });
	};

	const addSection = () => {
		update({ sections: [...sections, { name: "" }] });
	};

	const removeSection = (index: number) => {
		update({ sections: sections.filter((_, i) => i !== index) });
	};

	const moveSection = (from: number, to: number) => {
		if (to < 0 || to >= sections.length) return;
		const next = [...sections];
		const [item] = next.splice(from, 1);
		next.splice(to, 0, item);
		update({ sections: next });
	};

	return (
		<div className="rounded-md border border-border/60 bg-muted/20">
			<button
				type="button"
				className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground w-full px-3 h-10"
				onClick={() => setExpanded(!expanded)}
			>
				{expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
				<span className="uppercase tracking-wide">Article Format</span>
				{format.name && <span className="text-foreground normal-case tracking-normal font-normal ml-0.5">— {format.name}</span>}
			</button>

			{expanded && (
				<div className="flex flex-col gap-4 px-3 pb-3 pt-1 border-t border-border/60">
					<div className="grid grid-cols-2 gap-3">
						<div className="flex flex-col gap-1.5">
							<label className="text-xs text-muted-foreground">Format name</label>
							<input
								type="text"
								placeholder="e.g., Blog Post"
								value={format.name ?? ""}
								onChange={(e) => update({ name: e.target.value || undefined })}
								className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<label className="text-xs text-muted-foreground">Default word count</label>
							<input
								type="number"
								placeholder="e.g., 1500"
								min={0}
								value={format.defaultWordCount ?? ""}
								onChange={(e) => update({ defaultWordCount: e.target.value ? Number.parseInt(e.target.value) : undefined })}
								className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
							/>
						</div>
					</div>

					{/* Sections */}
					<div className="flex flex-col gap-2">
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sections</p>
						{sections.map((section, i) => (
							<div key={i} className="flex items-start gap-2 rounded-md border border-border/60 bg-background p-2.5">
								<button
									type="button"
									className="mt-1 text-muted-foreground hover:text-foreground shrink-0"
									onClick={() => moveSection(i, i - 1)}
									disabled={i === 0}
								>
									<GripVertical className="h-3.5 w-3.5" />
								</button>
								<div className="flex-1 flex flex-col gap-2">
									<div className="flex items-center gap-2">
										<input
											type="text"
											placeholder="Section name"
											value={section.name}
											onChange={(e) => updateSection(i, { name: e.target.value })}
											className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
										/>
										<label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
											<input
												type="checkbox"
												checked={section.required ?? false}
												onChange={(e) => updateSection(i, { required: e.target.checked || undefined })}
												className="rounded"
											/>
											Required
										</label>
									</div>
									<input
										type="text"
										placeholder="Description (optional)"
										value={section.description ?? ""}
										onChange={(e) => updateSection(i, { description: e.target.value || undefined })}
										className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
									/>
									<input
										type="text"
										placeholder="Guidance notes (optional)"
										value={section.guidanceNotes ?? ""}
										onChange={(e) => updateSection(i, { guidanceNotes: e.target.value || undefined })}
										className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground"
									/>
								</div>
								<Button
									variant="ghost"
									size="sm"
									className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-destructive"
									onClick={() => removeSection(i)}
								>
									<Trash2 className="h-3.5 w-3.5" />
								</Button>
							</div>
						))}
						<Button
							variant="outline"
							size="sm"
							onClick={addSection}
							className="gap-1.5 text-xs"
						>
							<Plus className="h-3.5 w-3.5" /> Add Section
						</Button>
					</div>

					{/* Frontmatter fields */}
					<div className="flex flex-col gap-1.5">
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Frontmatter Fields</p>
						<input
							type="text"
							placeholder="Comma-separated (e.g., author, category, tags)"
							value={(format.frontmatterFields ?? []).join(", ")}
							onChange={(e) => {
								const fields = e.target.value
									.split(",")
									.map((s) => s.trim())
									.filter(Boolean);
								update({ frontmatterFields: fields.length > 0 ? fields : undefined });
							}}
							className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
						/>
					</div>
				</div>
			)}
		</div>
	);
}
