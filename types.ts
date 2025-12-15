export type SourceType = 'reddit' | 'newsletter';

export interface BaseContent {
  id: string;
  title: string;
  source_name: string; // e.g., "r/Marketing" or "Morning Brew"
  timestamp: string;
  url: string;
  type: SourceType;
}

export interface RedditArticle extends BaseContent {
  type: 'reddit';
  snippet: string;
  subreddit: string;
  upvotes: number;
  comments: number;
}

export interface NewsletterHighlight extends BaseContent {
  type: 'newsletter';
  content: string;
  key_points: string[];
}

export type ContentItem = RedditArticle | NewsletterHighlight;

export interface SavedItem extends BaseContent {
  saved_at: string;
  // Merged fields for storage simplicity
  snippet?: string;
  key_points?: string[];
  upvotes?: number;
  comments?: number;
}

export type Platform = 'twitter' | 'linkedin' | 'email' | 'blog';

export interface GeneratedContent {
  id: string;
  originalItemId: string;
  platform: Platform;
  content: string;
  createdAt: string;
}
