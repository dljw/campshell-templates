import path from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { resetTemplate, startTemplate, stopTemplate } from "@campshell/core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface LifecycleConfig {
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
      onStarted: ({ skillCopied, port }) => {
        process.stderr.write("\n\u2713 CRM is ready\n");
        if (skillCopied) {
          process.stderr.write("\u2713 SKILL.md installed at skills/campshell-crm/SKILL.md\n");
        }
        process.stderr.write("\u2713 Data directory: ~/.campshell/data/crm/\n");
        if (!config.skipDashboard) {
          process.stderr.write(`\u2713 Dashboard: http://localhost:${port}\n`);
        }
        process.stderr.write("\nNext steps:\n");
        process.stderr.write(
          "  Your AI agent can read skills/campshell-crm/SKILL.md to operate this CRM.\n",
        );
        process.stderr.write("  Run `campshell-crm query list-contacts` to see all contacts.\n");
        process.stderr.write("  Run `campshell-crm stop` to stop the template.\n");
      },
    },
  );
}

export async function stop(config: LifecycleConfig): Promise<void> {
  await stopTemplate(
    {
      home: config.home,
      templateName: "crm",
      skipDashboard: config.skipDashboard,
    },
    {
      onStopped: () => {
        process.stderr.write("\u2713 CRM stopped. Data preserved at ~/.campshell/data/crm/\n");
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
      rl.question("This will delete all CRM data. Continue? [y/N] ", resolve);
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
      templateName: "crm",
      templatePackageDir: resolveTemplatePackageDir(config),
      confirmed: true,
    },
    {
      onReset: () => {
        process.stderr.write("\u2713 CRM data reset to defaults\n");
      },
    },
  );
}
