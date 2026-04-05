export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export type Mood = "amazing" | "good" | "okay" | "meh" | "rough";
export type Energy = "high" | "medium" | "low";
export type Weather = "sunny" | "cloudy" | "rainy" | "snowy" | "stormy" | "windy";
export type TagColor = "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "gray";
export type PromptCategory =
  | "reflection"
  | "gratitude"
  | "creativity"
  | "growth"
  | "memory"
  | "dream"
  | "fun";

export interface JournalEntry extends BaseEntity {
  title: string;
  content?: string;
  date: string;
  mood?: Mood;
  moodEmoji?: string;
  energy?: Energy;
  tagIds?: string[];
  gratitude?: string[];
  promptUsed?: string;
  weather?: Weather;
  highlight?: string;
  pinned?: boolean;
}

export interface Tag extends BaseEntity {
  name: string;
  emoji?: string;
  color?: TagColor;
}

export interface JournalPrompt extends BaseEntity {
  text: string;
  category?: PromptCategory;
}

export interface ValidationErrorDetail {
  template: string;
  file: string;
  errors: Array<{
    keyword: string;
    instancePath: string;
    message?: string;
    params?: Record<string, unknown>;
  }>;
}
