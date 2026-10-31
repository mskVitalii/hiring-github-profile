export type CategoryId =
  | 'languages'
  | 'frontend'
  | 'backend'
  | 'mobile'
  | 'databases'
  | 'devops'
  | 'ml'
  | 'testing'
  | 'tools'
  | 'other';

/** Package ecosystems whose manifests we can parse */
export type Ecosystem =
  | 'npm'
  | 'pypi'
  | 'go'
  | 'cargo'
  | 'gem'
  | 'composer'
  | 'pub'
  | 'maven'
  | 'nuget'
  | 'hex';

export interface TechDef {
  name: string;
  category: CategoryId;
  /**
   * Ecosystem languages. A framework is attributed to the first of these used
   * in the repo; topic/description matches are dropped when none is present.
   * Undefined = language-agnostic (Docker, PostgreSQL, AWS…).
   */
  langs?: readonly string[];
  /** GitHub linguist language names that map onto this tech */
  linguist?: string[];
  /** Min byte share for a linguist match to count (default 0.05) */
  minShare?: number;
  /** Exact GitHub topic slugs */
  topics?: string[];
  /** Unambiguous phrases matched as whole words in repo descriptions */
  keywords?: string[];
  /** Dependency names per ecosystem; a trailing '*' means prefix match */
  deps?: Partial<Record<Ecosystem, string[]>>;
  /** Patterns tested against lower-cased repo tree paths */
  files?: RegExp[];
  /** Pattern tested against docker compose file contents */
  compose?: RegExp;
  /** Other techs implied by this one (Express → Node.js) */
  implies?: string[];
  /** shields.io badge: [color, simple-icons slug, logo color] */
  badge?: [string, string, string?];
}

export interface CategoryDef {
  id: CategoryId;
  name: string;
  emoji: string;
}
