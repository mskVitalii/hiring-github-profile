import { BACKEND } from './backend';
import { DATABASES } from './data';
import { FRONTEND } from './frontend';
import { IGNORED_LINGUIST, LANGUAGES } from './languages';
import { ML, TESTING, TOOLS } from './misc';
import { DEVOPS, MOBILE } from './platform';
import type { CategoryDef, CategoryId, Ecosystem, TechDef } from './types';

export type { CategoryDef, CategoryId, Ecosystem, TechDef } from './types';

export const CATEGORIES: CategoryDef[] = [
  { id: 'languages', name: 'Languages', emoji: '🧠' },
  { id: 'frontend', name: 'Frontend', emoji: '🎨' },
  { id: 'backend', name: 'Backend', emoji: '⚙️' },
  { id: 'mobile', name: 'Mobile & Desktop', emoji: '📱' },
  { id: 'databases', name: 'Databases', emoji: '🗄️' },
  { id: 'devops', name: 'DevOps & Cloud', emoji: '☁️' },
  { id: 'ml', name: 'ML & AI', emoji: '🤖' },
  { id: 'testing', name: 'Testing', emoji: '🧪' },
  { id: 'tools', name: 'Tools & Infrastructure', emoji: '🧰' },
  { id: 'other', name: 'Other', emoji: '📦' },
];

export const CATALOG: TechDef[] = [
  ...LANGUAGES,
  ...FRONTEND,
  ...BACKEND,
  ...MOBILE,
  ...DATABASES,
  ...DEVOPS,
  ...ML,
  ...TESTING,
  ...TOOLS,
];

const BY_NAME = new Map(CATALOG.map((t) => [t.name.toLowerCase(), t]));
const BY_LINGUIST = new Map<string, TechDef>();
const BY_TOPIC = new Map<string, TechDef[]>();
for (const tech of CATALOG) {
  for (const l of tech.linguist ?? []) BY_LINGUIST.set(l, tech);
  for (const topic of tech.topics ?? []) {
    BY_TOPIC.set(topic, [...(BY_TOPIC.get(topic) ?? []), tech]);
  }
}

export function getCategory(id: CategoryId): CategoryDef {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES.at(-1)!;
}

export function findTech(name: string): TechDef | undefined {
  return BY_NAME.get(name.trim().toLowerCase());
}

/**
 * Resolve a linguist language name. Unknown programming languages pass
 * through as language skills; config/markup glue is dropped.
 */
export function techForLinguist(language: string): TechDef | null {
  const known = BY_LINGUIST.get(language);
  if (known) return known;
  if (IGNORED_LINGUIST.has(language)) return null;
  return { name: language, category: 'languages', linguist: [language] };
}

export function techsForTopic(topic: string): TechDef[] {
  return BY_TOPIC.get(topic.toLowerCase()) ?? [];
}

function patternToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .toLowerCase()
    .replace(/[.+?^${}()|[\]\\/]/g, '\\$&')
    .replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`);
}

type DepMatcher = { tech: TechDef; re: RegExp };
const DEP_MATCHERS = new Map<Ecosystem, DepMatcher[]>();
for (const tech of CATALOG) {
  for (const [eco, patterns] of Object.entries(tech.deps ?? {})) {
    const list = DEP_MATCHERS.get(eco as Ecosystem) ?? [];
    for (const p of patterns) list.push({ tech, re: patternToRegExp(p) });
    DEP_MATCHERS.set(eco as Ecosystem, list);
  }
}

/** Techs declared by a set of dependency names from one ecosystem */
export function techsForDeps(eco: Ecosystem, deps: string[]): TechDef[] {
  const matchers = DEP_MATCHERS.get(eco) ?? [];
  const found = new Set<TechDef>();
  for (const dep of deps) {
    const d = dep.toLowerCase();
    for (const m of matchers) if (m.re.test(d)) found.add(m.tech);
  }
  return [...found];
}

const KEYWORD_MATCHERS: DepMatcher[] = CATALOG.flatMap((tech) =>
  (tech.keywords ?? []).map((kw) => ({
    tech,
    // Whole-word match: "go" must not fire inside "government" or "tango"
    re: new RegExp(
      `(^|[^a-z0-9])${kw.replace(/[.+?^${}()|[\]\\]/g, '\\$&')}($|[^a-z0-9])`,
      'i',
    ),
  })),
);

export function techsForDescription(text: string): TechDef[] {
  if (!text) return [];
  return KEYWORD_MATCHERS.filter((m) => m.re.test(text)).map((m) => m.tech);
}

/** Ecosystem → the languages a manifest from it implies, preferred first */
export const ECOSYSTEM_LANGUAGES: Record<Ecosystem, string[]> = {
  npm: ['TypeScript', 'JavaScript'],
  pypi: ['Python'],
  go: ['Go'],
  cargo: ['Rust'],
  gem: ['Ruby'],
  composer: ['PHP'],
  pub: ['Dart'],
  maven: ['Kotlin', 'Java', 'Scala'],
  nuget: ['C#', 'F#'],
  hex: ['Elixir'],
};

const SHORT_LANGUAGE: Record<string, string> = {
  TypeScript: 'TS',
  JavaScript: 'JS',
};

export function shortLanguage(name: string): string {
  return SHORT_LANGUAGE[name] ?? name;
}
