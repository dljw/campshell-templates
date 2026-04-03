export interface QueryOptions {
  dataDir: string;
  column?: string;
  priority?: string;
}

export interface Card {
  id: string;
  title: string;
  column: string;
  createdAt: string;
  description?: string;
  labels?: string[];
  priority?: "low" | "medium" | "high" | "urgent";
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

export interface ColumnWithCount extends Column {
  cardCount: number;
}

export interface OverdueCard extends Card {
  daysOverdue: number;
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  column: string;
  matchedIn: ("title" | "description")[];
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
