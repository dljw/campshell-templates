/**
 * Dev install script — builds and installs the PostHog template into
 * ~/.campshell/templates/ so it's picked up by `pnpm tauri:dev`.
 *
 * Usage (from campshell-templates/posthog/):
 *   node dev-install.mjs
 *
 * Or via the package.json script:
 *   pnpm dev-install
 */
import { buildBundle, installBundle, resolveCampshellHome } from "@campshell/core";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const templateDir = path.dirname(fileURLToPath(import.meta.url));
const campshellHome = resolveCampshellHome();

// 1. Build TypeScript service handlers
console.log("▸ Building service handlers...");
execSync("pnpm run build", { cwd: templateDir, stdio: "inherit" });

// 2. Build the React UI
console.log("▸ Building UI...");
execSync("pnpm run build", { cwd: path.join(templateDir, "ui"), stdio: "inherit" });

// 3. Package into a .campshell bundle
console.log("▸ Packaging bundle...");
const { bundlePath, warnings } = await buildBundle({ templateDir });
for (const w of warnings) console.warn("  Warning:", w);

// 4. Install bundle into ~/.campshell/templates/
console.log(`▸ Installing to ${campshellHome}/templates/...`);
const result = await installBundle(bundlePath, campshellHome, { source: "local" });

console.log(`\n✓ PostHog template installed (${result.name} v${result.version})`);
console.log("  You can now run: pnpm tauri:dev");
