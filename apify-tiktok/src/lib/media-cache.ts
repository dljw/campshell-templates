// Best-effort downloader for short-lived Apify media URLs (Instagram CDN expires
// in hours). Writes to {ctx.dataDir}/media/{runId}/<safeId>__<kind>.<ext> and
// mutates each item with `mediaCache: { kind: relativePath | null }` so the UI
// can prefer cached files over live URLs.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export interface UrlSpec {
  kind: string;
  url: string;
  ext: string;
}

interface CacheCtx {
  dataDir: string;
  runId: string;
}

interface CacheOpts<T> {
  items: T[];
  ctx: CacheCtx;
  pickUrls: (item: T) => UrlSpec[];
  concurrency?: number;
}

function pLimit(max: number) {
  let active = 0;
  const queue: (() => void)[] = [];
  const next = () => {
    active--;
    const fn = queue.shift();
    if (fn) fn();
  };
  return <R>(fn: () => Promise<R>): Promise<R> =>
    new Promise<R>((resolve, reject) => {
      const run = () => {
        active++;
        fn().then(resolve, reject).finally(next);
      };
      if (active < max) run();
      else queue.push(run);
    });
}

function safeFilename(s: string): string {
  return String(s ?? "").replace(/[^a-zA-Z0-9_-]/g, "_") || "item";
}

interface CacheableItem {
  id?: string;
  shortcode?: string;
  username?: string;
  mediaCache?: Record<string, string | null>;
}

export async function cacheMediaForItems<T extends CacheableItem>(
  opts: CacheOpts<T>,
): Promise<void> {
  const { items, ctx, pickUrls } = opts;
  if (!items.length) return;

  const dir = path.join(ctx.dataDir, "media", ctx.runId);
  await mkdir(dir, { recursive: true });

  const limit = pLimit(opts.concurrency ?? 4);

  await Promise.all(
    items.map((item, idx) =>
      limit(async () => {
        const cache: Record<string, string | null> = {};
        const baseId = safeFilename(
          item.id ?? item.shortcode ?? item.username ?? `item-${idx}`,
        );
        for (const spec of pickUrls(item)) {
          if (!spec.url) {
            cache[spec.kind] = null;
            continue;
          }
          try {
            const res = await fetch(spec.url);
            if (!res.ok) {
              cache[spec.kind] = null;
              continue;
            }
            const buf = Buffer.from(await res.arrayBuffer());
            const filename = `${baseId}__${spec.kind}.${spec.ext}`;
            await writeFile(path.join(dir, filename), buf);
            cache[spec.kind] = path.posix.join("media", ctx.runId, filename);
          } catch {
            cache[spec.kind] = null;
          }
        }
        item.mediaCache = cache;
      }),
    ),
  );
}
