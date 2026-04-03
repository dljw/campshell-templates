export type KeywordIntent = "informational" | "navigational" | "commercial" | "transactional";
export type KeywordStatus = "tracking" | "paused" | "achieved";

export type PageStatus = "planned" | "drafting" | "review" | "published" | "needs-refresh";
export type ContentType = "blog" | "landing" | "guide" | "tool" | "other";

export type LinkType = "dofollow" | "nofollow" | "ugc" | "sponsored";
export type BacklinkStatus = "active" | "lost" | "disavowed";

export type IssueType = "speed" | "mobile" | "indexing" | "structure" | "security" | "other";
export type IssuePriority = "critical" | "high" | "medium" | "low";
export type IssueStatus = "open" | "in-progress" | "resolved";

export interface Keyword {
  id: string;
  createdAt: string;
  updatedAt?: string;
  term: string;
  pageId?: string;
  position?: number;
  previousPosition?: number;
  searchVolume?: number;
  difficulty?: number;
  intent?: KeywordIntent;
  status?: KeywordStatus;
  notes?: string;
}

export interface Page {
  id: string;
  createdAt: string;
  updatedAt?: string;
  title: string;
  pageUrl: string;
  status?: PageStatus;
  contentType?: ContentType;
  wordCount?: number;
  publishDate?: string;
  lastUpdated?: string;
  organicTraffic?: number;
  avgPosition?: number;
  assignedTo?: string;
  notes?: string;
}

export interface Backlink {
  id: string;
  createdAt: string;
  updatedAt?: string;
  sourceDomain: string;
  sourceUrl: string;
  targetPageId?: string;
  anchorText?: string;
  linkType?: LinkType;
  domainAuthority?: number;
  dateDiscovered?: string;
  status?: BacklinkStatus;
}

export interface Competitor {
  id: string;
  createdAt: string;
  updatedAt?: string;
  domain: string;
  estimatedTraffic?: number;
  domainAuthority?: number;
  topKeywords?: string[];
  backlinkCount?: number;
  notes?: string;
}

export interface CompetitorsCollection {
  competitors: Competitor[];
}

export interface Issue {
  id: string;
  createdAt: string;
  updatedAt?: string;
  title: string;
  issueType?: IssueType;
  affectedPage?: string;
  description?: string;
  priority?: IssuePriority;
  status?: IssueStatus;
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
