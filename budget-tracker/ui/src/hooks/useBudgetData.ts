import type { ServerMessage } from "@campshell/core";
import { useWebSocket } from "@campshell/ui-hooks";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  Account,
  Budget,
  BudgetProgress,
  CategoriesCollection,
  Category,
  Tag,
  TagsCollection,
  Transaction,
  ValidationErrorDetail,
} from "../types.js";

export interface UseBudgetDataReturn {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: BudgetProgress[];
  tags: Tag[];
  status: "connecting" | "connected" | "disconnected";
  isLoading: boolean;
  errorRecords: ValidationErrorDetail[];
  createTransaction: (tx: Transaction) => boolean;
  updateTransaction: (tx: Transaction) => boolean;
  deleteTransaction: (id: string) => boolean;
  createAccount: (account: Account) => boolean;
  updateAccount: (account: Account) => boolean;
  deleteAccount: (id: string) => boolean;
  createBudget: (budget: Budget) => boolean;
  updateBudget: (budget: Budget) => boolean;
  deleteBudget: (id: string) => boolean;
  updateCategories: (categories: Category[]) => void;
  updateTags: (tags: Tag[]) => void;
}

function humanizeError(error: {
  keyword: string;
  instancePath: string;
  message?: string;
  params?: Record<string, unknown>;
}): string {
  const field = error.instancePath.split("/").filter(Boolean).pop() || "Value";
  const label = field.charAt(0).toUpperCase() + field.slice(1);

  switch (error.keyword) {
    case "required":
      return `${error.params?.missingProperty ?? label} is required`;
    case "maxLength":
      return `${label} is too long (max ${error.params?.limit} characters)`;
    case "minLength":
      return `${label} cannot be empty`;
    case "minimum":
    case "exclusiveMinimum":
      return `${label} must be greater than ${error.params?.limit ?? 0}`;
    case "enum":
      return `${label} must be one of: ${(error.params?.allowedValues as string[])?.join(", ")}`;
    case "format":
      return `${label} must be a valid ${error.params?.format}`;
    case "additionalProperties":
      return `Unknown field: ${error.params?.additionalProperty}`;
    default:
      return error.message ?? `${label}: ${error.keyword}`;
  }
}

export function useBudgetData(apiBase = ""): UseBudgetDataReturn {
  const { status, writeFile, deleteFile, onFileEvent } = useWebSocket({
    template: "budget-tracker",
  });

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<BudgetProgress[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorRecords, setErrorRecords] = useState<ValidationErrorDetail[]>([]);

  // Fetch initial data when connected
  useEffect(() => {
    if (status !== "connected") return;
    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      fetch(`${apiBase}/api/budget-tracker/data`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`${apiBase}/api/budget-tracker/errors`)
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
    ]).then(([response, errors]: [{ data: Record<string, unknown> } | null, ValidationErrorDetail[]]) => {
      if (cancelled) return;
      if (response?.data) {
        const d = response.data;
        setAccounts((d.accounts as Account[]) ?? []);
        setTransactions((d.transactions as Transaction[]) ?? []);
        setCategories(((d.categories as CategoriesCollection)?.categories) ?? (d.categories as Category[]) ?? []);
        setBudgets((d.budgets as BudgetProgress[]) ?? []);
        setTags(((d.tags as TagsCollection)?.tags) ?? (d.tags as Tag[]) ?? []);
      }
      setErrorRecords(errors);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [status, apiBase]);

  // Handle real-time WebSocket events
  useEffect(() => {
    const unsub = onFileEvent((event: ServerMessage) => {
      if (event.type === "error") return;

      if (event.type === "validation:error") {
        const summary = event.errors[0] ? humanizeError(event.errors[0]) : "Invalid data";
        toast.error(`Validation Error: ${event.file}`, { description: summary });
        setErrorRecords((prev) => {
          const filtered = prev.filter((er) => er.file !== event.file);
          return [
            ...filtered,
            {
              template: event.template,
              file: event.file,
              errors: event.errors.map((e) => ({
                keyword: e.keyword,
                message: e.message,
                instancePath: e.instancePath,
                params: e.params as Record<string, unknown> | undefined,
              })),
            },
          ];
        });
        return;
      }

      const entity = "entity" in event ? (event.entity as string) : "";

      if (event.type === "file:created" || event.type === "file:updated") {
        setErrorRecords((prev) => prev.filter((er) => er.file !== event.file));

        if (entity === "accounts") {
          const item = event.data as Account;
          setAccounts((prev) => {
            const idx = prev.findIndex((a) => a.id === item.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = item;
              return next;
            }
            return [...prev, item];
          });
        } else if (entity === "transactions") {
          const item = event.data as Transaction;
          setTransactions((prev) => {
            const idx = prev.findIndex((t) => t.id === item.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = item;
              return next;
            }
            return [...prev, item];
          });
        } else if (entity === "budgets") {
          const item = event.data as Budget;
          setBudgets((prev) => {
            const idx = prev.findIndex((b) => b.id === item.id);
            const withProgress: BudgetProgress = {
              ...item,
              spent: 0,
              remaining: item.amount,
              percentUsed: 0,
            };
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = { ...prev[idx], ...withProgress };
              return next;
            }
            return [...prev, withProgress];
          });
        } else if (entity === "categories") {
          const data = event.data as CategoriesCollection;
          setCategories(data.categories ?? []);
        } else if (entity === "tags") {
          const data = event.data as TagsCollection;
          setTags(data.tags ?? []);
        }
      } else if (event.type === "file:deleted") {
        if (entity === "accounts") {
          const id = event.file.replace("accounts/", "").replace(".json", "");
          setAccounts((prev) => prev.filter((a) => a.id !== id));
        } else if (entity === "transactions") {
          const id = event.file.replace("transactions/", "").replace(".json", "");
          setTransactions((prev) => prev.filter((t) => t.id !== id));
        } else if (entity === "budgets") {
          const id = event.file.replace("budgets/", "").replace(".json", "");
          setBudgets((prev) => prev.filter((b) => b.id !== id));
        }
      }
    });

    return unsub;
  }, [onFileEvent]);

  const createTransaction = useCallback(
    (tx: Transaction): boolean => {
      if (!writeFile(`transactions/${tx.id}.json`, tx)) {
        toast.error("Failed to create transaction");
        return false;
      }
      setTransactions((prev) => [...prev, tx]);
      toast.success("Transaction created");
      return true;
    },
    [writeFile],
  );

  const updateTransaction = useCallback(
    (tx: Transaction): boolean => {
      if (!writeFile(`transactions/${tx.id}.json`, tx)) {
        toast.error("Failed to update transaction");
        return false;
      }
      setTransactions((prev) => prev.map((t) => (t.id === tx.id ? tx : t)));
      return true;
    },
    [writeFile],
  );

  const deleteTransaction = useCallback(
    (id: string): boolean => {
      if (!deleteFile(`transactions/${id}.json`)) {
        toast.error("Failed to delete transaction");
        return false;
      }
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success("Transaction deleted");
      return true;
    },
    [deleteFile],
  );

  const createAccount = useCallback(
    (account: Account): boolean => {
      if (!writeFile(`accounts/${account.id}.json`, account)) {
        toast.error("Failed to create account");
        return false;
      }
      setAccounts((prev) => [...prev, account]);
      toast.success("Account created");
      return true;
    },
    [writeFile],
  );

  const updateAccount = useCallback(
    (account: Account): boolean => {
      if (!writeFile(`accounts/${account.id}.json`, account)) {
        toast.error("Failed to update account");
        return false;
      }
      setAccounts((prev) => prev.map((a) => (a.id === account.id ? account : a)));
      return true;
    },
    [writeFile],
  );

  const deleteAccount = useCallback(
    (id: string): boolean => {
      if (!deleteFile(`accounts/${id}.json`)) {
        toast.error("Failed to delete account");
        return false;
      }
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      toast.success("Account deleted");
      return true;
    },
    [deleteFile],
  );

  const createBudget = useCallback(
    (budget: Budget): boolean => {
      if (!writeFile(`budgets/${budget.id}.json`, budget)) {
        toast.error("Failed to create budget");
        return false;
      }
      const withProgress: BudgetProgress = { ...budget, spent: 0, remaining: budget.amount, percentUsed: 0 };
      setBudgets((prev) => [...prev, withProgress]);
      toast.success("Budget created");
      return true;
    },
    [writeFile],
  );

  const updateBudget = useCallback(
    (budget: Budget): boolean => {
      if (!writeFile(`budgets/${budget.id}.json`, budget)) {
        toast.error("Failed to update budget");
        return false;
      }
      setBudgets((prev) =>
        prev.map((b) => (b.id === budget.id ? { ...b, ...budget } : b)),
      );
      return true;
    },
    [writeFile],
  );

  const deleteBudget = useCallback(
    (id: string): boolean => {
      if (!deleteFile(`budgets/${id}.json`)) {
        toast.error("Failed to delete budget");
        return false;
      }
      setBudgets((prev) => prev.filter((b) => b.id !== id));
      toast.success("Budget deleted");
      return true;
    },
    [deleteFile],
  );

  const updateCategories = useCallback(
    (newCategories: Category[]): void => {
      if (!writeFile("categories.json", { categories: newCategories })) return;
      setCategories(newCategories);
    },
    [writeFile],
  );

  const updateTags = useCallback(
    (newTags: Tag[]): void => {
      if (!writeFile("tags.json", { tags: newTags })) return;
      setTags(newTags);
    },
    [writeFile],
  );

  return {
    accounts,
    transactions,
    categories,
    budgets,
    tags,
    status,
    isLoading,
    errorRecords,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    createAccount,
    updateAccount,
    deleteAccount,
    createBudget,
    updateBudget,
    deleteBudget,
    updateCategories,
    updateTags,
  };
}
