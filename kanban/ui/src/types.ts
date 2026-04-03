export type Priority = "low" | "medium" | "high" | "urgent";

export interface Card {
  id: string;
  title: string;
  column: string;
  createdAt: string;
  description?: string;
  labels?: string[];
  priority?: Priority;
  dueDate?: string;
  assignee?: string;
  order?: number;
  updatedAt?: string;
}

export interface Column {
  id: string;
  name: string;
  order: number;
  color?: string;
}

export interface KanbanData {
  columns: Column[];
  cards: Card[];
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
  entity?: string;
  timestamp?: string;
  rejectedData?: unknown;
  /** Monotonic sequence number for WS-received errors (not present on REST-loaded errors) */
  _seq?: number;
}
