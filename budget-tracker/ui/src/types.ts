export type AccountType = "asset" | "expense" | "revenue" | "liability";
export type AccountSubType =
  | "checking"
  | "savings"
  | "cash"
  | "credit-card"
  | "loan"
  | "investment"
  | "mortgage"
  | "other";
export type TransactionType = "withdrawal" | "deposit" | "transfer";
export type BudgetPeriod = "monthly" | "weekly" | "yearly";
export type CategoryColor = "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "gray";
export type TagColor = "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "gray";

export interface Account {
  id: string;
  createdAt: string;
  updatedAt?: string;
  name: string;
  type: AccountType;
  subType?: AccountSubType;
  currency: string;
  balance?: number;
  notes?: string;
  active?: boolean;
}

export interface Transaction {
  id: string;
  createdAt: string;
  updatedAt?: string;
  type: TransactionType;
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
  color?: CategoryColor;
}

export interface Budget {
  id: string;
  createdAt: string;
  updatedAt?: string;
  name: string;
  categoryId?: string;
  amount: number;
  period?: BudgetPeriod;
  startDate?: string;
  notes?: string;
}

export interface Tag {
  id: string;
  createdAt: string;
  name: string;
  color?: TagColor;
}

export interface BudgetProgress extends Budget {
  spent: number;
  remaining: number;
  percentUsed: number;
}

export interface CategoriesCollection {
  categories: Category[];
}

export interface TagsCollection {
  tags: Tag[];
}

export interface ValidationErrorDetail {
  template: string;
  file: string;
  errors: Array<{
    keyword: string;
    message?: string;
    instancePath: string;
    params?: Record<string, unknown>;
  }>;
}
