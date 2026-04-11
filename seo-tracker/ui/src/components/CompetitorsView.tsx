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
  Separator,
} from "@campshell/ui-components";
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import type { Competitor } from "../types.js";
import { CompetitorFormDialog } from "./CompetitorFormDialog.js";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog.js";
import { EmptyState } from "./EmptyState.js";

interface CompetitorsViewProps {
  competitors: Competitor[];
  domainId: string | null;
  onUpdateCompetitors: (competitors: Competitor[]) => boolean;
}

export function CompetitorsView({ competitors, domainId, onUpdateCompetitors }: CompetitorsViewProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Competitor | null>(null);

  const handleSave = (competitor: Competitor) => {
    if (editingCompetitor) {
      onUpdateCompetitors(competitors.map((c) => (c.id === competitor.id ? competitor : c)));
    } else {
      onUpdateCompetitors([...competitors, competitor]);
    }
  };

  const handleDelete = (id: string) => {
    onUpdateCompetitors(competitors.filter((c) => c.id !== id));
  };

  if (competitors.length === 0) {
    return (
      <>
        <EmptyState
          icon={Users}
          title="No competitors yet"
          description="Keep an eye on your competition by adding competitor domains to track."
          actionLabel="Add Competitor"
          onAction={() => {
            setEditingCompetitor(null);
            setFormOpen(true);
          }}
        />
        <CompetitorFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          competitor={null}
          domainId={domainId}
          onSave={handleSave}
        />
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {competitors.map((comp) => (
          <Card key={comp.id} className="group" data-campshell-entity="seo-tracker/competitors/competitors.json">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div>
                <h3 className="font-semibold text-base">{comp.domain}</h3>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
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
                    onClick={() => {
                      setEditingCompetitor(comp);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setDeleteTarget(comp)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6 text-sm">
                {comp.domainAuthority != null && (
                  <div>
                    <span className="text-muted-foreground text-xs">DA</span>
                    <p className="font-semibold text-lg tabular-nums">{comp.domainAuthority}</p>
                  </div>
                )}
                {comp.estimatedTraffic != null && (
                  <div>
                    <span className="text-muted-foreground text-xs">Est. Traffic</span>
                    <p className="font-semibold text-lg tabular-nums">
                      {comp.estimatedTraffic.toLocaleString()}
                    </p>
                  </div>
                )}
                {comp.backlinkCount != null && (
                  <div>
                    <span className="text-muted-foreground text-xs">Backlinks</span>
                    <p className="font-semibold text-lg tabular-nums">
                      {comp.backlinkCount.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {comp.topKeywords && comp.topKeywords.length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-wrap gap-1.5">
                    {comp.topKeywords.slice(0, 5).map((kw) => (
                      <Badge key={kw} variant="secondary" className="text-xs font-normal">
                        {kw}
                      </Badge>
                    ))}
                    {comp.topKeywords.length > 5 && (
                      <Badge variant="outline" className="text-xs font-normal">
                        +{comp.topKeywords.length - 5} more
                      </Badge>
                    )}
                  </div>
                </>
              )}

              {comp.notes && (
                <>
                  <Separator />
                  <p className="text-sm text-muted-foreground line-clamp-2">{comp.notes}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <CompetitorFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingCompetitor(null);
        }}
        competitor={editingCompetitor}
        domainId={domainId}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete competitor"
        description={`Are you sure you want to remove "${deleteTarget?.domain}"? This cannot be undone.`}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />
    </>
  );
}
