import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@campshell/ui-components";
import { Globe, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import type { Domain } from "../types.js";

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
	const [formName, setFormName] = useState("");
	const [formDomain, setFormDomain] = useState("");
	const [formBasePath, setFormBasePath] = useState("");

	const activeDomain = domains.find((d) => d.id === activeDomainId);
	const label = activeDomain ? activeDomain.name : "All Domains";

	const handleAdd = useCallback(() => {
		if (!formName.trim()) return;
		const id = formName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 36);
		const newDomain: Domain = {
			id,
			createdAt: new Date().toISOString(),
			name: formName.trim(),
			domain: formDomain.trim() || undefined,
			basePath: formBasePath.trim() || undefined,
		};
		onUpdateDomains([...domains, newDomain]);
		setFormName("");
		setFormDomain("");
		setFormBasePath("");
	}, [formName, formDomain, formBasePath, domains, onUpdateDomains]);

	const handleDelete = useCallback((id: string) => {
		onUpdateDomains(domains.filter((d) => d.id !== id));
		if (activeDomainId === id) onSelect(null);
	}, [domains, activeDomainId, onSelect, onUpdateDomains]);

	const handleSaveEdit = useCallback(() => {
		if (!editingDomain) return;
		onUpdateDomains(domains.map((d) =>
			d.id === editingDomain.id ? { ...editingDomain, name: formName, domain: formDomain, basePath: formBasePath } : d,
		));
		setEditingDomain(null);
	}, [editingDomain, formName, formDomain, formBasePath, domains, onUpdateDomains]);

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
			<Dialog open={manageOpen} onOpenChange={setManageOpen}>
				<DialogContent className="max-w-md flex flex-col overflow-hidden">
					<DialogHeader>
						<DialogTitle>Manage Domains</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 overflow-y-auto min-h-0">
						{/* Existing domains */}
						{domains.length > 0 && (
							<div className="space-y-2 max-h-48 overflow-y-auto">
								{domains.map((d) => (
									<div key={d.id} className="flex items-center gap-2 rounded-md border border-border p-2">
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium truncate">{d.name}</p>
											{d.domain && <p className="text-xs text-muted-foreground truncate">{d.domain}</p>}
											{d.basePath && <p className="text-xs text-muted-foreground truncate">{d.basePath}</p>}
										</div>
										<Button
											variant="ghost"
											size="sm"
											className="text-foreground"
											onClick={() => {
												setEditingDomain(d);
												setFormName(d.name);
												setFormDomain(d.domain ?? "");
												setFormBasePath(d.basePath ?? "");
											}}
										>
											<Pencil className="h-3 w-3" />
										</Button>
										<Button variant="ghost" size="sm" className="text-foreground" onClick={() => handleDelete(d.id)}>
											<Trash2 className="h-3 w-3 text-red-500" />
										</Button>
									</div>
								))}
							</div>
						)}

						{/* Add/edit form */}
						<div className="space-y-2 border-t border-border pt-3">
							<p className="text-xs font-medium text-muted-foreground">
								{editingDomain ? "Edit Domain" : "Add Domain"}
							</p>
							<input
								type="text"
								placeholder="Display name (e.g., My Blog)"
								value={formName}
								onChange={(e) => setFormName(e.target.value)}
								className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
							/>
							<input
								type="text"
								placeholder="Domain (e.g., myblog.com)"
								value={formDomain}
								onChange={(e) => setFormDomain(e.target.value)}
								className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
							/>
							<input
								type="text"
								placeholder="Project path (e.g., /Users/me/projects/blog)"
								value={formBasePath}
								onChange={(e) => setFormBasePath(e.target.value)}
								className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
							/>
							{editingDomain ? (
								<div className="flex gap-2">
									<Button size="sm" className="text-foreground" onClick={handleSaveEdit} disabled={!formName.trim()}>Save</Button>
									<Button size="sm" variant="ghost" className="text-foreground" onClick={() => { setEditingDomain(null); setFormName(""); setFormDomain(""); setFormBasePath(""); }}>Cancel</Button>
								</div>
							) : (
								<Button size="sm" onClick={handleAdd} disabled={!formName.trim()} className="gap-1 text-foreground">
									<Plus className="h-3 w-3" /> Add Domain
								</Button>
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
