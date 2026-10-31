import type { CategoryId } from './catalog';

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  html_url: string;
}

export interface GitHubRepo {
  name: string;
  html_url: string;
  homepage: string | null;
  description: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  updated_at: string;
  pushed_at?: string;
  fork: boolean;
  archived: boolean;
  size: number;
}

export interface RepoLanguages {
  [language: string]: number;
}

/** Where a detection came from, strongest first */
export type TechSource =
  | 'manifest'
  | 'language'
  | 'files'
  | 'compose'
  | 'topic'
  | 'description'
  | 'implied';

export interface RepoTech {
  name: string;
  category: CategoryId;
  sources: TechSource[];
  /** Language this framework was used with in this repo (React → TypeScript) */
  language?: string;
  /** Code bytes, for languages detected from the linguist breakdown */
  bytes?: number;
}

export interface RepoInfo {
  name: string;
  url: string;
  description: string | null;
  homepage: string | null;
  topics: string[];
  stars: number;
  /** Last push, falls back to updated_at */
  updatedAt: string;
  archived: boolean;
  primaryLanguage: string | null;
  /** Whether languages / tree / manifests were fetched for this repo */
  deep: boolean;
  techs: RepoTech[];
}

export interface Skill {
  name: string;
  category: CategoryId;
  /** Repo names, in RepoInfo order */
  repos: string[];
  sources: TechSource[];
  /** Language → number of repos where this framework was used with it */
  languages: Record<string, number>;
  /** Code bytes across repos (languages only, deep scan only) */
  bytes: number;
  lastUsed: string;
}

export interface SkillCategory {
  id: CategoryId;
  name: string;
  skills: Skill[];
}

export interface ScanResult {
  user: GitHubUser;
  repos: RepoInfo[];
  categories: SkillCategory[];
  totalRepos: number;
  /** Repos with language breakdown / tree / manifests analysed */
  deepScannedRepos: number;
  mode: 'basic' | 'deep';
  warnings: string[];
}

export interface ApiErrorResponse {
  error: string;
}
