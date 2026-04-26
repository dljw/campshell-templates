// Pickers + helpers for converting raw Apify items into the curated schema.
// Per-template copy; shape diverges between platforms.

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

const RAW_DROP = new Set(["videoMeta_subtitleLinks_html", "rawHtml"]);
export function stripRaw<T extends Raw>(item: T): Raw {
  const out: Raw = {};
  for (const [k, v] of Object.entries(item)) {
    if (!RAW_DROP.has(k)) out[k] = v;
  }
  return out;
}

export interface TtSlideshowImage {
  url: string;
  width: number;
  height: number;
}

export interface TtMusic {
  id: string;
  name: string;
  author: string;
  original: boolean;
  album: string;
  playUrl: string;
  coverThumb: string;
}

export interface TtVideoMeta {
  duration: number;
  height: number;
  width: number;
  definition: string;
  format: string;
  coverUrl: string;
  originalCoverUrl: string;
  downloadAddr: string;
  playAddr: string;
}

export interface TtVideo {
  id: string;
  text: string;
  playCount: number;
  diggCount: number;
  commentCount: number;
  shareCount: number;
  collectCount: number;
  createTime: string;
  webVideoUrl: string;
  videoMeta: TtVideoMeta;
  coverUrl: string;
  videoDownloadUrl: string;
  videoPlayUrl: string;
  music: TtMusic;
  musicTitle: string;
  hashtags: string[];
  mentions: string[];
  effectStickers: { id: string; name: string }[];
  slideshowImages: TtSlideshowImage[];
  isSlideshow: boolean;
  isAd: boolean;
  locationCreated: string;
  authorUsername: string;
  authorNickname: string;
  authorAvatar: string;
  authorVerified: boolean;
  // Drawer-compatibility fields:
  caption: string;
  mediaType: string;
  displayUrl: string;
  videoUrl: string;
  url: string;
  timestamp: string;
  likesCount: number;
  commentsCount: number;
  videoViewCount: number;
  shortcode: string;
  childPosts: { id: string; type: string; displayUrl: string; videoUrl: string }[];
  mediaCache?: Record<string, string | null>;
  _raw: Raw;
}

export interface TtProfile {
  username: string;
  nickname: string;
  followerCount: number;
  followingCount: number;
  videoCount: number;
  heartCount: number;
  bio: string;
  verified: boolean;
  avatarUrl: string;
  avatarLargerUrl: string;
  region: string;
  privateAccount: boolean;
  bioLink: string;
  signatureLanguage: string;
  commerceUserInfo: Raw | null;
  roomId: string;
  mediaCache?: Record<string, string | null>;
  _raw: Raw;
}

function pickTtMusic(m: Raw): TtMusic {
  return {
    id: asString(m?.musicId ?? m?.id),
    name: asString(m?.musicName ?? m?.name),
    author: asString(m?.musicAuthor ?? m?.author),
    original: Boolean(m?.musicOriginal ?? m?.original),
    album: asString(m?.musicAlbum ?? m?.album),
    playUrl: asString(m?.playUrl),
    coverThumb: asString(m?.coverThumb),
  };
}

function pickTtVideoMeta(vm: Raw): TtVideoMeta {
  return {
    duration: asNumber(vm?.duration),
    height: asNumber(vm?.height),
    width: asNumber(vm?.width),
    definition: asString(vm?.definition),
    format: asString(vm?.format),
    coverUrl: asString(vm?.coverUrl),
    originalCoverUrl: asString(vm?.originalCoverUrl),
    downloadAddr: asString(vm?.downloadAddr),
    playAddr: asString(vm?.playAddr),
  };
}

export function pickTtVideo(item: Raw): TtVideo {
  const author = (item.authorMeta ?? item.author ?? {}) as Raw;
  const musicMeta = (item.musicMeta ?? {}) as Raw;
  const videoMeta = pickTtVideoMeta((item.videoMeta ?? {}) as Raw);
  const text = asString(item.text);
  const rawHashtags = asArray<Raw | string>(item.hashtags);
  const hashtags = rawHashtags.length
    ? rawHashtags
        .map((h) =>
          typeof h === "string" ? h : asString((h as Raw)?.name ?? (h as Raw)?.title),
        )
        .filter(Boolean)
    : extractHashtags(text);
  const slideshow = asArray<Raw>(item.slideshowImages).map((s) => ({
    url: asString(s?.imageUrl ?? s?.url),
    width: asNumber(s?.width),
    height: asNumber(s?.height),
  }));
  const isSlideshow = Boolean(item.isSlideshow ?? slideshow.length > 0);
  const coverUrl = videoMeta.coverUrl || asString(asArray<string>(item.covers)?.[0]);
  const createTime =
    typeof item.createTimeISO === "string"
      ? item.createTimeISO
      : new Date(asNumber(item.createTime) * 1000).toISOString();

  // Build childPosts so the drawer's carousel viewer renders slideshow images.
  const childPosts = isSlideshow
    ? slideshow.map((s, i) => ({
        id: `slide-${i}`,
        type: "Image",
        displayUrl: s.url,
        videoUrl: "",
      }))
    : [];

  return {
    id: asString(item.id),
    text,
    playCount: asNumber(item.playCount),
    diggCount: asNumber(item.diggCount),
    commentCount: asNumber(item.commentCount),
    shareCount: asNumber(item.shareCount),
    collectCount: asNumber(item.collectCount),
    createTime,
    webVideoUrl: asString(item.webVideoUrl),
    videoMeta,
    coverUrl,
    videoDownloadUrl: asString(videoMeta.downloadAddr),
    videoPlayUrl: asString(videoMeta.playAddr),
    music: pickTtMusic(musicMeta),
    musicTitle: asString(musicMeta?.musicName ?? musicMeta?.title),
    hashtags,
    mentions: extractMentions(text),
    effectStickers: asArray<Raw>(item.effectStickers).map((e) => ({
      id: asString(e?.id),
      name: asString(e?.name),
    })),
    slideshowImages: slideshow,
    isSlideshow,
    isAd: Boolean(item.isAd),
    locationCreated: asString(item.locationCreated),
    authorUsername: asString(author.name ?? author.uniqueId),
    authorNickname: asString(author.nickName ?? author.nickname),
    authorAvatar: asString(author.avatar ?? author.avatarUrl),
    authorVerified: Boolean(author.verified),
    // Drawer-compat aliases:
    caption: text,
    mediaType: isSlideshow ? "Slideshow" : "Video",
    displayUrl: coverUrl,
    videoUrl: asString(videoMeta.playAddr),
    url: asString(item.webVideoUrl),
    timestamp: createTime,
    likesCount: asNumber(item.diggCount),
    commentsCount: asNumber(item.commentCount),
    videoViewCount: asNumber(item.playCount),
    shortcode: asString(item.id),
    childPosts,
    _raw: stripRaw(item),
  };
}

export function pickTtProfile(item: Raw): TtProfile {
  const author = (item.authorMeta ?? item.author ?? {}) as Raw;
  return {
    username: asString(author.name ?? author.uniqueId),
    nickname: asString(author.nickName ?? author.nickname),
    followerCount: asNumber(author.fans ?? author.followerCount),
    followingCount: asNumber(author.following ?? author.followingCount),
    videoCount: asNumber(author.video ?? author.videoCount),
    heartCount: asNumber(author.heart ?? author.heartCount),
    bio: asString(author.signature ?? author.bio),
    verified: Boolean(author.verified),
    avatarUrl: asString(author.avatar ?? author.avatarUrl),
    avatarLargerUrl: asString(author.avatarLarger),
    region: asString(author.region),
    privateAccount: Boolean(author.privateAccount),
    bioLink: asString(author.bioLink?.link),
    signatureLanguage: asString(author.signatureLanguage),
    commerceUserInfo: (author.commerceUserInfo as Raw) ?? null,
    roomId: asString(author.roomId),
    _raw: stripRaw(item),
  };
}
