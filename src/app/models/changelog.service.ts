export interface ChangelogItem {
  subject: string;
  author: {
    date: string;
  }
}

export type Changelog = ChangelogItem[];
