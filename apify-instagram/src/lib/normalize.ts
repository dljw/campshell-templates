// Pickers + helpers for converting raw Apify items into the curated schema.
// Per-template copy; not shared across templates because each platform's
// shape diverges enough that a shared helper hurts more than it helps.

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

export function extractMentions(text: string): string[] {
  if (!text) return [];
  return Array.from(text.matchAll(/@([\w.]+)/g)).map((m) => m[1]);
}

// Drop known-huge subtrees from `_raw` before persistence. Most fields pass through.
const RAW_DROP = new Set(["latestComments_html", "rawHtml", "thumbnailBase64"]);
export function stripRaw<T extends Raw>(item: T): Raw {
  const out: Raw = {};
  for (const [k, v] of Object.entries(item)) {
    if (!RAW_DROP.has(k)) out[k] = v;
  }
  return out;
}

interface IgChildPost {
  id: string;
  type: string;
  displayUrl: string;
  videoUrl: string;
  dimensions: { width: number; height: number } | null;
}

export interface IgPost {
  id: string;
  shortcode: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  videoViewCount: number;
  videoPlayCount: number;
  timestamp: string;
  mediaType: string;
  productType: string;
  isSponsored: boolean;
  displayUrl: string;
  videoUrl: string;
  mediaUrl: string;
  dimensions: { width: number; height: number } | null;
  videoDurationSeconds: number;
  hashtags: string[];
  mentions: string[];
  taggedUsers: string[];
  location: { id: string; name: string } | null;
  musicInfo: Raw | null;
  childPosts: IgChildPost[];
  ownerUsername: string;
  ownerFullName: string;
  ownerProfilePicUrl: string;
  url: string;
  firstComment: string;
  latestComments: Raw[];
  mediaCache?: Record<string, string | null>;
  _raw: Raw;
}

export interface IgProfile {
  username: string;
  fullName: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  biography: string;
  isVerified: boolean;
  profilePicUrl: string;
  externalUrl: string;
  businessCategory: string;
  isBusinessAccount: boolean;
  relatedProfiles: { username: string; profilePicUrl: string }[];
  latestPosts: {
    shortCode: string;
    displayUrl: string;
    type: string;
    likesCount: number;
    commentsCount: number;
  }[];
  mediaCache?: Record<string, string | null>;
  _raw: Raw;
}

function pickIgChild(c: Raw): IgChildPost {
  const dimW = c?.dimensionsWidth ?? c?.dimensions?.width;
  const dimH = c?.dimensionsHeight ?? c?.dimensions?.height;
  return {
    id: asString(c?.id),
    type: asString(c?.type),
    displayUrl: asString(c?.displayUrl),
    videoUrl: asString(c?.videoUrl),
    dimensions:
      dimW != null || dimH != null
        ? { width: asNumber(dimW), height: asNumber(dimH) }
        : null,
  };
}

export function pickIgPost(item: Raw): IgPost {
  const dimW = item.dimensionsWidth ?? item.dimensions?.width;
  const dimH = item.dimensionsHeight ?? item.dimensions?.height;
  const caption = asString(item.caption);
  const rawHashtags = asArray<string>(item.hashtags);
  const rawMentions = asArray<string>(item.mentions);
  const taggedRaw = asArray<Raw>(item.taggedUsers);
  const location =
    item.locationId || item.locationName || item.location
      ? {
          id: asString(item.locationId ?? item.location?.id),
          name: asString(item.locationName ?? item.location?.name),
        }
      : null;

  return {
    id: asString(item.id),
    shortcode: asString(item.shortCode ?? item.shortcode),
    caption,
    likesCount: asNumber(item.likesCount),
    commentsCount: asNumber(item.commentsCount),
    videoViewCount: asNumber(item.videoViewCount),
    videoPlayCount: asNumber(item.videoPlayCount),
    timestamp: asString(item.timestamp),
    mediaType: asString(item.type),
    productType: asString(item.productType),
    isSponsored: Boolean(item.isSponsored),
    displayUrl: asString(item.displayUrl),
    videoUrl: asString(item.videoUrl),
    mediaUrl: asString(item.displayUrl ?? item.videoUrl),
    dimensions:
      dimW != null || dimH != null
        ? { width: asNumber(dimW), height: asNumber(dimH) }
        : null,
    videoDurationSeconds: asNumber(item.videoDuration),
    hashtags: rawHashtags.length ? rawHashtags : extractHashtags(caption),
    mentions: rawMentions.length ? rawMentions : extractMentions(caption),
    taggedUsers: taggedRaw.map((u) => asString(u?.username)).filter(Boolean),
    location,
    musicInfo: (item.musicInfo ?? item.clipsMusicAttribution ?? null) as Raw | null,
    childPosts: asArray<Raw>(item.childPosts).map(pickIgChild),
    ownerUsername: asString(item.ownerUsername),
    ownerFullName: asString(item.ownerFullName),
    ownerProfilePicUrl: asString(item.ownerProfilePicUrl),
    url: asString(item.url),
    firstComment: asString(item.firstComment),
    latestComments: asArray<Raw>(item.latestComments),
    _raw: stripRaw(item),
  };
}

export function pickIgProfile(item: Raw): IgProfile {
  const externalUrl =
    asString(item.externalUrl) ||
    asString(asArray<Raw>(item.externalUrls)?.[0]?.url);

  const relatedProfiles = asArray<Raw>(item.relatedProfiles).map((r) => ({
    username: asString(r?.username),
    profilePicUrl: asString(r?.profilePicUrl),
  }));

  const latestPosts = asArray<Raw>(item.latestPosts)
    .slice(0, 12)
    .map((p) => ({
      shortCode: asString(p?.shortCode ?? p?.shortcode),
      displayUrl: asString(p?.displayUrl),
      type: asString(p?.type),
      likesCount: asNumber(p?.likesCount),
      commentsCount: asNumber(p?.commentsCount),
    }));

  return {
    username: asString(item.username),
    fullName: asString(item.fullName),
    followersCount: asNumber(item.followersCount),
    followingCount: asNumber(item.followsCount ?? item.followingCount),
    postsCount: asNumber(item.postsCount),
    biography: asString(item.biography),
    isVerified: Boolean(item.verified ?? item.isVerified),
    profilePicUrl: asString(item.profilePicUrlHD ?? item.profilePicUrl),
    externalUrl,
    businessCategory: asString(item.businessCategoryName ?? item.businessCategory),
    isBusinessAccount: Boolean(item.isBusinessAccount),
    relatedProfiles,
    latestPosts,
    _raw: stripRaw(item),
  };
}
