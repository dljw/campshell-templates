import { useState } from "react";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@campshell/ui-components";
import { MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react";
import type { Keyword, Page } from "../types.js";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog.js";
import { EmptyState } from "./EmptyState.js";
import { KeywordFormDialog } from "./KeywordFormDialog.js";
import { PositionChange } from "./PositionChange.js";

interface KeywordsViewProps {
  keywords: Keyword[];
  pages: Page[];
  domainId: string | null;
  onCreateKeyword: (k: Keyword) => void;
  onUpdateKeyword: (k: Keyword) => void;
  onDeleteKeyword: (id: string) => void;
}

const statusConfig: Record<string, { label: string; dot: string }> = {
  tracking: { label: "Tracking", dot: "bg-emerald-400" },
  paused: { label: "Paused", dot: "bg-amber-400" },
  achieved: { label: "Achieved", dot: "bg-violet-400" },
};

const intentLabels: Record<string, string> = {
  informational: "Info",
  navigational: "Nav",
  commercial: "Commercial",
  transactional: "Transact",
};

export function KeywordsView({
  keywords,
  pages,
  domainId,
  onCreateKeyword,
  onUpdateKeyword,
  onDeleteKeyword,
}: KeywordsViewProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Keyword | null>(null);

  const getPageTitle = (pageId?: string) => {
    if (!pageId) return null;
    return pages.find((p) => p.id === pageId)?.title ?? null;
  };

  if (keywords.length === 0) {
    return (
      <>
        <EmptyState
          icon={Search}
          title="No keywords yet"
          description="Start tracking keyword rankings by adding your first keyword."
          actionLabel="Add Keyword"
          onAction={() => {
            setEditingKeyword(null);
            setFormOpen(true);
          }}
        />
        <KeywordFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          keyword={null}
          pages={pages}
          domainId={domainId}
          onSave={onCreateKeyword}
        />
      </>
    );
  }

  return (
    <>
      <div className="w-full overflow-auto rounded-lg border border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-medium">Term</TableHead>
              <TableHead className="font-medium">Page</TableHead>
              <TableHead className="font-medium text-right w-[100px]">Position</TableHead>
              <TableHead className="font-medium text-right w-[100px]">Volume</TableHead>
              <TableHead className="font-medium w-[120px]">Difficulty</TableHead>
              <TableHead className="font-medium w-[90px]">Intent</TableHead>
              <TableHead className="font-medium w-[110px]">Status</TableHead>
              <TableHead className="w-[40px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {keywords.map((kw) => {
              const pageTitle = getPageTitle(kw.pageId);
              const st = statusConfig[kw.status ?? "tracking"];

              return (
                <TableRow
                  key={kw.id}
                  className="cursor-pointer"
                  data-campshell-entity={`seo-tracker/keywords/keywords/${kw.id}.json`}
                  onClick={() => {
                    setEditingKeyword(kw);
                    setFormOpen(true);
                  }}
                >
                  <TableCell className="font-medium">{kw.term}</TableCell>
                  <TableCell className="text-muted-foreground text-sm truncate max-w-[180px]">
                    {pageTitle ?? <span className="text-muted-foreground/50">--</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <PositionChange current={kw.position} previous={kw.previousPosition} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm">
                    {kw.searchVolume?.toLocaleString() ?? "--"}
                  </TableCell>
                  <TableCell>
                    {kw.difficulty != null ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-foreground/30"
                            style={{ width: `${kw.difficulty}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground w-6 text-right">
                          {kw.difficulty}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50 text-sm">--</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {kw.intent ? (
                      <Badge variant="outline" className="text-xs font-normal">
                        {intentLabels[kw.intent] ?? kw.intent}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground/50 text-sm">--</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingKeyword(kw);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(kw);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <KeywordFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingKeyword(null);
        }}
        keyword={editingKeyword}
        pages={pages}
        domainId={domainId}
        onSave={(kw) => {
          if (editingKeyword) {
            onUpdateKeyword(kw);
          } else {
            onCreateKeyword(kw);
          }
        }}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete keyword"
        description={`Are you sure you want to delete "${deleteTarget?.term}"? This cannot be undone.`}
        onConfirm={() => deleteTarget && onDeleteKeyword(deleteTarget.id)}
      />
    </>
  );
}
