import { Badge, Button, Card, CardContent, cn, ScrollArea } from "@campshell/ui-components";
import { Building2, DollarSign, FileText, MessageSquare, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import type { Activity, Contact, Deal, DealStage } from "../types.js";
import { daysUntilClose, formatCurrency } from "../utils.js";
import { DealDialog } from "./DealDialog.js";

interface PipelineViewProps {
  deals: Deal[];
  contacts: Contact[];
  activities: Activity[];
  createDeal: (deal: Deal) => boolean;
  updateDeal: (deal: Deal) => boolean;
  deleteDeal: (id: string) => boolean;
}

const STAGES: { id: DealStage; label: string; color: string }[] = [
  { id: "lead", label: "Lead", color: "bg-[var(--info-muted)] text-info" },
  { id: "proposal", label: "Proposal", color: "bg-[var(--warning-muted)] text-warning" },
  { id: "won", label: "Won", color: "bg-[var(--success-muted)] text-success" },
  { id: "lost", label: "Lost", color: "bg-muted text-muted-foreground" },
];

function closeDateColor(days: number, stage: DealStage): string {
  if (stage === "won" || stage === "lost") return "text-muted-foreground";
  if (days < 0) return "text-destructive font-medium";
  if (days <= 7) return "text-warning font-medium";
  if (days <= 30) return "text-warning";
  return "text-muted-foreground";
}

function closeDateLabel(days: number, stage: DealStage): string {
  if (stage === "won" || stage === "lost") return "";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days <= 30) return `${days}d left`;
  return "";
}

function cardBorderClass(deal: Deal): string {
  if (deal.stage === "won" || deal.stage === "lost" || !deal.closeDate) return "";
  const days = daysUntilClose(deal.closeDate);
  if (days < 0) return "border-l-2 border-l-destructive";
  if (days <= 7) return "border-l-2 border-l-warning";
  return "";
}

export function PipelineView({ deals, contacts, activities, createDeal, updateDeal, deleteDeal }: PipelineViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [defaultStage, setDefaultStage] = useState<DealStage>("lead");

  const contactMap = useMemo(() => {
    const map = new Map<string, Contact>();
    for (const c of contacts) map.set(c.id, c);
    return map;
  }, [contacts]);

  const dealsByStage = useMemo(() => {
    const grouped: Record<DealStage, Deal[]> = { lead: [], proposal: [], won: [], lost: [] };
    for (const deal of deals) {
      (grouped[deal.stage] ??= []).push(deal);
    }
    return grouped;
  }, [deals]);

  const totalByStage = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const stage of STAGES) {
      totals[stage.id] = dealsByStage[stage.id].reduce((sum, d) => sum + (d.value ?? 0), 0);
    }
    return totals;
  }, [dealsByStage]);

  const activityCountByDeal = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of activities) {
      if (a.dealId) {
        counts.set(a.dealId, (counts.get(a.dealId) ?? 0) + 1);
      }
    }
    return counts;
  }, [activities]);

  const handleNewDeal = (stage: DealStage) => {
    setEditingDeal(null);
    setDefaultStage(stage);
    setDialogOpen(true);
  };

  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setDefaultStage(deal.stage);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="flex gap-4 h-full overflow-x-auto p-4">
        {STAGES.map((stage) => {
          const stageDeals = dealsByStage[stage.id];
          return (
            <div key={stage.id} className="flex flex-col w-72 shrink-0">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={cn("text-xs font-normal", stage.color)}>
                    {stage.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{stageDeals.length}</span>
                </div>
                {totalByStage[stage.id] > 0 && (
                  <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                    <DollarSign className="h-3 w-3" />
                    {formatCurrency(totalByStage[stage.id]).replace("$", "")}
                  </span>
                )}
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-2 pr-2">
                  {stageDeals.map((deal) => {
                    const contact = deal.contactId ? contactMap.get(deal.contactId) : undefined;
                    const actCount = activityCountByDeal.get(deal.id) ?? 0;
                    const days = deal.closeDate ? daysUntilClose(deal.closeDate) : null;

                    return (
                      <Card
                        key={deal.id}
                        className={cn(
                          "cursor-pointer hover:bg-surface-raised transition-colors",
                          cardBorderClass(deal),
                        )}
                        data-campshell-entity={`crm/deals/deals/${deal.id}.json`}
                        onClick={() => handleEditDeal(deal)}
                      >
                        <CardContent className="p-3 text-sm text-white space-y-1.5">
                          <p className="font-medium truncate">{deal.title}</p>

                          {contact && (
                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                              <span className="truncate">{contact.name}</span>
                              {contact.company && (
                                <>
                                  <span className="shrink-0">·</span>
                                  <Building2 className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{contact.company}</span>
                                </>
                              )}
                            </p>
                          )}

                          {deal.notes && (
                            <p className="text-xs text-muted-foreground/70 italic truncate flex items-center gap-1">
                              <FileText className="h-3 w-3 shrink-0" />
                              <span className="truncate">{deal.notes}</span>
                            </p>
                          )}

                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <div className="flex items-center gap-2">
                              {deal.value != null && (
                                <span className="text-xs font-medium text-white">{formatCurrency(deal.value)}</span>
                              )}
                              {actCount > 0 && (
                                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                  <MessageSquare className="h-3 w-3" />
                                  {actCount}
                                </span>
                              )}
                            </div>
                            {deal.closeDate && days !== null && (
                              <div className="flex items-center gap-1 text-xs shrink-0">
                                <span className={closeDateColor(days, deal.stage)}>
                                  {new Date(deal.closeDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                                {closeDateLabel(days, deal.stage) && (
                                  <span className={cn("text-[10px]", closeDateColor(days, deal.stage))}>
                                    ({closeDateLabel(days, deal.stage)})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground gap-1.5"
                    onClick={() => handleNewDeal(stage.id)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add deal
                  </Button>
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>

      <DealDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        deal={editingDeal}
        defaultStage={defaultStage}
        contacts={contacts}
        activities={activities}
        onCreate={createDeal}
        onUpdate={updateDeal}
        onDelete={deleteDeal}
      />
    </>
  );
}
