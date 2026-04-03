import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@campshell/ui-components";
import { FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Page } from "../types.js";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog.js";
import { EmptyState } from "./EmptyState.js";
import { PageFormDialog } from "./PageFormDialog.js";

interface PagesViewProps {
  pages: Page[];
  onCreatePage: (p: Page) => void;
  onUpdatePage: (p: Page) => void;
  onDeletePage: (id: string) => void;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  planned: { label: "Planned", variant: "outline" },
  drafting: { label: "Drafting", variant: "secondary" },
  review: { label: "Review", variant: "secondary" },
  published: { label: "Published", variant: "default" },
  "needs-refresh": { label: "Needs Refresh", variant: "destructive" },
};

const contentTypeLabels: Record<string, string> = {
  blog: "Blog",
  landing: "Landing",
  guide: "Guide",
  tool: "Tool",
  other: "Other",
};

export function PagesView({ pages, onCreatePage, onUpdatePage, onDeletePage }: PagesViewProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null);

  if (pages.length === 0) {
    return (
      <>
        <EmptyState
          icon={FileText}
          title="No pages yet"
          description="Track your content performance by adding pages you want to monitor."
          actionLabel="Add Page"
          onAction={() => {
            setEditingPage(null);
            setFormOpen(true);
          }}
        />
        <PageFormDialog open={formOpen} onOpenChange={setFormOpen} page={null} onSave={onCreatePage} />
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {pages.map((page) => {
          const st = statusConfig[page.status ?? "planned"];

          return (
            <Card
              key={page.id}
              className="group cursor-pointer transition-colors hover:border-border"
              onClick={() => {
                setEditingPage(page);
                setFormOpen(true);
              }}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="space-y-1 min-w-0 flex-1 pr-2">
                  <h3 className="font-medium text-sm leading-snug line-clamp-1">{page.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">{page.pageUrl}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPage(page);
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
                        setDeleteTarget(page);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={st.variant} className="text-xs font-normal">
                    {st.label}
                  </Badge>
                  {page.contentType && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {contentTypeLabels[page.contentType] ?? page.contentType}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {page.organicTraffic != null && (
                    <span>
                      <span className="font-medium text-foreground">{page.organicTraffic.toLocaleString()}</span>{" "}
                      visits/mo
                    </span>
                  )}
                  {page.avgPosition != null && (
                    <span>
                      Pos <span className="font-medium text-foreground">{page.avgPosition.toFixed(1)}</span>
                    </span>
                  )}
                  {page.wordCount != null && (
                    <span>{page.wordCount.toLocaleString()} words</span>
                  )}
                </div>

                {page.publishDate && (
                  <p className="text-xs text-muted-foreground/70">
                    Published {page.publishDate}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <PageFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingPage(null);
        }}
        page={editingPage}
        onSave={(p) => {
          if (editingPage) {
            onUpdatePage(p);
          } else {
            onCreatePage(p);
          }
        }}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete page"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={() => deleteTarget && onDeletePage(deleteTarget.id)}
      />
    </>
  );
}
