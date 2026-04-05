export type DealStage = "lead" | "proposal" | "won" | "lost";
export type ActivityType = "call" | "email" | "meeting" | "note";

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
  stage: DealStage;
  closeDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Activity {
  id: string;
  title: string;
  type?: ActivityType;
  contactId?: string;
  dealId?: string;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
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
