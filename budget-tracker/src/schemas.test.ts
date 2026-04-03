import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ajvModule, { type ValidateFunction } from "ajv";
import addFormatsModule from "ajv-formats";
import { beforeAll, describe, expect, it } from "vitest";

const Ajv = ajvModule.default ?? ajvModule;
const addFormats: (ajv: InstanceType<typeof Ajv>) => void =
  // biome-ignore lint/suspicious/noExplicitAny: ESM/CJS interop for ajv-formats
  (addFormatsModule as any).default ?? addFormatsModule;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaDir = path.join(__dirname, "..", "schemas");
const defaultsDir = path.join(__dirname, "..", "defaults");

async function loadJson(filePath: string): Promise<unknown> {
  return JSON.parse(await readFile(filePath, "utf-8"));
}

describe("Budget Tracker Schemas", () => {
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);

  let validateAccount: ValidateFunction;
  let validateTransaction: ValidateFunction;
  let validateBudget: ValidateFunction;
  let validateCategories: ValidateFunction;
  let validateTags: ValidateFunction;

  beforeAll(async () => {
    validateAccount = ajv.compile(
      (await loadJson(path.join(schemaDir, "accounts.schema.json"))) as Record<string, unknown>,
    );
    validateTransaction = ajv.compile(
      (await loadJson(path.join(schemaDir, "transactions.schema.json"))) as Record<string, unknown>,
    );
    validateBudget = ajv.compile(
      (await loadJson(path.join(schemaDir, "budgets.schema.json"))) as Record<string, unknown>,
    );
    validateCategories = ajv.compile(
      (await loadJson(path.join(schemaDir, "categories.schema.json"))) as Record<string, unknown>,
    );
    validateTags = ajv.compile(
      (await loadJson(path.join(schemaDir, "tags.schema.json"))) as Record<string, unknown>,
    );
  });

  it("all schemas compile without errors", () => {
    expect(validateAccount).toBeDefined();
    expect(validateTransaction).toBeDefined();
    expect(validateBudget).toBeDefined();
    expect(validateCategories).toBeDefined();
    expect(validateTags).toBeDefined();
  });

  describe("account validation", () => {
    it("accepts a valid asset account", () => {
      expect(
        validateAccount({
          id: "my-checking",
          createdAt: "2026-01-01T00:00:00.000Z",
          name: "My Checking",
          type: "asset",
          subType: "checking",
          currency: "USD",
          balance: 1000,
          active: true,
        }),
      ).toBe(true);
    });

    it("rejects account missing required fields", () => {
      expect(validateAccount({ name: "No ID", type: "asset", currency: "USD" })).toBe(false);
    });

    it("rejects account with invalid type enum", () => {
      expect(
        validateAccount({
          id: "test",
          createdAt: "2026-01-01T00:00:00.000Z",
          name: "Test",
          type: "unknown",
          currency: "USD",
        }),
      ).toBe(false);
    });

    it("rejects account with invalid currency pattern", () => {
      expect(
        validateAccount({
          id: "test",
          createdAt: "2026-01-01T00:00:00.000Z",
          name: "Test",
          type: "asset",
          currency: "usd",
        }),
      ).toBe(false);
    });

    it("rejects account with extra properties", () => {
      expect(
        validateAccount({
          id: "test",
          createdAt: "2026-01-01T00:00:00.000Z",
          name: "Test",
          type: "asset",
          currency: "USD",
          unknownField: true,
        }),
      ).toBe(false);
    });
  });

  describe("transaction validation", () => {
    it("accepts a valid withdrawal", () => {
      expect(
        validateTransaction({
          id: "tx-001",
          createdAt: "2026-03-01T10:00:00.000Z",
          type: "withdrawal",
          description: "Coffee",
          amount: 5.5,
          date: "2026-03-01",
          sourceAccountId: "checking-account",
          categoryId: "dining",
        }),
      ).toBe(true);
    });

    it("accepts a valid transfer", () => {
      expect(
        validateTransaction({
          id: "tx-002",
          createdAt: "2026-03-01T10:00:00.000Z",
          type: "transfer",
          description: "Savings",
          amount: 500,
          date: "2026-03-01",
          sourceAccountId: "checking-account",
          destinationAccountId: "savings-account",
        }),
      ).toBe(true);
    });

    it("rejects transaction with non-positive amount", () => {
      expect(
        validateTransaction({
          id: "tx-003",
          createdAt: "2026-03-01T10:00:00.000Z",
          type: "withdrawal",
          description: "Bad amount",
          amount: 0,
          date: "2026-03-01",
          sourceAccountId: "checking-account",
        }),
      ).toBe(false);
    });

    it("rejects transaction missing required fields", () => {
      expect(validateTransaction({ description: "No ID", amount: 10, date: "2026-03-01" })).toBe(
        false,
      );
    });

    it("rejects transaction with invalid date format", () => {
      expect(
        validateTransaction({
          id: "tx-004",
          createdAt: "2026-03-01T10:00:00.000Z",
          type: "withdrawal",
          description: "Test",
          amount: 10,
          date: "March 1",
          sourceAccountId: "checking-account",
        }),
      ).toBe(false);
    });

    it("rejects transaction with extra properties", () => {
      expect(
        validateTransaction({
          id: "tx-005",
          createdAt: "2026-03-01T10:00:00.000Z",
          type: "withdrawal",
          description: "Test",
          amount: 10,
          date: "2026-03-01",
          sourceAccountId: "checking-account",
          extraField: "nope",
        }),
      ).toBe(false);
    });
  });

  describe("budget validation", () => {
    it("accepts a valid budget", () => {
      expect(
        validateBudget({
          id: "groceries-budget",
          createdAt: "2026-01-01T00:00:00.000Z",
          name: "Grocery Budget",
          categoryId: "groceries",
          amount: 400,
          period: "monthly",
          startDate: "2026-01-01",
        }),
      ).toBe(true);
    });

    it("rejects budget with invalid period enum", () => {
      expect(
        validateBudget({
          id: "test",
          createdAt: "2026-01-01T00:00:00.000Z",
          name: "Test",
          amount: 100,
          period: "daily",
        }),
      ).toBe(false);
    });

    it("rejects budget with zero amount", () => {
      expect(
        validateBudget({
          id: "test",
          createdAt: "2026-01-01T00:00:00.000Z",
          name: "Test",
          amount: 0,
        }),
      ).toBe(false);
    });
  });

  describe("categories collection validation", () => {
    it("accepts valid categories", () => {
      expect(
        validateCategories({
          categories: [
            { id: "food", createdAt: "2026-01-01T00:00:00.000Z", name: "Food", color: "green" },
          ],
        }),
      ).toBe(true);
    });

    it("rejects category with invalid color enum", () => {
      expect(
        validateCategories({
          categories: [
            { id: "food", createdAt: "2026-01-01T00:00:00.000Z", name: "Food", color: "teal" },
          ],
        }),
      ).toBe(false);
    });
  });

  describe("tags collection validation", () => {
    it("accepts valid tags", () => {
      expect(
        validateTags({
          tags: [{ id: "recurring", createdAt: "2026-01-01T00:00:00.000Z", name: "Recurring" }],
        }),
      ).toBe(true);
    });
  });

  describe("default seed data validation", () => {
    it("categories.json passes schema", async () => {
      const data = await loadJson(path.join(defaultsDir, "categories.json"));
      expect(validateCategories(data)).toBe(true);
    });

    it("tags.json passes schema", async () => {
      const data = await loadJson(path.join(defaultsDir, "tags.json"));
      expect(validateTags(data)).toBe(true);
    });

    it("all default accounts pass schema", async () => {
      const files = (await readdir(path.join(defaultsDir, "accounts"))).filter((f) =>
        f.endsWith(".json"),
      );
      for (const file of files) {
        const data = await loadJson(path.join(defaultsDir, "accounts", file));
        const valid = validateAccount(data);
        if (!valid) console.error(`Validation errors for ${file}:`, validateAccount.errors);
        expect(valid).toBe(true);
      }
    });

    it("all default transactions pass schema", async () => {
      const files = (await readdir(path.join(defaultsDir, "transactions"))).filter((f) =>
        f.endsWith(".json"),
      );
      for (const file of files) {
        const data = await loadJson(path.join(defaultsDir, "transactions", file));
        const valid = validateTransaction(data);
        if (!valid) console.error(`Validation errors for ${file}:`, validateTransaction.errors);
        expect(valid).toBe(true);
      }
    });

    it("all default budgets pass schema", async () => {
      const files = (await readdir(path.join(defaultsDir, "budgets"))).filter((f) =>
        f.endsWith(".json"),
      );
      for (const file of files) {
        const data = await loadJson(path.join(defaultsDir, "budgets", file));
        const valid = validateBudget(data);
        if (!valid) console.error(`Validation errors for ${file}:`, validateBudget.errors);
        expect(valid).toBe(true);
      }
    });
  });
});
