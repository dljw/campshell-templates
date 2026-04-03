import { Card, CardContent, CardHeader, CardTitle } from "@campshell/ui-components";
import { PiggyBank } from "lucide-react";
import type { BudgetProgress, Category } from "../types.js";

interface BudgetProgressCardProps {
  budgets: BudgetProgress[];
  categories: Category[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function progressColor(pct: number): string {
  if (pct >= 90) return "bg-red-500";
  if (pct >= 70) return "bg-yellow-500";
  return "bg-emerald-500";
}

export function BudgetProgressCard({ budgets, categories }: BudgetProgressCardProps) {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const activeBudgets = budgets.slice(0, 4);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Budget Progress
        </CardTitle>
        <PiggyBank className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        {activeBudgets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No budgets configured.</p>
        ) : (
          activeBudgets.map((budget) => {
            const label = budget.categoryId
              ? (categoryMap.get(budget.categoryId) ?? budget.name)
              : budget.name;
            const pct = Math.min(budget.percentUsed, 100);

            return (
              <div key={budget.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium truncate max-w-[60%]">{label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${progressColor(pct)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
