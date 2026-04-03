import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getFreePort } from "../../../packages/core/src/test-helpers.js";
import { reset, start, stop } from "./lifecycle.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatePackageDir = path.resolve(__dirname, "..");
const monorepoRoot = path.resolve(__dirname, "..", "..", "..");
const dashboardEntry = path.join(monorepoRoot, "packages", "dashboard", "dist", "server.js");

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
    // Kill any dashboard that might still be running
    const infoPath = path.join(home, "runtime", "dashboard.json");
    if (existsSync(infoPath)) {
      try {
        const info = JSON.parse(await readFile(infoPath, "utf-8"));
        process.kill(Number(info.pid), "SIGTERM");
      } catch {
        // Already gone
      }
    }
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

      const kanbanDir = path.join(home, "data", "kanban");
      const cardsDir = path.join(kanbanDir, "cards");

      expect(existsSync(kanbanDir)).toBe(true);
      expect(existsSync(cardsDir)).toBe(true);
      expect(existsSync(path.join(kanbanDir, "columns.json"))).toBe(true);

      const cards = await readdir(cardsDir);
      expect(cards).toContain("welcome-card-1.json");
      expect(cards).toContain("welcome-card-2.json");
      expect(cards).toContain("welcome-card-3.json");
    });

    it("registers template in registry with status running", async () => {
      await start(cfg());

      const registryPath = path.join(home, "registry.json");
      expect(existsSync(registryPath)).toBe(true);

      const registry = JSON.parse(await readFile(registryPath, "utf-8"));
      expect(registry.templates).toHaveLength(1);
      expect(registry.templates[0].name).toBe("kanban");
      expect(registry.templates[0].status).toBe("running");
      expect(registry.templates[0].route).toBe("/kanban");
      expect(registry.templates[0].skillPath).toBe(
        path.join("skills", "campshell-kanban", "SKILL.md"),
      );
    });

    it("is idempotent — second call does not duplicate card files", async () => {
      await start(cfg());
      await start(cfg());

      const cards = await readdir(path.join(home, "data", "kanban", "cards"));
      expect(cards).toHaveLength(3);
    });

    it("repairs missing defaults on re-run", async () => {
      await start(cfg());

      // Delete a card file
      await rm(path.join(home, "data", "kanban", "cards", "welcome-card-1.json"));

      await start(cfg());

      expect(existsSync(path.join(home, "data", "kanban", "cards", "welcome-card-1.json"))).toBe(
        true,
      );
    });

    it("preserves user-created data files", async () => {
      await start(cfg());

      // Add a custom card
      const customCard = path.join(home, "data", "kanban", "cards", "custom-card.json");
      await writeFile(customCard, JSON.stringify({ id: "custom", title: "My card" }));

      await start(cfg());

      expect(existsSync(customCard)).toBe(true);
      const data = JSON.parse(await readFile(customCard, "utf-8"));
      expect(data.title).toBe("My card");
    });

    it("copies SKILL.md when present in template package", async () => {
      // Create a temporary SKILL.md in template package dir
      const tmpPkgDir = path.join(home, "_template_pkg");
      await mkdir(path.join(tmpPkgDir, "defaults", "cards"), {
        recursive: true,
      });
      // Copy campshell.json and defaults from real template
      const realDefaults = path.join(templatePackageDir, "defaults");
      await writeFile(
        path.join(tmpPkgDir, "campshell.json"),
        await readFile(path.join(templatePackageDir, "campshell.json"), "utf-8"),
      );
      await writeFile(
        path.join(tmpPkgDir, "defaults", "columns.json"),
        await readFile(path.join(realDefaults, "columns.json"), "utf-8"),
      );
      // Create SKILL.md
      await writeFile(path.join(tmpPkgDir, "SKILL.md"), "# Test SKILL.md\n");

      await start(cfg({ templatePackageDir: tmpPkgDir }));

      const skillDest = path.join(home, "skills", "campshell-kanban", "SKILL.md");
      expect(existsSync(skillDest)).toBe(true);
      const content = await readFile(skillDest, "utf-8");
      expect(content).toBe("# Test SKILL.md\n");
    });

    it("does not fail when SKILL.md is absent", async () => {
      await start(cfg());

      const skillDest = path.join(home, "skills", "campshell-kanban", "SKILL.md");
      // SKILL.md doesn't exist in real template yet (US-5.1)
      // Just verify start didn't throw
      expect(existsSync(path.join(home, "data", "kanban"))).toBe(true);
    });

    it("re-start after stop sets status back to running", async () => {
      await start(cfg());
      await stop(cfg());

      const registryPath = path.join(home, "registry.json");
      let registry = JSON.parse(await readFile(registryPath, "utf-8"));
      expect(registry.templates[0].status).toBe("stopped");

      await start(cfg());

      registry = JSON.parse(await readFile(registryPath, "utf-8"));
      expect(registry.templates[0].status).toBe("running");
    });
  });

  describe("stop", () => {
    it("sets status to stopped and preserves data", async () => {
      await start(cfg());
      await stop(cfg());

      const registryPath = path.join(home, "registry.json");
      const registry = JSON.parse(await readFile(registryPath, "utf-8"));
      expect(registry.templates[0].status).toBe("stopped");

      // Data is preserved
      expect(existsSync(path.join(home, "data", "kanban", "columns.json"))).toBe(true);
      const cards = await readdir(path.join(home, "data", "kanban", "cards"));
      expect(cards.length).toBeGreaterThan(0);
    });

    it("is a no-op on unregistered template", async () => {
      // Should not throw
      await stop(cfg());
    });
  });

  describe("reset", () => {
    it("deletes data and re-copies defaults with skipPrompt", async () => {
      await start(cfg());

      // Add custom card
      await writeFile(
        path.join(home, "data", "kanban", "cards", "custom-card.json"),
        JSON.stringify({ id: "custom", title: "Gone" }),
      );

      await reset(cfg({ skipPrompt: true }));

      // Custom card is gone
      expect(existsSync(path.join(home, "data", "kanban", "cards", "custom-card.json"))).toBe(
        false,
      );

      // Defaults are restored
      expect(existsSync(path.join(home, "data", "kanban", "columns.json"))).toBe(true);
      const cards = await readdir(path.join(home, "data", "kanban", "cards"));
      expect(cards).toContain("welcome-card-1.json");
    });
  });

  describe("dashboard integration", () => {
    const hasDashboard = existsSync(dashboardEntry);

    it.skipIf(!hasDashboard)(
      "start spawns dashboard, stop kills it",
      async () => {
        const port = await getFreePort();
        await start(
          cfg({
            port,
            skipDashboard: false,
            dashboardEntryPath: dashboardEntry,
          }),
        );

        // Verify dashboard info file exists
        const infoPath = path.join(home, "runtime", "dashboard.json");
        expect(existsSync(infoPath)).toBe(true);

        // Verify health endpoint responds
        const health = await fetchHealth(port);
        expect(health.status).toBe("ok");
        expect(health.templates).toContain("kanban");

        // Stop should kill the dashboard (no other templates running)
        await stop(
          cfg({
            skipDashboard: false,
            dashboardEntryPath: dashboardEntry,
          }),
        );

        // Give process a moment to clean up
        await new Promise((r) => setTimeout(r, 500));

        // Dashboard info file should be gone or process should be dead
        if (existsSync(infoPath)) {
          const pid = JSON.parse(await readFile(infoPath, "utf-8")).pid;
          let alive = false;
          try {
            process.kill(pid, 0);
            alive = true;
          } catch {
            alive = false;
          }
          expect(alive).toBe(false);
        }
      },
      { timeout: 15000 },
    );

    it("start throws when dashboard binary is missing", async () => {
      await expect(
        start(
          cfg({
            skipDashboard: false,
            dashboardEntryPath: path.join(home, "nonexistent", "server.js"),
          }),
        ),
      ).rejects.toThrow("Dashboard binary not found");
    });

    it.skipIf(!hasDashboard)(
      "start restarts dashboard on re-run",
      async () => {
        const port = await getFreePort();
        await start(
          cfg({
            port,
            skipDashboard: false,
            dashboardEntryPath: dashboardEntry,
          }),
        );

        const infoPath = path.join(home, "runtime", "dashboard.json");
        const firstPid = JSON.parse(await readFile(infoPath, "utf-8")).pid;

        // Start again — should restart dashboard
        await start(
          cfg({
            port,
            skipDashboard: false,
            dashboardEntryPath: dashboardEntry,
          }),
        );

        const secondPid = JSON.parse(await readFile(infoPath, "utf-8")).pid;

        // Different PID means it was restarted
        expect(secondPid).not.toBe(firstPid);

        // Health should still work
        const health = await fetchHealth(port);
        expect(health.status).toBe("ok");
      },
      { timeout: 15000 },
    );
  });
});

async function fetchHealth(port: number): Promise<{ status: string; templates: string[] }> {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${port}/health`, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve(JSON.parse(data));
      });
    });
    req.on("error", reject);
    req.setTimeout(2000, () => {
      req.destroy();
      reject(new Error("Health check timeout"));
    });
  });
}
