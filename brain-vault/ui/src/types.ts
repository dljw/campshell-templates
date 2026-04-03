export type NoteType = "daily" | "meeting" | "project" | "book" | "article" | "research" | "reference" | "general";

export type NoteStatus = "draft" | "in-progress" | "review" | "published" | "archived";

export type TagColor = "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "gray";

export interface ActionItem {
  task: string;
  owner?: string;
  done?: boolean;
}

export interface Note {
  id: string;
  createdAt: string;
  updatedAt?: string;
  title: string;
  content?: string;
  type?: NoteType;
  status?: NoteStatus;
  tagIds?: string[];
  linkedNoteIds?: string[];
  source?: string;
  author?: string;
  date?: string;
  rating?: number;
  summary?: string;
  participants?: string[];
  actionItems?: ActionItem[];
  pinned?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color?: TagColor;
}

export interface TagsCollection {
  tags: Tag[];
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
  _seq?: number;
}
