import { Card, CardContent, CardHeader, CardTitle } from "@campshell/ui-components";
import { TrendingUp } from "lucide-react";
import type { Account } from "../types.js";

interface NetWorthCardProps {
  accounts: Account[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function NetWorthCard({ accounts }: NetWorthCardProps) {
  const assets = accounts
    .filter((a) => a.type === "asset" && a.balance != null)
    .reduce((sum, a) => sum + (a.balance ?? 0), 0);

  const liabilities = accounts
    .filter((a) => a.type === "liability" && a.balance != null)
    .reduce((sum, a) => sum + (a.balance ?? 0), 0);

  const netWorth = assets - liabilities;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Net Worth</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${netWorth >= 0 ? "text-emerald-500" : "text-red-500"}`}>
          {formatCurrency(netWorth)}
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span>Assets: {formatCurrency(assets)}</span>
          <span className="text-red-400">Liabilities: {formatCurrency(liabilities)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
