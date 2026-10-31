import {
  CATALOG,
  CATEGORIES,
  ECOSYSTEM_LANGUAGES,
  findTech,
  techForLinguist,
  techsForDeps,
  techsForDescription,
  techsForTopic,
  type TechDef,
} from './catalog';
import type { ParsedManifest } from './manifests';
import type {
  GitHubRepo,
  RepoInfo,
  RepoLanguages,
  RepoTech,
  Skill,
  SkillCategory,
  TechSource,
} from './types';

/** Share of repo code a language needs to count as a skill */
export const DEFAULT_MIN_LANGUAGE_SHARE = 0.05;

const SOURCE_ORDER: TechSource[] = [
  'manifest',
  'language',
  'files',
  'compose',
  'topic',
  'description',
  'implied',
];

export interface RepoSignals {
  /** Linguist byte breakdown; without it only the primary language is used */
  languages?: RepoLanguages;
  /** Lower-cased repo tree paths */
  paths?: string[];
  manifests?: ParsedManifest[];
  composeFiles?: string[];
}

const FILE_TECHS = CATALOG.filter((t) => t.files?.length);
const COMPOSE_TECHS = CATALOG.filter((t) => t.compose);
const DOCKER = findTech('Docker')!;

/**
 * Pick the language a framework was used with: an ecosystem-preferred one the
 * repo actually uses, then any repo language the framework supports, then the
 * ecosystem default. Returns undefined when nothing fits.
 */
function pickLanguage(
  tech: TechDef,
  repoLanguages: string[],
  preferred: readonly string[] = [],
): string | undefined {
  if (!tech.langs) return undefined;
  const supported = (l: string) => tech.langs!.includes(l);
  return (
    preferred.find((l) => supported(l) && repoLanguages.includes(l)) ??
    repoLanguages.find(supported) ??
    preferred.find(supported)
  );
}

function npmLanguages(manifest: ParsedManifest): string[] {
  return manifest.typescript
    ? ['TypeScript', 'JavaScript']
    : ['JavaScript', 'TypeScript'];
}

/** Detect the techs used by a single repo from whatever signals we have */
export function detectRepoTechs(
  repo: GitHubRepo,
  signals: RepoSignals = {},
): RepoTech[] {
  const found = new Map<string, RepoTech & { def: TechDef }>();
  const repoLanguages: string[] = [];

  const add = (
    def: TechDef,
    source: TechSource,
    language?: string,
    bytes?: number,
  ) => {
    const entry = found.get(def.name) ?? {
      def,
      name: def.name,
      category: def.category,
      sources: [],
    };
    if (!entry.sources.includes(source)) entry.sources.push(source);
    if (language && !entry.language) entry.language = language;
    if (bytes) entry.bytes = (entry.bytes ?? 0) + bytes;
    found.set(def.name, entry);
  };

  // 1. Linguist languages. Tiny shares are vendored files or config glue
  //    (a 46-byte postcss.config.js must not make someone a JS developer).
  const breakdown =
    signals.languages && Object.keys(signals.languages).length > 0
      ? signals.languages
      : repo.language
        ? { [repo.language]: 0 }
        : {};
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  for (const [linguist, bytes] of sorted) {
    const def = techForLinguist(linguist);
    if (!def) continue;
    const share = total > 0 ? bytes / total : 1;
    const minShare = def.minShare ?? DEFAULT_MIN_LANGUAGE_SHARE;
    if (linguist !== repo.language && share < minShare) continue;
    if (def.category === 'languages') {
      repoLanguages.push(def.name);
      add(def, 'language', undefined, bytes);
    } else {
      add(def, 'language', pickLanguage(def, repoLanguages));
    }
  }
  // Linguist frameworks (Vue, Astro) seen before their host language
  for (const tech of found.values()) {
    if (!tech.language && tech.def.langs && tech.category !== 'languages') {
      tech.language = pickLanguage(tech.def, repoLanguages);
    }
  }

  // 2. Manifests — the strongest framework signal; the ecosystem tells us
  //    which language the dependency belongs to.
  for (const manifest of signals.manifests ?? []) {
    const preferred =
      manifest.ecosystem === 'npm'
        ? npmLanguages(manifest)
        : ECOSYSTEM_LANGUAGES[manifest.ecosystem];
    for (const def of techsForDeps(manifest.ecosystem, manifest.deps)) {
      add(def, 'manifest', pickLanguage(def, repoLanguages, preferred));
    }
  }

  // 3. File-tree conventions (infra, testing, framework configs)
  const paths = signals.paths ?? [];
  if (paths.length > 0) {
    for (const def of FILE_TECHS) {
      if (paths.some((p) => def.files!.some((re) => re.test(p)))) {
        add(def, 'files', pickLanguage(def, repoLanguages, def.langs));
      }
    }
  }

  // 4. docker compose service images
  for (const content of signals.composeFiles ?? []) {
    const text = content.toLowerCase();
    add(DOCKER, 'compose');
    for (const def of COMPOSE_TECHS) {
      if (def.compose!.test(text)) add(def, 'compose');
    }
  }

  // 5. Topics and description are weak signals: an ecosystem-bound framework
  //    only counts when its language is actually present in the repo.
  const knownLanguages = () => [
    ...repoLanguages,
    ...[...found.values()].map((t) => t.language).filter(Boolean) as string[],
  ];
  const addWeak = (def: TechDef, source: TechSource) => {
    if (def.category === 'languages') return;
    if (!def.langs) return add(def, source);
    const language = pickLanguage(def, knownLanguages());
    if (language) add(def, source, language);
  };
  for (const topic of repo.topics ?? []) {
    for (const def of techsForTopic(topic)) addWeak(def, 'topic');
  }
  for (const def of techsForDescription(repo.description ?? '')) {
    addWeak(def, 'description');
  }

  // 6. Implications (Next.js → React, Express → Node.js)
  const queue = [...found.values()];
  while (queue.length > 0) {
    const parent = queue.shift()!;
    for (const name of parent.def.implies ?? []) {
      const def = findTech(name);
      if (!def || found.has(def.name)) continue;
      add(def, 'implied', pickLanguage(def, [parent.language ?? ''].concat(repoLanguages)));
      queue.push(found.get(def.name)!);
    }
  }

  return [...found.values()].map(({ def: _def, ...tech }) => ({
    ...tech,
    sources: [...tech.sources].sort(
      (a, b) => SOURCE_ORDER.indexOf(a) - SOURCE_ORDER.indexOf(b),
    ),
  }));
}

export function buildRepoInfo(
  repo: GitHubRepo,
  signals: RepoSignals,
  deep: boolean,
): RepoInfo {
  return {
    name: repo.name,
    url: repo.html_url,
    description: repo.description,
    homepage: repo.homepage?.trim() || null,
    topics: repo.topics ?? [],
    stars: repo.stargazers_count,
    updatedAt: repo.pushed_at ?? repo.updated_at,
    archived: repo.archived,
    primaryLanguage: repo.language,
    deep,
    techs: detectRepoTechs(repo, signals),
  };
}

/** Merge per-repo detections into categorized skills */
export function aggregateSkills(repos: RepoInfo[]): SkillCategory[] {
  const skills = new Map<string, Skill>();

  for (const repo of repos) {
    for (const tech of repo.techs) {
      const skill = skills.get(tech.name) ?? {
        name: tech.name,
        category: tech.category,
        repos: [],
        sources: [],
        languages: {},
        bytes: 0,
        lastUsed: '',
      };
      skill.repos.push(repo.name);
      for (const s of tech.sources) {
        if (!skill.sources.includes(s)) skill.sources.push(s);
      }
      if (tech.language) {
        skill.languages[tech.language] =
          (skill.languages[tech.language] ?? 0) + 1;
      }
      skill.bytes += tech.bytes ?? 0;
      if (repo.updatedAt > skill.lastUsed) skill.lastUsed = repo.updatedAt;
      skills.set(tech.name, skill);
    }
  }

  return CATEGORIES.map((category) => ({
    id: category.id,
    name: category.name,
    skills: [...skills.values()]
      .filter((s) => s.category === category.id)
      .sort(
        (a, b) =>
          b.repos.length - a.repos.length ||
          b.bytes - a.bytes ||
          b.lastUsed.localeCompare(a.lastUsed),
      ),
  })).filter((c) => c.skills.length > 0);
}

/**
 * Order repos for deep analysis: active before archived, then popular, then
 * recently pushed — so the request budget goes to repos that matter most.
 */
export function rankRepos(repos: GitHubRepo[]): GitHubRepo[] {
  return [...repos].sort(
    (a, b) =>
      Number(a.archived) - Number(b.archived) ||
      b.stargazers_count - a.stargazers_count ||
      (b.pushed_at ?? b.updated_at).localeCompare(a.pushed_at ?? a.updated_at),
  );
}
