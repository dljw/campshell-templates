export type Platform = "instagram" | "tiktok" | "linkedin" | "youtube" | "facebook" | "lemon8";
export type PostFormat = "reel" | "carousel" | "story" | "static-image" | "short-form-video" | "long-form-video" | "text-post" | "article" | "duet" | "stitch" | "mini-article" | "tutorial" | "list-post";
export type PostStatus = "idea" | "drafting" | "ready" | "scheduled" | "published" | "archived";
export type ContentTier = "hero" | "hub" | "hygiene";
export type CampaignStatus = "planning" | "active" | "completed" | "paused";
export type IdeaStatus = "captured" | "evaluating" | "approved" | "rejected" | "converted";
export type Priority = "high" | "medium" | "low";
export type PillarColor = "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "gray";

export interface Business {
  id: string;
  createdAt: string;
  updatedAt?: string;
  name: string;
  description?: string;
  industry?: string;
  logoUrl?: string;
  website?: string;
  active?: boolean;
  notes?: string;
}

export interface Post {
  id: string;
  createdAt: string;
  updatedAt?: string;
  title: string;
  businessId: string;
  scheduledAt?: string;
  publishedAt?: string;
  platform: Platform;
  format: PostFormat;
  status: PostStatus;
  pillarId?: string;
  campaignId?: string;
  caption?: string;
  hook?: string;
  cta?: string;
  hashtags?: string[];
  contentTier?: ContentTier;
  assetUrl?: string;
  crosspostOf?: string;
  notes?: string;
}

export interface Pillar {
  id: string;
  createdAt: string;
  updatedAt?: string;
  name: string;
  description?: string;
  color?: PillarColor;
  emoji?: string;
  targetMix?: number;
}

export interface Campaign {
  id: string;
  createdAt: string;
  updatedAt?: string;
  name: string;
  businessId: string;
  description?: string;
  status: CampaignStatus;
  startDate?: string;
  endDate?: string;
  tier?: ContentTier;
  platforms?: string[];
  goal?: string;
  notes?: string;
}

export interface Idea {
  id: string;
  createdAt: string;
  updatedAt?: string;
  title: string;
  businessId?: string;
  description?: string;
  source?: string;
  sourceUrl?: string;
  platform?: Platform | "any";
  format?: PostFormat | "undecided";
  pillarId?: string;
  hook?: string;
  priority?: Priority;
  status: IdeaStatus;
  convertedPostId?: string;
  notes?: string;
}

export interface PlatformAccount {
  id: string;
  createdAt: string;
  updatedAt?: string;
  businessId: string;
  platform: Platform;
  active?: boolean;
  handle?: string;
  profileUrl?: string;
  postsPerWeek?: number;
  bestTimes?: string[];
  primaryFormats?: string[];
  followers?: number;
  notes?: string;
}

export interface Analytics {
  id: string;
  createdAt: string;
  updatedAt?: string;
  postId: string;
  recordedAt: string;
  impressions?: number;
  reach?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  clicks?: number;
  engagementRate?: number;
  videoViews?: number;
  videoCompletionRate?: number;
  followerChange?: number;
  notes?: string;
}

export interface ValidationErrorDetail {
  template: string;
  file: string;
  errors: Array<{
    keyword: string;
    message?: string;
    instancePath: string;
    params?: Record<string, unknown>;
  }>;
}
