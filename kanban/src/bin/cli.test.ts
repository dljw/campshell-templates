import { execFile } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.join(__dirname, "..", "..", "dist", "bin", "cli.js");

function run(args: string[]): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    execFile("node", [cliPath, ...args], (error, stdout, stderr) => {
      resolve({
        stdout: stdout.toString(),
        stderr: stderr.toString(),
        code: error?.code !== undefined ? (error.code as unknown as number) : 0,
      });
    });
  });
}

describe("campshell-kanban CLI", () => {
  describe("top-level", () => {
    it("bare invocation shows help and exits 0", async () => {
      const { stdout, code } = await run([]);
      expect(code).toBe(0);
      expect(stdout).toContain("campshell-kanban");
      expect(stdout).toContain("query");
    });

    it("shows help with --help", async () => {
      const { stdout, code } = await run(["--help"]);
      expect(code).toBe(0);
      expect(stdout).toContain("campshell-kanban");
      expect(stdout).toContain("Kanban board CLI for Campshell");
      expect(stdout).toContain("query");
      expect(stdout).toContain("start");
      expect(stdout).toContain("stop");
    });

    it("shows version with --version", async () => {
      const { stdout, code } = await run(["--version"]);
      expect(code).toBe(0);
      expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe("query command", () => {
    it("shows query subcommands with --help", async () => {
      const { stdout, code } = await run(["query", "--help"]);
      expect(code).toBe(0);
      expect(stdout).toContain("list");
      expect(stdout).toContain("get");
      expect(stdout).toContain("columns");
      expect(stdout).toContain("overdue");
      expect(stdout).toContain("search");
    });

    it("query list --help shows options", async () => {
      const { stdout, code } = await run(["query", "list", "--help"]);
      expect(code).toBe(0);
      expect(stdout).toContain("--column");
      expect(stdout).toContain("--priority");
      expect(stdout).toContain("--data-dir");
    });

    it("query get --help shows id argument", async () => {
      const { stdout, code } = await run(["query", "get", "--help"]);
      expect(code).toBe(0);
      expect(stdout).toContain("id");
    });

    it("query search --help shows term argument", async () => {
      const { stdout, code } = await run(["query", "search", "--help"]);
      expect(code).toBe(0);
      expect(stdout).toContain("term");
    });
  });

  describe("lifecycle commands", () => {
    it("start --help shows description", async () => {
      const { stdout, code } = await run(["start", "--help"]);
      expect(code).toBe(0);
      expect(stdout).toContain("Install and start the kanban template");
    });

    it("stop --help shows description", async () => {
      const { stdout, code } = await run(["stop", "--help"]);
      expect(code).toBe(0);
      expect(stdout).toContain("Stop the kanban template");
    });

    it("reset --help shows --yes flag", async () => {
      const { stdout, code } = await run(["reset", "--help"]);
      expect(code).toBe(0);
      expect(stdout).toContain("--yes");
      expect(stdout).toContain("Skip confirmation prompt");
    });
  });

  describe("query implementations", () => {
    let dataDir: string;

    const columns = {
      columns: [
        { id: "backlog", name: "Backlog", order: 0, color: "#6B7280" },
        { id: "todo", name: "To Do", order: 1, color: "#3B82F6" },
        { id: "in-progress", name: "In Progress", order: 2, color: "#F59E0B" },
        { id: "done", name: "Done", order: 3, color: "#10B981" },
      ],
    };

    const cards = [
      {
        id: "card-1",
        title: "Fix authentication bug",
        description: "The auth middleware is rejecting valid tokens",
        column: "in-progress",
        priority: "high",
        labels: ["backend"],
        dueDate: "2020-01-01",
        order: 0,
        createdAt: "2026-03-20T10:00:00Z",
      },
      {
        id: "card-2",
        title: "Update API docs",
        column: "todo",
        priority: "medium",
        dueDate: "2020-03-18",
        order: 0,
        createdAt: "2026-03-19T08:00:00Z",
      },
      {
        id: "card-3",
        title: "Design landing page",
        description: "Create mockups for the new landing page design",
        column: "backlog",
        priority: "low",
        order: 0,
        createdAt: "2026-03-18T12:00:00Z",
      },
      {
        id: "card-4",
        title: "Refactor auth service",
        description: "Clean up the authentication service layer",
        column: "todo",
        priority: "high",
        order: 1,
        createdAt: "2026-03-17T09:00:00Z",
      },
      {
        id: "card-5",
        title: "Write unit tests",
        column: "in-progress",
        priority: "urgent",
        dueDate: "2099-12-31",
        order: 1,
        createdAt: "2026-03-16T14:00:00Z",
      },
      {
        id: "card-6",
        title: "Deploy to production",
        column: "done",
        priority: "high",
        order: 0,
        createdAt: "2026-03-15T16:00:00Z",
      },
    ];

    beforeEach(async () => {
      dataDir = await new Promise<string>((resolve, reject) => {
        const dir = path.join(os.tmpdir(), `campshell-cli-test-${Date.now()}`);
        mkdir(dir, { recursive: true })
          .then(() => resolve(dir))
          .catch(reject);
      });
      await mkdir(path.join(dataDir, "cards"), { recursive: true });
      await writeFile(path.join(dataDir, "columns.json"), JSON.stringify(columns));
      for (const card of cards) {
        await writeFile(path.join(dataDir, "cards", `${card.id}.json`), JSON.stringify(card));
      }
    });

    afterEach(async () => {
      await rm(dataDir, { recursive: true, force: true });
    });

    function q(args: string[]) {
      return run(["query", ...args, "--data-dir", dataDir]);
    }

    describe("query list", () => {
      it("returns all cards sorted by column order then card order", async () => {
        const { stdout, code } = await q(["list"]);
        expect(code).toBe(0);
        const result = JSON.parse(stdout);
        expect(result).toHaveLength(6);
        // First card should be from backlog (order 0), last from done (order 3)
        expect(result[0].column).toBe("backlog");
        expect(result[result.length - 1].column).toBe("done");
      });

      it("filters by column name", async () => {
        const { stdout, code } = await q(["list", "--column", "In Progress"]);
        expect(code).toBe(0);
        const result = JSON.parse(stdout);
        expect(result).toHaveLength(2);
        for (const card of result) {
          expect(card.column).toBe("in-progress");
        }
      });

      it("filters by column id", async () => {
        const { stdout, code } = await q(["list", "--column", "todo"]);
        expect(code).toBe(0);
        const result = JSON.parse(stdout);
        expect(result).toHaveLength(2);
        for (const card of result) {
          expect(card.column).toBe("todo");
        }
      });

      it("filters by priority", async () => {
        const { stdout, code } = await q(["list", "--priority", "urgent"]);
        expect(code).toBe(0);
        const result = JSON.parse(stdout);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("card-5");
      });

      it("supports multiple filters", async () => {
        const { stdout, code } = await q(["list", "--column", "To Do", "--priority", "high"]);
        expect(code).toBe(0);
        const result = JSON.parse(stdout);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("card-4");
      });

      it("returns empty array when no matches", async () => {
        const { stdout, code } = await q(["list", "--priority", "urgent", "--column", "done"]);
        expect(code).toBe(0);
        const result = JSON.parse(stdout);
        expect(result).toEqual([]);
      });

      it("sorts cards without order after explicitly ordered cards", async () => {
        // Add a card without order in the same column as card-2 (todo, order 0)
        await writeFile(
          path.join(dataDir, "cards", "card-no-order.json"),
          JSON.stringify({
            id: "card-no-order",
            title: "No order card",
            column: "todo",
            priority: "low",
            createdAt: "2026-03-20T10:00:00Z",
          }),
        );
        const { stdout, code } = await q(["list", "--column", "todo"]);
        expect(code).toBe(0);
        const result = JSON.parse(stdout);
        expect(result).toHaveLength(3);
        // Explicitly ordered cards come first
        const ids = result.map((c: { id: string }) => c.id);
        expect(ids.indexOf("card-no-order")).toBeGreaterThan(ids.indexOf("card-2"));
        expect(ids.indexOf("card-no-order")).toBeGreaterThan(ids.indexOf("card-4"));
      });
    });

    describe("query get", () => {
      it("returns a single card by ID", async () => {
        const { stdout, code } = await q(["get", "card-1"]);
        expect(code).toBe(0);
        const result = JSON.parse(stdout);
        expect(result.id).toBe("card-1");
        expect(result.title).toBe("Fix authentication bug");
      });

      it("returns structured error for not-found card", async () => {
        const { stdout, code } = await q(["get", "nonexistent"]);
        expect(code).not.toBe(0);
        const result = JSON.parse(stdout);
        expect(result.error).toBe("not_found");
        expect(result.message).toContain("nonexistent");
      });

      it("rejects path traversal attempts", async () => {
        const { stdout, code } = await q(["get", "../columns"]);
        expect(code).not.toBe(0);
        const result = JSON.parse(stdout);
        expect(result.error).toBe("not_found");
      });
    });

    describe("query columns", () => {
      it("returns columns with card counts", async () => {
        const { stdout, code } = await q(["columns"]);
        expect(code).toBe(0);
        const result = JSON.parse(stdout);
        expect(result).toHaveLength(4);
        // Sorted by order
        expect(result[0].id).toBe("backlog");
        expect(result[0].cardCount).toBe(1);
        expect(result[1].id).toBe("todo");
        expect(result[1].cardCount).toBe(2);
        expect(result[2].id).toBe("in-progress");
        expect(result[2].cardCount).toBe(2);
        expect(result[3].id).toBe("done");
        expect(result[3].cardCount).toBe(1);
      });
    });

    describe("query overdue", () => {
      it("returns cards past their due date with daysOverdue", async () => {
        const { stdout, code } = await q(["overdue"]);
        expect(code).toBe(0);
        const result = JSON.parse(stdout);
        // card-1 (dueDate 2020-01-01) and card-2 (dueDate 2020-03-18) are overdue
        // card-5 (dueDate 2099-12-31) is not overdue
        expect(result).toHaveLength(2);
        for (const card of result) {
          expect(card.daysOverdue).toBeGreaterThan(0);
        }
        // Most overdue first (card-1 is from 2020-01-01)
        expect(result[0].id).toBe("card-1");
        expect(result[1].id).toBe("card-2");
      });

      it("daysOverdue is a positive integer", async () => {
        const { stdout, code } = await q(["overdue"]);
        expect(code).toBe(0);
        const result = JSON.parse(stdout);
        for (const card of result) {
          expect(Number.isInteger(card.daysOverdue)).toBe(true);
          expect(card.daysOverdue).toBeGreaterThan(0);
        }
      });

      it("returns empty array when no cards are overdue", async () => {
        const { stdout, code } = await q(["overdue", "--column", "done"]);
        expect(code).toBe(0);
        const result = JSON.parse(stdout);
        expect(result).toEqual([]);
      });
    });

    describe("query search", () => {
      it("searches title case-insensitively", async () => {
        const { stdout, code } = await q(["search", "auth"]);
        expect(code).toBe(0);
        const result = JSON.parse(stdout);
        // card-1 (title), card-1 (description), card-4 (title + description)
        expect(result.length).toBeGreaterThanOrEqual(2);
        for (const r of result) {
          expect(r.matchedIn.length).toBeGreaterThan(0);
        }
      });

      it("searches description field", async () => {
        const { stdout, code } = await q(["search", "mockups"]);
        expect(code).toBe(0);
        const result = JSON.parse(stdout);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("card-3");
        expect(result[0].matchedIn).toContain("description");
      });

      it("returns matchedIn array indicating matched fields", async () => {
        const { stdout, code } = await q(["search", "auth"]);
        expect(code).toBe(0);
        const result = JSON.parse(stdout);
        // card-1 has "auth" in both title and description
        const card1 = result.find((r: { id: string }) => r.id === "card-1");
        expect(card1).toBeDefined();
        expect(card1.matchedIn).toContain("title");
        expect(card1.matchedIn).toContain("description");
      });

      it("returns empty array for no matches", async () => {
        const { stdout, code } = await q(["search", "zzzznotfound"]);
        expect(code).toBe(0);
        const result = JSON.parse(stdout);
        expect(result).toEqual([]);
      });
    });

    describe("all outputs are valid JSON", () => {
      it("list output is valid JSON", async () => {
        const { stdout } = await q(["list"]);
        expect(() => JSON.parse(stdout)).not.toThrow();
      });

      it("get output is valid JSON", async () => {
        const { stdout } = await q(["get", "card-1"]);
        expect(() => JSON.parse(stdout)).not.toThrow();
      });

      it("get not-found output is valid JSON", async () => {
        const { stdout } = await q(["get", "nope"]);
        expect(() => JSON.parse(stdout)).not.toThrow();
      });

      it("columns output is valid JSON", async () => {
        const { stdout } = await q(["columns"]);
        expect(() => JSON.parse(stdout)).not.toThrow();
      });

      it("overdue output is valid JSON", async () => {
        const { stdout } = await q(["overdue"]);
        expect(() => JSON.parse(stdout)).not.toThrow();
      });

      it("search output is valid JSON", async () => {
        const { stdout } = await q(["search", "test"]);
        expect(() => JSON.parse(stdout)).not.toThrow();
      });
    });
  });
});
