import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@campshell/ui-components";
import { Landmark, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Account, AccountType } from "../types.js";
import { AccountDialog } from "./AccountDialog.js";

interface AccountsViewProps {
  accounts: Account[];
  isLoading: boolean;
  onCreate: (account: Account) => void;
  onUpdate: (account: Account) => void;
  onDelete: (id: string) => void;
}

function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

const TYPE_BADGE_COLORS: Record<AccountType, string> = {
  asset: "border-emerald-500/30 text-emerald-500 bg-emerald-500/10",
  liability: "border-red-400/30 text-red-400 bg-red-400/10",
  revenue: "border-blue-500/30 text-blue-500 bg-blue-500/10",
  expense: "border-orange-500/30 text-orange-500 bg-orange-500/10",
};

export function AccountsView({
  accounts,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
}: AccountsViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();

  const grouped = (["asset", "liability", "revenue", "expense"] as AccountType[])
    .map((type) => ({
      type,
      accounts: accounts.filter((a) => a.type === type),
    }))
    .filter((g) => g.accounts.length > 0);

  function openCreate() {
    setEditingAccount(undefined);
    setDialogOpen(true);
  }

  function openEdit(account: Account) {
    setEditingAccount(account);
    setDialogOpen(true);
  }

  function handleSave(account: Account) {
    if (editingAccount) {
      onUpdate(account);
    } else {
      onCreate(account);
    }
  }

  const TYPE_LABELS: Record<AccountType, string> = {
    asset: "Asset Accounts",
    liability: "Liabilities",
    revenue: "Revenue Accounts",
    expense: "Expense Accounts",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Landmark className="h-4 w-4" />
          <span className="text-sm">{accounts.length} accounts</span>
        </div>
        <Button size="sm" onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ type, accounts: groupAccounts }) => (
            <div key={type}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {TYPE_LABELS[type]}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {groupAccounts.map((account) => (
                  <Card
                    key={account.id}
                    className="cursor-pointer hover:bg-muted/20 transition-colors relative group"
                    onClick={() => openEdit(account)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm font-medium">{account.name}</CardTitle>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${TYPE_BADGE_COLORS[account.type]}`}
                        >
                          {account.subType ?? account.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {account.balance != null && (
                        <p
                          className={`text-xl font-bold tabular-nums ${
                            account.type === "liability" ? "text-red-400" : "text-foreground"
                          }`}
                        >
                          {formatCurrency(account.balance, account.currency)}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">{account.currency}</p>
                    </CardContent>
                    <button
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(account.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {accounts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Landmark className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No accounts yet.</p>
              <Button size="sm" variant="outline" onClick={openCreate} className="mt-3 gap-2">
                <Plus className="h-4 w-4" />
                Add your first account
              </Button>
            </div>
          )}
        </div>
      )}

      <AccountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editingAccount}
        onSave={handleSave}
      />
    </div>
  );
}
