import { Card, CardContent, CardHeader, CardTitle } from "@campshell/ui-components";
import { BarChart3 } from "lucide-react";
import type { Category, Transaction } from "../types.js";

interface SpendingByCategoryCardProps {
  transactions: Transaction[];
  categories: Category[];
}

const COLOR_MAP: Record<string, string> = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-500",
  green: "bg-emerald-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  gray: "bg-gray-500",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function SpendingByCategoryCard({ transactions, categories }: SpendingByCategoryCardProps) {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthWithdrawals = transactions.filter(
    (t) => t.type === "withdrawal" && t.date.startsWith(month),
  );

  const categoryTotals = new Map<string, number>();
  for (const tx of monthWithdrawals) {
    if (tx.categoryId) {
      categoryTotals.set(tx.categoryId, (categoryTotals.get(tx.categoryId) ?? 0) + tx.amount);
    }
  }

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const sorted = Array.from(categoryTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxAmount = sorted[0]?.[1] ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Spending This Month
        </CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-2.5">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">No expenses this month.</p>
        ) : (
          sorted.map(([categoryId, total]) => {
            const category = categoryMap.get(categoryId);
            const barWidth = maxAmount > 0 ? (total / maxAmount) * 100 : 0;
            const colorClass = category?.color ? (COLOR_MAP[category.color] ?? "bg-blue-500") : "bg-blue-500";

            return (
              <div key={categoryId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{category?.name ?? categoryId}</span>
                  <span className="text-muted-foreground tabular-nums">{formatCurrency(total)}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${colorClass}`}
                    style={{ width: `${barWidth}%` }}
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
