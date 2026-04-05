export interface QueryOptions {
  dataDir: string;
  stage?: string;
  type?: string;
  contactId?: string;
  dealId?: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Deal {
  id: string;
  title: string;
  contactId?: string;
  value?: number;
  stage: "lead" | "proposal" | "won" | "lost";
  closeDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Activity {
  id: string;
  title: string;
  type?: "call" | "email" | "meeting" | "note";
  contactId?: string;
  dealId?: string;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PipelineSummary {
  stage: string;
  count: number;
  totalValue: number;
}

export interface SearchResult {
  entity: "contacts" | "deals" | "activities";
  id: string;
  title: string;
  matchedIn: string[];
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
