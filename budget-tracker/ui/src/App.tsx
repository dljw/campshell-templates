import { Button } from "@campshell/ui-components";
import { ArrowLeftRight, FolderOpen, LayoutDashboard, Landmark, PiggyBank } from "lucide-react";
import { useState } from "react";
import type { UseBudgetDataReturn } from "./hooks/useBudgetData.js";
import { AccountsView } from "./components/AccountsView.js";
import { BudgetsView } from "./components/BudgetsView.js";
import { CategoriesView } from "./components/CategoriesView.js";
import { ConnectionStatus } from "./components/ConnectionStatus.js";
import { DashboardView } from "./components/DashboardView.js";
import { TransactionsView } from "./components/TransactionsView.js";

type Tab = "dashboard" | "transactions" | "accounts" | "budgets" | "categories";

interface AppProps {
  data: UseBudgetDataReturn;
}

const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "transactions", label: "Transactions", icon: <ArrowLeftRight className="h-4 w-4" /> },
  { id: "accounts", label: "Accounts", icon: <Landmark className="h-4 w-4" /> },
  { id: "budgets", label: "Budgets", icon: <PiggyBank className="h-4 w-4" /> },
  { id: "categories", label: "Categories", icon: <FolderOpen className="h-4 w-4" /> },
];

export function App({ data }: AppProps) {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center px-6 py-3 border-b border-border/40 shrink-0 gap-6">
        <h1 className="text-base font-semibold tracking-tight">Budget Tracker</h1>
        <nav className="flex items-center gap-1">
          {TABS.map((t) => (
            <Button
              key={t.id}
              variant={tab === t.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTab(t.id)}
              className="gap-1.5"
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </Button>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          {tab === "dashboard" && (
            <DashboardView
              accounts={data.accounts}
              transactions={data.transactions}
              categories={data.categories}
              budgets={data.budgets}
              isLoading={data.isLoading}
            />
          )}
          {tab === "transactions" && (
            <TransactionsView
              transactions={data.transactions}
              accounts={data.accounts}
              categories={data.categories}
              isLoading={data.isLoading}
              onCreate={data.createTransaction}
              onUpdate={data.updateTransaction}
              onDelete={data.deleteTransaction}
            />
          )}
          {tab === "accounts" && (
            <AccountsView
              accounts={data.accounts}
              isLoading={data.isLoading}
              onCreate={data.createAccount}
              onUpdate={data.updateAccount}
              onDelete={data.deleteAccount}
            />
          )}
          {tab === "budgets" && (
            <BudgetsView
              budgets={data.budgets}
              categories={data.categories}
              isLoading={data.isLoading}
              onCreate={data.createBudget}
              onUpdate={data.updateBudget}
              onDelete={data.deleteBudget}
            />
          )}
          {tab === "categories" && (
            <CategoriesView
              categories={data.categories}
              isLoading={data.isLoading}
              onUpdate={data.updateCategories}
            />
          )}
        </div>
      </main>

      <ConnectionStatus status={data.status} />
    </div>
  );
}
