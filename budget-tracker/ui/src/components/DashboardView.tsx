import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@campshell/ui-components";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { Account, BudgetProgress, Category, Transaction } from "../types.js";
import { BudgetProgressCard } from "./BudgetProgressCard.js";
import { NetWorthCard } from "./NetWorthCard.js";
import { RecentTransactionsCard } from "./RecentTransactionsCard.js";
import { SpendingByCategoryCard } from "./SpendingByCategoryCard.js";

interface DashboardViewProps {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: BudgetProgress[];
  isLoading: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function DashboardView({
  accounts,
  transactions,
  categories,
  budgets,
  isLoading,
}: DashboardViewProps) {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthTxns = transactions.filter((t) => t.date.startsWith(month));
  const totalIncome = monthTxns
    .filter((t) => t.type === "deposit")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = monthTxns
    .filter((t) => t.type === "withdrawal")
    .reduce((sum, t) => sum + t.amount, 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NetWorthCard accounts={accounts} />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Income This Month
            </CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expenses This Month
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalIncome - totalExpenses >= 0 ? "text-emerald-500" : "text-red-400"
              }`}
            >
              {formatCurrency(totalIncome - totalExpenses)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <RecentTransactionsCard
          transactions={transactions}
          accounts={accounts}
          categories={categories}
        />
        <SpendingByCategoryCard transactions={transactions} categories={categories} />
      </div>

      {/* Budget row */}
      {budgets.length > 0 && (
        <BudgetProgressCard budgets={budgets} categories={categories} />
      )}
    </div>
  );
}
