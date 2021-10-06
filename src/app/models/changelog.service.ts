export interface ChangelogItem {
  subject: string;
  commiter: {
    date: string;
  }
}

export type Changelog = ChangelogItem[];
