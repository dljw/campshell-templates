import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
} from "@campshell/ui-components";
import { PiggyBank, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Budget, BudgetProgress, Category } from "../types.js";
import { BudgetDialog } from "./BudgetDialog.js";

interface BudgetsViewProps {
  budgets: BudgetProgress[];
  categories: Category[];
  isLoading: boolean;
  onCreate: (budget: Budget) => void;
  onUpdate: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function progressColor(pct: number): string {
  if (pct >= 90) return "bg-red-500";
  if (pct >= 70) return "bg-yellow-500";
  return "bg-emerald-500";
}

export function BudgetsView({
  budgets,
  categories,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
}: BudgetsViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>();

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  function openCreate() {
    setEditingBudget(undefined);
    setDialogOpen(true);
  }

  function openEdit(budget: Budget) {
    setEditingBudget(budget);
    setDialogOpen(true);
  }

  function handleSave(budget: Budget) {
    if (editingBudget) {
      onUpdate(budget);
    } else {
      onCreate(budget);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <PiggyBank className="h-4 w-4" />
          <span className="text-sm">{budgets.length} budgets — current month</span>
        </div>
        <Button size="sm" onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Budget
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PiggyBank className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">No budgets yet.</p>
          <Button size="sm" variant="outline" onClick={openCreate} className="mt-3 gap-2">
            <Plus className="h-4 w-4" />
            Create your first budget
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const label = budget.categoryId
              ? (categoryMap.get(budget.categoryId) ?? budget.name)
              : budget.name;
            const pct = Math.min(budget.percentUsed, 100);

            return (
              <Card
                key={budget.id}
                className="cursor-pointer hover:bg-muted/20 transition-colors relative group"
                data-campshell-entity={`budget-tracker/budget/budgets/${budget.id}.json`}
                onClick={() => openEdit(budget)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-medium">{budget.name}</CardTitle>
                    {budget.period && (
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {budget.period}
                      </Badge>
                    )}
                  </div>
                  {budget.categoryId && (
                    <p className="text-xs text-muted-foreground">{label}</p>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Spent</span>
                      <span
                        className={`font-semibold tabular-nums ${
                          pct >= 90 ? "text-red-400" : pct >= 70 ? "text-yellow-500" : "text-foreground"
                        }`}
                      >
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${progressColor(pct)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">{pct}% used</p>
                  </div>

                  <Separator className="opacity-50" />

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Remaining</span>
                    <span className={`font-medium ${budget.remaining <= 0 ? "text-red-400" : "text-emerald-500"}`}>
                      {formatCurrency(budget.remaining)}
                    </span>
                  </div>
                </CardContent>

                <button
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(budget.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </Card>
            );
          })}
        </div>
      )}

      <BudgetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        initial={editingBudget}
        onSave={handleSave}
      />
    </div>
  );
}
