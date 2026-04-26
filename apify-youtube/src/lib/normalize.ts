// Pickers + helpers for converting raw Apify items into the curated schema.
type Raw = Record<string, any>;

export function asString(v: unknown, fallback = ""): string {
  return v == null ? fallback : String(v);
}

export function asNumber(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function asArray<T = unknown>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export function extractHashtags(text: string): string[] {
  if (!text) return [];
  return Array.from(text.matchAll(/#([\p{L}0-9_]+)/gu)).map((m) => m[1]);
}

const RAW_DROP_BASE = new Set(["rawHtml"]);
export function stripRaw<T extends Raw>(item: T, drop: Set<string> = RAW_DROP_BASE): Raw {
  const out: Raw = {};
  for (const [k, v] of Object.entries(item)) {
    if (!drop.has(k)) out[k] = v;
  }
  return out;
}

export interface YtChannel {
  id: string;
  channelId: string;
  channelName: string;
  subscriberCount: number;
  videosCount: number;
  viewCount: number;
  description: string;
  channelUrl: string;
  channelHandle: string;
  channelAvatarUrl: string;
  channelBannerUrl: string;
  channelJoinedDate: string;
  channelLocation: string;
  channelLinks: { name: string; url: string }[];
  isVerified: boolean;
  mediaCache?: Record<string, string | null>;
  _raw: Raw;
}

export interface YtVideo {
  id: string;
  videoId: string;
  title: string;
  viewCount: number;
  likesCount: number;
  commentsCount: number;
  durationSeconds: number;
  publishedAt: string;
  url: string;
  thumbnailUrl: string;
  description: string;
  channelId: string;
  channelName: string;
  channelUrl: string;
  channelAvatarUrl: string;
  category: string;
  tags: string[];
  hashtags: string[];
  isShorts: boolean;
  isLive: boolean;
  commentsTurnedOff: boolean;
  subtitles: { language: string; url: string }[];
  chapters: { title: string; startTimeSec: number }[];
  // Drawer-compat aliases:
  caption: string;
  shortcode: string;
  mediaType: string;
  productType: string;
  displayUrl: string;
  videoUrl: string;
  videoViewCount: number;
  commentCount: number;
  diggCount: number;
  timestamp: string;
  videoDurationSeconds: number;
  childPosts: { id: string; type: string; displayUrl: string; videoUrl: string }[];
  mediaCache?: Record<string, string | null>;
  _raw: Raw;
}

export interface YtSearchResult extends YtVideo {
  kind: string;
}

function ytIsShorts(item: Raw, url: string): boolean {
  if (item.isShorts != null) return Boolean(item.isShorts);
  if (item.type === "shorts") return true;
  return /\/shorts\//.test(url);
}

const VIDEO_RAW_DROP = new Set(["rawHtml", "transcript"]);

export function pickYtChannel(item: Raw): YtChannel {
  const links = asArray<Raw>(item.channelLinks).map((l) => ({
    name: asString(l?.name ?? l?.label),
    url: asString(l?.url),
  }));
  const channelId = asString(item.channelId ?? item.channelUrl);
  return {
    id: channelId,
    channelId,
    channelName: asString(item.channelName ?? item.channelTitle),
    subscriberCount: asNumber(item.numberOfSubscribers ?? item.subscriberCount),
    videosCount: asNumber(item.channelTotalVideos ?? item.videosCount),
    viewCount: asNumber(item.channelTotalViews ?? item.viewCount),
    description: asString(item.channelDescription ?? item.description),
    channelUrl: asString(item.channelUrl),
    channelHandle: asString(item.channelHandle ?? item.channelUsername),
    channelAvatarUrl: asString(item.channelAvatarUrl ?? item.channelLogoUrl),
    channelBannerUrl: asString(item.channelBannerUrl),
    channelJoinedDate: asString(item.channelJoinedDate),
    channelLocation: asString(item.channelLocation),
    channelLinks: links,
    isVerified: Boolean(item.isChannelVerified ?? item.verified),
    _raw: stripRaw(item),
  };
}

export function pickYtVideo(item: Raw): YtVideo {
  const url = asString(item.url);
  const description = asString(item.text ?? item.description);
  const tags = asArray<string>(item.tags);
  const isShorts = ytIsShorts(item, url);
  const subtitles = asArray<Raw>(item.subtitles).map((s) => ({
    language: asString(s?.language ?? s?.languageCode),
    url: asString(s?.url),
  }));
  const chapters = asArray<Raw>(item.chapters).map((c) => ({
    title: asString(c?.title),
    startTimeSec: asNumber(c?.startTimeSec ?? c?.startTime),
  }));
  const thumbnailUrl = asString(item.thumbnailUrl);
  const videoId = asString(item.id);
  const likesCount = asNumber(item.likes ?? item.likesCount);
  const commentsCount = asNumber(item.commentsCount);
  const viewCount = asNumber(item.viewCount);
  const durationSeconds = asNumber(item.duration);
  const publishedAt = asString(item.date ?? item.publishedAt);

  return {
    id: videoId,
    videoId,
    title: asString(item.title),
    viewCount,
    likesCount,
    commentsCount,
    durationSeconds,
    publishedAt,
    url,
    thumbnailUrl,
    description,
    channelId: asString(item.channelId),
    channelName: asString(item.channelName ?? item.channelTitle),
    channelUrl: asString(item.channelUrl),
    channelAvatarUrl: asString(item.channelAvatarUrl ?? item.channelLogoUrl),
    category: asString(item.category),
    tags,
    hashtags: extractHashtags(description),
    isShorts,
    isLive: Boolean(item.isLive),
    commentsTurnedOff: Boolean(item.commentsTurnedOff),
    subtitles,
    chapters,
    // Drawer-compat aliases:
    caption: asString(item.title) + (description ? `\n\n${description}` : ""),
    shortcode: videoId,
    mediaType: isShorts ? "Shorts" : "Video",
    productType: isShorts ? "shorts" : "video",
    displayUrl: thumbnailUrl,
    videoUrl: url,
    videoViewCount: viewCount,
    commentCount: commentsCount,
    diggCount: likesCount,
    timestamp: publishedAt,
    videoDurationSeconds: durationSeconds,
    childPosts: [],
    _raw: stripRaw(item, VIDEO_RAW_DROP),
  };
}

export function pickYtSearchResult(item: Raw): YtSearchResult {
  const base = pickYtVideo(item);
  return {
    ...base,
    kind: asString(item.type ?? "video"),
  };
}
