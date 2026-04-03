import { readFile } from "node:fs/promises";
import path from "node:path";
import { readAllBudgets, readAllTransactions, readCategories } from "./helpers.js";
import { NotFoundError } from "./types.js";
import type { BudgetProgress, QueryOptions } from "./types.js";

function getCurrentMonthRange(): { from: string; to: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  return {
    from: `${year}-${month}-01`,
    to: `${year}-${month}-${String(lastDay).padStart(2, "0")}`,
  };
}

export async function listBudgets(options: QueryOptions): Promise<BudgetProgress[]> {
  const [budgets, transactions, categories] = await Promise.all([
    readAllBudgets(options.dataDir),
    readAllTransactions(options.dataDir),
    readCategories(options.dataDir),
  ]);

  const { from, to } = getCurrentMonthRange();
  const monthlyWithdrawals = transactions.filter(
    (t) => t.type === "withdrawal" && t.date >= from && t.date <= to,
  );

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return budgets
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((budget) => {
      const spent = monthlyWithdrawals
        .filter((t) => t.categoryId === budget.categoryId)
        .reduce((sum, t) => sum + t.amount, 0);
      const remaining = Math.max(0, budget.amount - spent);
      const percentUsed = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;

      return {
        ...budget,
        categoryName: budget.categoryId ? categoryMap.get(budget.categoryId) : undefined,
        spent: Math.round(spent * 100) / 100,
        remaining: Math.round(remaining * 100) / 100,
        percentUsed,
      };
    });
}

export async function getBudget(id: string, options: QueryOptions): Promise<BudgetProgress> {
  const filePath = path.join(options.dataDir, "budgets", `${id}.json`);
  try {
    const raw = await readFile(filePath, "utf-8");
    const budget = JSON.parse(raw);

    const transactions = await readAllTransactions(options.dataDir);
    const { from, to } = getCurrentMonthRange();
    const spent = transactions
      .filter(
        (t) =>
          t.type === "withdrawal" &&
          t.categoryId === budget.categoryId &&
          t.date >= from &&
          t.date <= to,
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const remaining = Math.max(0, budget.amount - spent);
    const percentUsed = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;

    return {
      ...budget,
      spent: Math.round(spent * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      percentUsed,
    };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new NotFoundError(`Budget not found: ${id}`);
    }
    throw err;
  }
}
