/**
 * Dev install — builds and installs the apify-meta template into
 * ~/.campshell/templates/.
 */
import { buildBundle, installBundle, resolveCampshellHome } from "@campshell/core";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const templateDir = path.dirname(fileURLToPath(import.meta.url));
const campshellHome = resolveCampshellHome();

console.log("▸ Building service handlers...");
execSync("pnpm run build", { cwd: templateDir, stdio: "inherit" });

console.log("▸ Building UI...");
execSync("pnpm run build", { cwd: path.join(templateDir, "ui"), stdio: "inherit" });

console.log("▸ Packaging bundle...");
const { bundlePath, warnings } = await buildBundle({ templateDir });
for (const w of warnings) console.warn("  Warning:", w);

console.log(`▸ Installing to ${campshellHome}/templates/...`);
const result = await installBundle(bundlePath, campshellHome, { source: "local" });

console.log(`\n✓ apify-meta installed (${result.name} v${result.version})`);
