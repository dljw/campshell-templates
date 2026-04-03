import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { reset, start, stop } from "./lifecycle.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatePackageDir = path.resolve(__dirname, "..");

describe("lifecycle", () => {
  let home: string;

  beforeEach(async () => {
    home = path.join(
      os.tmpdir(),
      `campshell-lifecycle-test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    );
    await mkdir(home, { recursive: true });
  });

  afterEach(async () => {
    await rm(home, { recursive: true, force: true });
  });

  function cfg(overrides?: Partial<Parameters<typeof start>[0]>): Parameters<typeof start>[0] {
    return {
      home,
      skipBrowser: true,
      skipDashboard: true,
      templatePackageDir,
      ...overrides,
    };
  }

  describe("start", () => {
    it("creates data directories and copies defaults", async () => {
      await start(cfg());

      const dataDir = path.join(home, "data", "budget-tracker");
      expect(existsSync(dataDir)).toBe(true);
      expect(existsSync(path.join(dataDir, "accounts"))).toBe(true);
      expect(existsSync(path.join(dataDir, "transactions"))).toBe(true);
      expect(existsSync(path.join(dataDir, "budgets"))).toBe(true);
      expect(existsSync(path.join(dataDir, "categories.json"))).toBe(true);
      expect(existsSync(path.join(dataDir, "tags.json"))).toBe(true);

      const accounts = await readdir(path.join(dataDir, "accounts"));
      expect(accounts).toContain("checking-account.json");

      const transactions = await readdir(path.join(dataDir, "transactions"));
      expect(transactions).toContain("salary-deposit-01.json");
    });

    it("registers template with status running", async () => {
      await start(cfg());

      const registryPath = path.join(home, "registry.json");
      expect(existsSync(registryPath)).toBe(true);

      const registry = JSON.parse(await readFile(registryPath, "utf-8"));
      expect(registry.templates).toHaveLength(1);
      expect(registry.templates[0].name).toBe("budget-tracker");
      expect(registry.templates[0].status).toBe("running");
      expect(registry.templates[0].route).toBe("/budget-tracker");
    });

    it("is idempotent — second call does not duplicate files", async () => {
      await start(cfg());
      await start(cfg());

      const accounts = await readdir(path.join(home, "data", "budget-tracker", "accounts"));
      expect(accounts).toHaveLength(6);
    });

    it("preserves user-created data files", async () => {
      await start(cfg());

      const customTx = path.join(
        home,
        "data",
        "budget-tracker",
        "transactions",
        "my-custom-tx.json",
      );
      await writeFile(customTx, JSON.stringify({ id: "my-custom-tx", description: "Custom" }));

      await start(cfg());

      expect(existsSync(customTx)).toBe(true);
    });
  });

  describe("stop", () => {
    it("sets status to stopped and preserves data", async () => {
      await start(cfg());
      await stop(cfg());

      const registry = JSON.parse(await readFile(path.join(home, "registry.json"), "utf-8"));
      expect(registry.templates[0].status).toBe("stopped");

      expect(existsSync(path.join(home, "data", "budget-tracker", "categories.json"))).toBe(true);
    });

    it("is a no-op on unregistered template", async () => {
      await stop(cfg());
    });
  });

  describe("reset", () => {
    it("deletes data and re-copies defaults with skipPrompt", async () => {
      await start(cfg());

      const customTx = path.join(
        home,
        "data",
        "budget-tracker",
        "transactions",
        "custom-tx.json",
      );
      await writeFile(customTx, JSON.stringify({ id: "custom-tx", description: "Gone" }));

      await reset(cfg({ skipPrompt: true }));

      expect(existsSync(customTx)).toBe(false);
      expect(
        existsSync(
          path.join(home, "data", "budget-tracker", "transactions", "salary-deposit-01.json"),
        ),
      ).toBe(true);
    });
  });
});
