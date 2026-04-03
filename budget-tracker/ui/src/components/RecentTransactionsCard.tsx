import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@campshell/ui-components";
import type { Account, Category, Transaction } from "../types.js";

interface RecentTransactionsCardProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function RecentTransactionsCard({
  transactions,
  accounts,
  categories,
}: RecentTransactionsCardProps) {
  const accountMap = new Map(accounts.map((a) => [a.id, a.name]));
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const recent = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {recent.length === 0 ? (
          <p className="px-6 pb-4 text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <div className="divide-y divide-border/50">
            {recent.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-6 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {tx.date}
                    {tx.categoryId && (
                      <span className="ml-2">{categoryMap.get(tx.categoryId)}</span>
                    )}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-[10px] hidden sm:inline-flex"
                  >
                    {accountMap.get(tx.sourceAccountId) ?? tx.sourceAccountId}
                  </Badge>
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      tx.type === "deposit"
                        ? "text-emerald-500"
                        : tx.type === "transfer"
                          ? "text-blue-500"
                          : "text-red-400"
                    }`}
                  >
                    {tx.type === "deposit" ? "+" : tx.type === "transfer" ? "→" : "-"}
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
