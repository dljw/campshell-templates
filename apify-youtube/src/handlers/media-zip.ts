// Bundles cached media files for one or more items in a saved run into a ZIP.
// Returns a base64 data URL the UI can hand straight to <a download>.
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ServiceContext } from "../lib/apify.js";
import { buildStoredZip, type ZipEntry } from "../lib/zip.js";

interface Input {
  runId: string;
  itemIds?: string[];
}

interface Output {
  filename: string;
  dataUrl: string;
  fileCount: number;
  bytes: number;
}

interface MaybeItem {
  id?: unknown;
  shortcode?: unknown;
  username?: unknown;
  mediaCache?: Record<string, string | null> | null;
}

function looksLikeItem(v: unknown): v is MaybeItem {
  return (
    typeof v === "object" &&
    v !== null &&
    "mediaCache" in v &&
    typeof (v as MaybeItem).mediaCache === "object"
  );
}

function itemId(item: MaybeItem): string {
  return String(item.id ?? item.shortcode ?? item.username ?? "");
}

function safeFilename(s: string): string {
  return String(s).replace(/[^a-zA-Z0-9._-]/g, "_") || "file";
}

function safeRelativePath(rel: string): boolean {
  if (!rel || typeof rel !== "string") return false;
  if (path.isAbsolute(rel)) return false;
  if (rel.includes("..")) return false;
  return rel.startsWith("media/");
}

export default async function mediaZip(
  input: Input,
  context: ServiceContext,
): Promise<Output> {
  const runId = String(input.runId ?? "");
  if (!/^[a-zA-Z0-9_-]+$/.test(runId)) {
    throw new Error("Invalid runId");
  }

  const runPath = path.join(context.dataDir, "runs", `${runId}.json`);
  let record: any;
  try {
    record = JSON.parse(await readFile(runPath, "utf-8"));
  } catch (e) {
    throw new Error(`Run not found: ${runId}`);
  }

  // Walk all top-level arrays in the output, collect items with mediaCache.
  const output = record?.output ?? {};
  const filterIds = input.itemIds?.length ? new Set(input.itemIds) : null;
  const items: MaybeItem[] = [];
  for (const value of Object.values(output)) {
    if (!Array.isArray(value)) continue;
    for (const v of value) {
      if (looksLikeItem(v) && v.mediaCache) {
        if (!filterIds || filterIds.has(itemId(v))) {
          items.push(v);
        }
      }
    }
  }

  const dataDirAbs = path.resolve(context.dataDir);
  const entries: ZipEntry[] = [];
  let totalBytes = 0;

  for (const item of items) {
    const idStr = safeFilename(itemId(item) || "item");
    const cache = item.mediaCache ?? {};
    for (const [kind, relPath] of Object.entries(cache)) {
      if (!relPath || !safeRelativePath(relPath)) continue;
      const abs = path.resolve(dataDirAbs, relPath);
      if (!abs.startsWith(dataDirAbs + path.sep)) continue;
      try {
        const buf = await readFile(abs);
        const ext = path.extname(abs);
        entries.push({
          name: `${idStr}__${safeFilename(kind)}${ext}`,
          data: buf,
        });
        totalBytes += buf.length;
      } catch {
        // skip missing files silently
      }
    }
  }

  if (!entries.length) {
    throw new Error("No cached media found for the selected items");
  }

  const zipBuf = buildStoredZip(entries);
  const dataUrl = `data:application/zip;base64,${zipBuf.toString("base64")}`;
  return {
    filename: `${context.templateName}-${runId}.zip`,
    dataUrl,
    fileCount: entries.length,
    bytes: totalBytes,
  };
}
