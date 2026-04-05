import path from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { resetTemplate, startTemplate, stopTemplate } from "@campshell/core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface LifecycleConfig {
  /** Campshell home directory (~/.campshell/). */
  home: string;
  port?: number;
  skipBrowser?: boolean;
  skipDashboard?: boolean;
  skipPrompt?: boolean;
  templatePackageDir?: string;
  dashboardEntryPath?: string;
}

function resolveTemplatePackageDir(config: LifecycleConfig): string {
  return config.templatePackageDir ?? path.resolve(__dirname, "..");
}

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
      onStarted: ({ templateName, skillCopied, port }) => {
        process.stderr.write("\n✓ Social Media is ready\n");
        if (skillCopied) {
          process.stderr.write(
            `✓ SKILL.md installed at skills/campshell-${templateName}/SKILL.md\n`,
          );
        }
        process.stderr.write(`✓ Data directory: ~/.campshell/data/${templateName}/\n`);
        if (!config.skipDashboard) {
          process.stderr.write(`✓ Dashboard: http://localhost:${port}\n`);
        }
      },
    },
  );
}

export async function stop(config: LifecycleConfig): Promise<void> {
  await stopTemplate(
    {
      home: config.home,
      templateName: "social-media",
      skipDashboard: config.skipDashboard,
    },
    {
      onStopped: ({ templateName }) => {
        process.stderr.write(
          `✓ Social Media stopped. Data preserved at ~/.campshell/data/${templateName}/\n`,
        );
      },
    },
  );
}

export async function reset(config: LifecycleConfig): Promise<void> {
  if (!config.skipPrompt) {
    const rl = createInterface({
      input: process.stdin,
      output: process.stderr,
    });
    const answer = await new Promise<string>((resolve) => {
      rl.question("This will delete all Social Media data. Continue? [y/N] ", resolve);
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
      templateName: "social-media",
      templatePackageDir: resolveTemplatePackageDir(config),
      confirmed: true,
    },
    {
      onReset: () => {
        process.stderr.write("✓ Social Media data reset to defaults\n");
      },
    },
  );
}
