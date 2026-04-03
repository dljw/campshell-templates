import {
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@campshell/ui-components";
import { Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Account, Category, Transaction } from "../types.js";
import { TransactionDialog } from "./TransactionDialog.js";

interface TransactionsViewProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  isLoading: boolean;
  onCreate: (tx: Transaction) => void;
  onUpdate: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

const TYPE_LABELS: Record<string, string> = {
  withdrawal: "Expense",
  deposit: "Income",
  transfer: "Transfer",
};

const TYPE_COLORS: Record<string, string> = {
  withdrawal: "text-red-400",
  deposit: "text-emerald-500",
  transfer: "text-blue-500",
};

export function TransactionsView({
  transactions,
  accounts,
  categories,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
}: TransactionsViewProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | undefined>();

  const accountMap = new Map(accounts.map((a) => [a.id, a.name]));
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const filtered = transactions
    .filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterCategory !== "all" && t.categoryId !== filterCategory) return false;
      if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  function openCreate() {
    setEditingTx(undefined);
    setDialogOpen(true);
  }

  function openEdit(tx: Transaction) {
    setEditingTx(tx);
    setDialogOpen(true);
  }

  function handleSave(tx: Transaction) {
    if (editingTx) {
      onUpdate(tx);
    } else {
      onCreate(tx);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions…"
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="withdrawal">Expenses</SelectItem>
              <SelectItem value="deposit">Income</SelectItem>
              <SelectItem value="transfer">Transfers</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={openCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((tx) => (
                  <TableRow
                    key={tx.id}
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => openEdit(tx)}
                  >
                    <TableCell className="text-sm text-muted-foreground">{tx.date}</TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {tx.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {TYPE_LABELS[tx.type] ?? tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {accountMap.get(tx.sourceAccountId) ?? tx.sourceAccountId}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {tx.categoryId ? (categoryMap.get(tx.categoryId) ?? tx.categoryId) : "—"}
                    </TableCell>
                    <TableCell className={`text-right font-semibold tabular-nums ${TYPE_COLORS[tx.type] ?? ""}`}>
                      {tx.type === "deposit" ? "+" : tx.type === "transfer" ? "→" : "-"}
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(tx.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        accounts={accounts}
        categories={categories}
        initial={editingTx}
        onSave={handleSave}
      />
    </div>
  );
}
