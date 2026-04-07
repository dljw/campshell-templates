import path from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { resetTemplate, startTemplate, stopTemplate } from "@campshell/core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface LifecycleConfig {
  /** Campshell home directory. */
  home: string;
  /** Dashboard port (default 4000) */
  port?: number;
  /** Skip opening browser (testing) */
  skipBrowser?: boolean;
  /** Skip dashboard spawn/kill (testing) */
  skipDashboard?: boolean;
  /** Skip reset confirmation prompt (--yes flag) */
  skipPrompt?: boolean;
  /** Override for defaults/manifest location */
  templatePackageDir?: string;
  /** Override for dashboard binary path */
  dashboardEntryPath?: string;
}

function resolveTemplatePackageDir(config: LifecycleConfig): string {
  return config.templatePackageDir ?? path.resolve(__dirname, "..");
}

// ---------------------------------------------------------------------------
// start
// ---------------------------------------------------------------------------

export async function start(config: LifecycleConfig): Promise<void> {
  await startTemplate(
    {
      home: config.home,
      templatePackageDir: resolveTemplatePackageDir(config),
      port: config.port,
      skipBrowser: config.skipBrowser,
      skipDashboard: config.skipDashboard,
      dashboardEntryPath: config.dashboardEntryPath,
    },
    {
      onStarted: ({ skillCopied, port }) => {
        process.stderr.write("\n✓ Budget Tracker is ready\n");
        if (skillCopied) {
          process.stderr.write(
            "✓ SKILL.md installed at skills/campshell-budget-tracker/SKILL.md\n",
          );
        }
        process.stderr.write(`✓ Data directory: ${path.join(config.home, "data", "budget-tracker")}\n`);
        if (!config.skipDashboard) {
          process.stderr.write(`✓ Dashboard: http://localhost:${port}\n`);
        }
        process.stderr.write("\nNext steps:\n");
        process.stderr.write(
          "  Your AI agent can read skills/campshell-budget-tracker/SKILL.md to operate this tracker.\n",
        );
        process.stderr.write(
          "  Run `campshell-budget-tracker query list transactions` to see all transactions.\n",
        );
        process.stderr.write("  Run `campshell-budget-tracker stop` to stop the template.\n");
      },
    },
  );
}

// ---------------------------------------------------------------------------
// stop
// ---------------------------------------------------------------------------

export async function stop(config: LifecycleConfig): Promise<void> {
  await stopTemplate(
    {
      home: config.home,
      templateName: "budget-tracker",
      skipDashboard: config.skipDashboard,
    },
    {
      onStopped: () => {
        process.stderr.write(
          `✓ Budget Tracker stopped. Data preserved at ${path.join(config.home, "data", "budget-tracker")}\n`,
        );
      },
    },
  );
}

// ---------------------------------------------------------------------------
// reset
// ---------------------------------------------------------------------------

export async function reset(config: LifecycleConfig): Promise<void> {
  if (!config.skipPrompt) {
    const rl = createInterface({
      input: process.stdin,
      output: process.stderr,
    });
    const answer = await new Promise<string>((resolve) => {
      rl.question("This will delete all budget tracker data. Continue? [y/N] ", resolve);
    });
    rl.close();
    if (answer.toLowerCase() !== "y") {
      process.stderr.write("Aborted.\n");
      return;
    }
  }

  await resetTemplate(
    {
      home: config.home,
      templateName: "budget-tracker",
      templatePackageDir: resolveTemplatePackageDir(config),
      confirmed: true,
    },
    {
      onReset: () => {
        process.stderr.write("✓ Budget Tracker data reset to defaults\n");
      },
    },
  );
}
