export function asString(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  return String(v);
}

export function asNumber(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

export function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export function extractHashtags(text: string): string[] {
  return [...text.matchAll(/#([\wÀ-ɏ]+)/g)].map((m) => m[1]);
}

export function extractMentions(text: string): string[] {
  return [...text.matchAll(/@([\w.]+)/g)].map((m) => m[1]);
}

const POST_RAW_DROP = new Set<string>(["rawHtml", "thumbnailBase64"]);

function stripRaw(
  raw: Record<string, unknown>,
  drop: Set<string>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (!drop.has(k)) out[k] = v;
  }
  return out;
}

// --- NORMALIZED TYPES ---

export interface MetaMediaItem {
  type?: string;
  url?: string;
  thumbnailUrl?: string;
  width?: number | null;
  height?: number | null;
}

export interface MetaPost {
  id: string;
  postId: string;
  // drawer-compat aliases
  caption: string;
  timestamp: string;
  shortcode: string;
  // native fields
  text: string;
  time: string;
  likesCount: number | null;
  commentsCount: number | null;
  sharesCount: number | null;
  viewsCount: number | null;
  url: string;
  displayUrl: string;
  videoUrl: string;
  mediaType: string;
  hashtags: string[];
  mentions: string[];
  isSponsored: boolean;
  reactions: {
    like: number | null;
    love: number | null;
    haha: number | null;
    wow: number | null;
    sad: number | null;
    angry: number | null;
    care: number | null;
  };
  media: MetaMediaItem[];
  link: { url: string; title: string; description: string; image: string } | null;
  pageName: string;
  pageUrl: string;
  childPosts: { id?: string; type?: string; displayUrl?: string; videoUrl?: string }[];
  topComments: unknown[];
  mediaCache?: Record<string, string | null>;
  _raw: Record<string, unknown> | null;
}

export interface MetaPage {
  id: string;
  pageId: string;
  name: string;
  followers: number | null;
  likes: number | null;
  category: string;
  about: string;
  websites: string[];
  profilePictureUrl: string;
  coverPhotoUrl: string;
  pageUrl: string;
  verified: boolean;
  address: string;
  phone: string;
  email: string;
  priceRange: string;
  creationDate: string;
  categories: string[];
  mediaCache?: Record<string, string | null>;
  _raw: Record<string, unknown> | null;
}

// --- PICKERS ---

function normalizeMedia(raw: unknown): MetaMediaItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((m: Record<string, unknown>) => ({
    type: asString(m.type),
    url: asString(m.url),
    thumbnailUrl: asString(m.thumbnailUrl),
    width: asNumber(m.width),
    height: asNumber(m.height),
  }));
}

function normalizeReactions(raw: unknown): MetaPost["reactions"] {
  const r = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  return {
    like: asNumber(r.like ?? r.LIKE),
    love: asNumber(r.love ?? r.LOVE),
    haha: asNumber(r.haha ?? r.HAHA),
    wow: asNumber(r.wow ?? r.WOW),
    sad: asNumber(r.sad ?? r.SAD),
    angry: asNumber(r.angry ?? r.ANGRY),
    care: asNumber(r.care ?? r.CARE),
  };
}

export function pickMetaPage(item: Record<string, unknown>): MetaPage {
  const pageId = asString(item.pageId ?? item.id ?? "");
  const raw = stripRaw(item, new Set());

  return {
    id: pageId,
    pageId,
    name: asString(item.title ?? item.name ?? ""),
    followers: asNumber(item.followers ?? item.followersCount),
    likes: asNumber(item.likes ?? item.likesCount),
    category: asString(item.categories ?? item.category ?? ""),
    about: asString(item.intro ?? item.about ?? ""),
    websites: asArray<string>(item.websites),
    profilePictureUrl: asString(item.profilePictureUrl ?? item.profilePhoto ?? ""),
    coverPhotoUrl: asString(item.coverPhotoUrl ?? item.coverPhoto ?? ""),
    pageUrl: asString(item.pageUrl ?? item.url ?? ""),
    verified: Boolean(item.verified ?? item.isVerified ?? false),
    address: asString(item.address ?? ""),
    phone: asString(item.phone ?? ""),
    email: asString(item.email ?? ""),
    priceRange: asString(item.priceRange ?? ""),
    creationDate: asString(item.creationDate ?? item.createdAt ?? ""),
    categories: asArray<string>(item.categories),
    _raw: raw,
  };
}

export function pickMetaPost(item: Record<string, unknown>): MetaPost {
  const postId = asString(item.postId ?? item.id ?? "");
  const text = asString(item.text ?? item.message ?? "");
  const time = asString(item.time ?? item.publishedAt ?? "");

  const media = normalizeMedia(item.media);
  const firstMedia = media[0];
  const hasVideo = media.some((m) => m.type === "video" || m.type === "Video");
  const displayUrl = asString(
    firstMedia?.thumbnailUrl ?? firstMedia?.url ?? item.previewImage ?? "",
  );
  const videoUrl = asString(
    media.find((m) => m.type === "video" || m.type === "Video")?.url ??
      item.videoUrl ??
      "",
  );

  let mediaType = "Post";
  if (media.length > 1) mediaType = "Multi";
  else if (hasVideo) mediaType = "Video";
  else if (firstMedia) mediaType = "Photo";

  // Build childPosts from all media items when there are multiple (for carousel viewer)
  const childPosts =
    media.length > 1
      ? media.map((m, i) => ({
          id: String(i),
          type: m.type,
          displayUrl: m.thumbnailUrl ?? m.url ?? "",
          videoUrl: m.type === "video" || m.type === "Video" ? m.url : undefined,
        }))
      : [];

  const reactions = normalizeReactions(item.reactions);

  const linkRaw = item.link as Record<string, unknown> | null | undefined;
  const link = linkRaw
    ? {
        url: asString(linkRaw.url),
        title: asString(linkRaw.title),
        description: asString(linkRaw.description),
        image: asString(linkRaw.image ?? linkRaw.thumbnailUrl),
      }
    : null;

  // comments field may be a count or an array
  const commentsRaw = item.comments;
  const commentsCount =
    typeof commentsRaw === "number"
      ? commentsRaw
      : asNumber(item.commentsCount);

  const raw = stripRaw(item, POST_RAW_DROP);

  return {
    id: postId,
    postId,
    caption: text,
    timestamp: time,
    shortcode: postId,
    text,
    time,
    likesCount: asNumber(item.likes ?? item.likesCount),
    commentsCount,
    sharesCount: asNumber(item.shares ?? item.sharesCount),
    viewsCount: asNumber(item.views ?? item.viewsCount ?? item.videoViewCount),
    url: asString(item.url ?? item.postUrl ?? ""),
    displayUrl,
    videoUrl,
    mediaType,
    hashtags: extractHashtags(text),
    mentions: extractMentions(text),
    isSponsored: Boolean(item.isSponsored ?? false),
    reactions,
    media,
    link,
    pageName: asString(item.pageName ?? ""),
    pageUrl: asString(item.pageUrl ?? ""),
    childPosts,
    topComments: asArray(item.topComments),
    _raw: raw,
  };
}
