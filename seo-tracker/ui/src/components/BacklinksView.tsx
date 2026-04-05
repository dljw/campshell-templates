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
import { Link, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Backlink, Page } from "../types.js";
import { BacklinkFormDialog } from "./BacklinkFormDialog.js";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog.js";
import { EmptyState } from "./EmptyState.js";

interface BacklinksViewProps {
  backlinks: Backlink[];
  pages: Page[];
  onCreateBacklink: (b: Backlink) => void;
  onUpdateBacklink: (b: Backlink) => void;
  onDeleteBacklink: (id: string) => void;
}

const statusDot: Record<string, string> = {
  active: "bg-emerald-400",
  lost: "bg-red-400",
  disavowed: "bg-zinc-400",
};

const linkTypeBadge: Record<string, "default" | "outline" | "secondary"> = {
  dofollow: "default",
  nofollow: "outline",
  ugc: "secondary",
  sponsored: "secondary",
};

export function BacklinksView({
  backlinks,
  pages,
  onCreateBacklink,
  onUpdateBacklink,
  onDeleteBacklink,
}: BacklinksViewProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingBacklink, setEditingBacklink] = useState<Backlink | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Backlink | null>(null);

  const getPageTitle = (pageId?: string) => {
    if (!pageId) return null;
    return pages.find((p) => p.id === pageId)?.title ?? null;
  };

  if (backlinks.length === 0) {
    return (
      <>
        <EmptyState
          icon={Link}
          title="No backlinks yet"
          description="Track your backlink profile by adding links pointing to your site."
          actionLabel="Add Backlink"
          onAction={() => {
            setEditingBacklink(null);
            setFormOpen(true);
          }}
        />
        <BacklinkFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          backlink={null}
          pages={pages}
          onSave={onCreateBacklink}
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
              <TableHead className="font-medium">Source Domain</TableHead>
              <TableHead className="font-medium">Target Page</TableHead>
              <TableHead className="font-medium">Anchor Text</TableHead>
              <TableHead className="font-medium w-[100px]">Type</TableHead>
              <TableHead className="font-medium text-right w-[60px]">DA</TableHead>
              <TableHead className="font-medium w-[90px]">Status</TableHead>
              <TableHead className="w-[40px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {backlinks.map((bl) => {
              const pageTitle = getPageTitle(bl.targetPageId);

              return (
                <TableRow
                  key={bl.id}
                  className="cursor-pointer"
                  data-campshell-entity={`seo-tracker/backlinks/backlinks/${bl.id}.json`}
                  onClick={() => {
                    setEditingBacklink(bl);
                    setFormOpen(true);
                  }}
                >
                  <TableCell className="font-medium text-sm">{bl.sourceDomain}</TableCell>
                  <TableCell className="text-muted-foreground text-sm truncate max-w-[160px]">
                    {pageTitle ?? <span className="text-muted-foreground/50">--</span>}
                  </TableCell>
                  <TableCell className="text-sm truncate max-w-[180px]">
                    {bl.anchorText || <span className="text-muted-foreground/50">--</span>}
                  </TableCell>
                  <TableCell>
                    {bl.linkType && (
                      <Badge
                        variant={linkTypeBadge[bl.linkType] ?? "outline"}
                        className="text-xs font-normal"
                      >
                        {bl.linkType}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm">
                    {bl.domainAuthority != null ? (
                      <span className="font-medium">{bl.domainAuthority}</span>
                    ) : (
                      <span className="text-muted-foreground/50">--</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm capitalize">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot[bl.status ?? "active"]}`} />
                      {bl.status ?? "active"}
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
                            setEditingBacklink(bl);
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
                            setDeleteTarget(bl);
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

      <BacklinkFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingBacklink(null);
        }}
        backlink={editingBacklink}
        pages={pages}
        onSave={(bl) => {
          if (editingBacklink) {
            onUpdateBacklink(bl);
          } else {
            onCreateBacklink(bl);
          }
        }}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete backlink"
        description={`Are you sure you want to delete the backlink from "${deleteTarget?.sourceDomain}"? This cannot be undone.`}
        onConfirm={() => deleteTarget && onDeleteBacklink(deleteTarget.id)}
      />
    </>
  );
}
