import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@campshell/ui-components";
import { Globe, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import type { ArticleFormat, Domain } from "../types.js";
import { ArticleFormatEditor } from "./ArticleFormatEditor.js";

interface DomainPickerProps {
	domains: Domain[];
	activeDomainId: string | null;
	onSelect: (domainId: string | null) => void;
	onUpdateDomains: (domains: Domain[]) => void;
}

export function DomainPicker({ domains, activeDomainId, onSelect, onUpdateDomains }: DomainPickerProps) {
	const [open, setOpen] = useState(false);
	const [manageOpen, setManageOpen] = useState(false);
	const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
	const [addingNew, setAddingNew] = useState(false);
	const [formName, setFormName] = useState("");
	const [formDomain, setFormDomain] = useState("");
	const [formBasePath, setFormBasePath] = useState("");
	const [formArticlesDir, setFormArticlesDir] = useState("");
	const [formArticleFormat, setFormArticleFormat] = useState<ArticleFormat | undefined>(undefined);

	const activeDomain = domains.find((d) => d.id === activeDomainId);
	const label = activeDomain ? activeDomain.name : "All Domains";
	const showForm = addingNew || editingDomain !== null;

	const resetForm = useCallback(() => {
		setEditingDomain(null);
		setAddingNew(false);
		setFormName("");
		setFormDomain("");
		setFormBasePath("");
		setFormArticlesDir("");
		setFormArticleFormat(undefined);
	}, []);

	const handleAdd = useCallback(() => {
		if (!formName.trim()) return;
		const id = formName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 36);
		const newDomain: Domain = {
			id,
			createdAt: new Date().toISOString(),
			name: formName.trim(),
			domain: formDomain.trim() || undefined,
			basePath: formBasePath.trim() || undefined,
			articlesDir: formArticlesDir.trim() || undefined,
			articleFormat: formArticleFormat,
		};
		onUpdateDomains([...domains, newDomain]);
		resetForm();
	}, [formName, formDomain, formBasePath, formArticlesDir, formArticleFormat, domains, onUpdateDomains, resetForm]);

	const handleDelete = useCallback((id: string) => {
		onUpdateDomains(domains.filter((d) => d.id !== id));
		if (activeDomainId === id) onSelect(null);
	}, [domains, activeDomainId, onSelect, onUpdateDomains]);

	const handleSaveEdit = useCallback(() => {
		if (!editingDomain) return;
		onUpdateDomains(domains.map((d) =>
			d.id === editingDomain.id ? {
				...editingDomain,
				name: formName,
				domain: formDomain,
				basePath: formBasePath,
				articlesDir: formArticlesDir.trim() || undefined,
				articleFormat: formArticleFormat,
			} : d,
		));
		resetForm();
	}, [editingDomain, formName, formDomain, formBasePath, formArticlesDir, formArticleFormat, domains, onUpdateDomains, resetForm]);

	return (
		<>
			{/* Dropdown trigger */}
			<div className="relative">
				<Button
					variant="outline"
					size="sm"
					onClick={() => setOpen(!open)}
					className="gap-1.5 text-foreground"
				>
					<Globe className="h-3.5 w-3.5" />
					<span className="max-w-[120px] truncate">{label}</span>
				</Button>

				{open && (
					<div className="absolute top-full left-0 mt-1 z-50 min-w-[180px] rounded-md border border-border bg-background shadow-md py-1">
						<button
							type="button"
							className={`w-full text-left px-3 py-1.5 text-sm text-foreground hover:bg-muted ${activeDomainId === null ? "font-medium" : ""}`}
							onClick={() => { onSelect(null); setOpen(false); }}
						>
							All Domains
						</button>
						{domains.map((d) => (
							<button
								key={d.id}
								type="button"
								className={`w-full text-left px-3 py-1.5 text-sm text-foreground hover:bg-muted ${activeDomainId === d.id ? "font-medium" : ""}`}
								onClick={() => { onSelect(d.id); setOpen(false); }}
							>
								{d.name}
								{d.domain && <span className="text-xs text-muted-foreground ml-1">({d.domain})</span>}
							</button>
						))}
						<div className="border-t border-border mt-1 pt-1">
							<button
								type="button"
								className="w-full text-left px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
								onClick={() => { setManageOpen(true); setOpen(false); }}
							>
								Manage domains...
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Manage dialog */}
			<Dialog open={manageOpen} onOpenChange={(v) => { if (!v) resetForm(); setManageOpen(v); }}>
				<DialogContent className="max-w-lg flex flex-col overflow-hidden">
					<DialogHeader>
						<DialogTitle>
							{showForm
								? editingDomain ? `Edit "${editingDomain.name}"` : "Add Domain"
								: "Manage Domains"}
						</DialogTitle>
					</DialogHeader>

					{/* Domain list view */}
					{!showForm && (
						<div className="flex flex-col gap-3 min-h-0">
							{domains.length === 0 ? (
								<p className="text-sm text-muted-foreground py-4 text-center">No domains yet.</p>
							) : (
								<div className="flex flex-col gap-2 overflow-y-auto max-h-72 pr-0.5">
									{domains.map((d) => (
										<div key={d.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
											<div className="flex-1 min-w-0 flex flex-col gap-1">
												<p className="text-sm font-medium leading-none">{d.name}</p>
												<div className="flex flex-wrap gap-x-3">
													{d.domain && (
														<span className="text-xs text-muted-foreground">{d.domain}</span>
													)}
													{d.basePath && (
														<span className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">{d.basePath}</span>
													)}
												</div>
											</div>
											<div className="flex items-center gap-1 shrink-0">
												<Button
													variant="ghost"
													size="sm"
													className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
													onClick={() => {
														setEditingDomain(d);
														setFormName(d.name);
														setFormDomain(d.domain ?? "");
														setFormBasePath(d.basePath ?? "");
														setFormArticlesDir(d.articlesDir ?? "");
														setFormArticleFormat(d.articleFormat);
													}}
												>
													<Pencil className="h-3.5 w-3.5" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
													onClick={() => handleDelete(d.id)}
												>
													<Trash2 className="h-3.5 w-3.5" />
												</Button>
											</div>
										</div>
									))}
								</div>
							)}
							<Button
								variant="outline"
								size="sm"
								onClick={() => setAddingNew(true)}
								className="gap-1.5 self-start"
							>
								<Plus className="h-3.5 w-3.5" /> Add Domain
							</Button>
						</div>
					)}

					{/* Add / edit form view */}
					{showForm && (
						<div className="flex flex-col min-h-0 overflow-hidden">
							<div className="flex-1 overflow-y-auto flex flex-col gap-5 pr-1 pb-4">
								{/* Core fields */}
								<div className="flex flex-col gap-4">
									<div className="flex flex-col gap-1.5">
										<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Display name</label>
										<input
											type="text"
											placeholder="e.g., My Blog"
											value={formName}
											onChange={(e) => setFormName(e.target.value)}
											className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
											autoFocus
										/>
									</div>
									<div className="flex flex-col gap-1.5">
										<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Domain</label>
										<input
											type="text"
											placeholder="e.g., myblog.com"
											value={formDomain}
											onChange={(e) => setFormDomain(e.target.value)}
											className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
										/>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div className="flex flex-col gap-1.5">
											<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Project path</label>
											<input
												type="text"
												placeholder="/Users/me/projects/blog"
												value={formBasePath}
												onChange={(e) => setFormBasePath(e.target.value)}
												className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground font-mono"
											/>
										</div>
										<div className="flex flex-col gap-1.5">
											<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Articles dir</label>
											<input
												type="text"
												placeholder="content/blog/"
												value={formArticlesDir}
												onChange={(e) => setFormArticlesDir(e.target.value)}
												className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground font-mono"
											/>
										</div>
									</div>
								</div>

								{/* Article Format — visually separated */}
								<div className="pt-1 border-t border-border/60">
									<ArticleFormatEditor
										value={formArticleFormat}
										onChange={setFormArticleFormat}
									/>
								</div>
							</div>

							{/* Footer actions — always visible */}
							<div className="flex gap-2 pt-3 border-t border-border shrink-0">
								{editingDomain ? (
									<Button size="sm" onClick={handleSaveEdit} disabled={!formName.trim()}>Save changes</Button>
								) : (
									<Button size="sm" onClick={handleAdd} disabled={!formName.trim()} className="gap-1.5">
										<Plus className="h-3.5 w-3.5" /> Add Domain
									</Button>
								)}
								<Button size="sm" variant="ghost" onClick={resetForm}>Cancel</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
