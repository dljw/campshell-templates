export interface QueryOptions {
  dataDir: string;
  type?: string;
  categoryId?: string;
  accountId?: string;
  from?: string;
  to?: string;
  month?: string;
}

export interface Account {
  id: string;
  createdAt: string;
  updatedAt?: string;
  name: string;
  type: "asset" | "expense" | "revenue" | "liability";
  subType?: "checking" | "savings" | "cash" | "credit-card" | "loan" | "investment" | "mortgage" | "other";
  currency: string;
  balance?: number;
  notes?: string;
  active?: boolean;
}

export interface Transaction {
  id: string;
  createdAt: string;
  updatedAt?: string;
  type: "withdrawal" | "deposit" | "transfer";
  description: string;
  amount: number;
  date: string;
  sourceAccountId: string;
  destinationAccountId?: string;
  categoryId?: string;
  tagIds?: string[];
  notes?: string;
}

export interface Category {
  id: string;
  createdAt: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface Budget {
  id: string;
  createdAt: string;
  updatedAt?: string;
  name: string;
  categoryId?: string;
  amount: number;
  period?: "monthly" | "weekly" | "yearly";
  startDate?: string;
  notes?: string;
}

export interface Tag {
  id: string;
  createdAt: string;
  name: string;
  color?: string;
}

export interface BudgetProgress extends Budget {
  spent: number;
  remaining: number;
  percentUsed: number;
}

export interface MonthlySummary {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    total: number;
  }>;
}

export interface TransactionSearchResult {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: string;
  matchedIn: ("description" | "notes")[];
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
