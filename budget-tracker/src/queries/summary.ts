import { readAllTransactions, readCategories } from "./helpers.js";
import type { MonthlySummary, QueryOptions } from "./types.js";

export async function getMonthlySummary(options: QueryOptions): Promise<MonthlySummary> {
  const month = options.month ?? new Date().toISOString().slice(0, 7);
  const [year, mon] = month.split("-");
  const lastDay = new Date(Number(year), Number(mon), 0).getDate();
  const from = `${month}-01`;
  const to = `${month}-${String(lastDay).padStart(2, "0")}`;

  const [transactions, categories] = await Promise.all([
    readAllTransactions(options.dataDir),
    readCategories(options.dataDir),
  ]);

  const monthTxns = transactions.filter((t) => t.date >= from && t.date <= to);
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const totalIncome = monthTxns
    .filter((t) => t.type === "deposit")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = monthTxns
    .filter((t) => t.type === "withdrawal")
    .reduce((sum, t) => sum + t.amount, 0);

  // Aggregate by category
  const categoryTotals = new Map<string, number>();
  for (const t of monthTxns) {
    if (t.type === "withdrawal" && t.categoryId) {
      categoryTotals.set(t.categoryId, (categoryTotals.get(t.categoryId) ?? 0) + t.amount);
    }
  }

  const byCategory = Array.from(categoryTotals.entries())
    .map(([categoryId, total]) => ({
      categoryId,
      categoryName: categoryMap.get(categoryId) ?? categoryId,
      total: Math.round(total * 100) / 100,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    month,
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netFlow: Math.round((totalIncome - totalExpenses) * 100) / 100,
    byCategory,
  };
}
