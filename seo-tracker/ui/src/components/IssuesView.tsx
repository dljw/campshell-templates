import { useState } from "react";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Separator,
} from "@campshell/ui-components";
import {
  AlertTriangle,
  Code,
  Globe,
  MoreHorizontal,
  Pencil,
  Shield,
  Smartphone,
  Trash2,
  Zap,
} from "lucide-react";
import type { Issue, IssuePriority } from "../types.js";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog.js";
import { EmptyState } from "./EmptyState.js";
import { IssueFormDialog } from "./IssueFormDialog.js";

interface IssuesViewProps {
  issues: Issue[];
  onCreateIssue: (i: Issue) => void;
  onUpdateIssue: (i: Issue) => void;
  onDeleteIssue: (id: string) => void;
}

const priorityConfig: Record<IssuePriority, { label: string; dot: string; order: number }> = {
  critical: { label: "Critical", dot: "bg-red-500", order: 0 },
  high: { label: "High", dot: "bg-orange-400", order: 1 },
  medium: { label: "Medium", dot: "bg-amber-400", order: 2 },
  low: { label: "Low", dot: "bg-zinc-400", order: 3 },
};

const statusBadge: Record<string, "default" | "secondary" | "outline"> = {
  open: "outline",
  "in-progress": "secondary",
  resolved: "default",
};

const issueTypeIcon: Record<string, typeof Zap> = {
  speed: Zap,
  mobile: Smartphone,
  indexing: Globe,
  structure: Code,
  security: Shield,
  other: AlertTriangle,
};

export function IssuesView({ issues, onCreateIssue, onUpdateIssue, onDeleteIssue }: IssuesViewProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Issue | null>(null);

  if (issues.length === 0) {
    return (
      <>
        <EmptyState
          icon={AlertTriangle}
          title="No issues found"
          description="Track technical SEO issues that need attention across your site."
          actionLabel="Report Issue"
          onAction={() => {
            setEditingIssue(null);
            setFormOpen(true);
          }}
        />
        <IssueFormDialog open={formOpen} onOpenChange={setFormOpen} issue={null} onSave={onCreateIssue} />
      </>
    );
  }

  // Group by priority
  const grouped = issues.reduce(
    (acc, issue) => {
      const p = issue.priority ?? "medium";
      if (!acc[p]) acc[p] = [];
      acc[p].push(issue);
      return acc;
    },
    {} as Record<string, Issue[]>,
  );

  const sortedPriorities = Object.keys(grouped).sort(
    (a, b) => (priorityConfig[a as IssuePriority]?.order ?? 4) - (priorityConfig[b as IssuePriority]?.order ?? 4),
  );

  return (
    <>
      <div className="space-y-8">
        {sortedPriorities.map((priority, idx) => {
          const config = priorityConfig[priority as IssuePriority];
          const group = grouped[priority];

          return (
            <div key={priority}>
              {idx > 0 && <Separator className="mb-8" />}
              <div className="flex items-center gap-2 mb-4">
                <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {config.label}
                </h3>
                <span className="text-xs text-muted-foreground/60 ml-1">({group.length})</span>
              </div>

              <div className="space-y-2">
                {group.map((issue) => {
                  const Icon = issueTypeIcon[issue.issueType ?? "other"] ?? AlertTriangle;

                  return (
                    <div
                      key={issue.id}
                      className="group flex items-center gap-4 px-4 py-3 rounded-lg border border-border/40 hover:border-border transition-colors cursor-pointer"
                      data-campshell-entity={`seo-tracker/issues/issues/${issue.id}.json`}
                      onClick={() => {
                        setEditingIssue(issue);
                        setFormOpen(true);
                      }}
                    >
                      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{issue.title}</p>
                        {issue.affectedPage && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {issue.affectedPage}
                          </p>
                        )}
                      </div>

                      <Badge
                        variant={statusBadge[issue.status ?? "open"]}
                        className="text-xs font-normal shrink-0"
                      >
                        {issue.status === "in-progress" ? "In Progress" : (issue.status ?? "open")}
                      </Badge>

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
                              setEditingIssue(issue);
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
                              setDeleteTarget(issue);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <IssueFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingIssue(null);
        }}
        issue={editingIssue}
        onSave={(issue) => {
          if (editingIssue) {
            onUpdateIssue(issue);
          } else {
            onCreateIssue(issue);
          }
        }}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete issue"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={() => deleteTarget && onDeleteIssue(deleteTarget.id)}
      />
    </>
  );
}
