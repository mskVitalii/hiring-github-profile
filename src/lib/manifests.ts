import type { Ecosystem } from './catalog';

export interface ParsedManifest {
  path: string;
  ecosystem: Ecosystem;
  deps: string[];
  /** package.json declares TypeScript → prefer TS over JS for attribution */
  typescript?: boolean;
}

type Parser = (content: string) => { deps: string[]; typescript?: boolean };

const uniq = (items: string[]) => [
  ...new Set(items.map((s) => s.trim()).filter(Boolean)),
];

const parsePackageJson: Parser = (content) => {
  const json = JSON.parse(content) as Record<string, unknown>;
  const deps = [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ].flatMap((key) => Object.keys((json[key] as object | undefined) ?? {}));
  return { deps: uniq(deps), typescript: deps.includes('typescript') };
};

const parseGoMod: Parser = (content) => {
  const deps: string[] = [];
  let inBlock = false;
  for (const raw of content.split('\n')) {
    // Transitive deps say nothing about what the author chose to use
    if (/\/\/\s*indirect/.test(raw)) continue;
    const line = raw.replace(/\/\/.*$/, '').trim();
    if (/^require\s*\($/.test(line)) inBlock = true;
    else if (inBlock && line === ')') inBlock = false;
    else if (inBlock && line) deps.push(line.split(/\s+/)[0]);
    else {
      const single = line.match(/^require\s+(\S+)/);
      if (single) deps.push(single[1]);
    }
  }
  return { deps: uniq(deps) };
};

/** PEP 508 requirement → bare package name */
const pyName = (req: string) =>
  req
    .trim()
    .replace(/^["']|["']$/g, '')
    .split(/[\s<>=!~;[(@]/)[0]
    .toLowerCase()
    .replace(/_/g, '-');

const parseRequirements: Parser = (content) => ({
  deps: uniq(
    content
      .split('\n')
      .map((l) => l.replace(/#.*$/, '').trim())
      .filter((l) => l && !l.startsWith('-'))
      .map(pyName),
  ),
});

/** Tiny TOML section scanner: enough for dependency tables and arrays */
function tomlSections(content: string): Map<string, string[]> {
  const sections = new Map<string, string[]>();
  let current = '';
  for (const raw of content.split('\n')) {
    const line = raw.replace(/\s#.*$/, '').trim();
    const header = line.match(/^\[\[?([^\]]+)\]\]?$/);
    if (header) {
      current = header[1].trim();
      continue;
    }
    sections.set(current, [...(sections.get(current) ?? []), line]);
  }
  return sections;
}

const tomlKeys = (lines: string[]) =>
  lines
    .map((l) => l.match(/^["']?([A-Za-z0-9_.\-]+)["']?\s*=/)?.[1])
    .filter((v): v is string => Boolean(v));

/** Quoted strings inside every `key = [ ... ]` array, extras brackets included */
function tomlArrayStrings(body: string, key: RegExp): string[] {
  const out: string[] = [];
  for (const match of body.matchAll(key)) {
    let depth = 0;
    let quote = '';
    let current = '';
    for (let i = (match.index ?? 0) + match[0].length - 1; i < body.length; i++) {
      const ch = body[i];
      if (quote) {
        if (ch === quote) {
          out.push(current);
          current = '';
          quote = '';
        } else current += ch;
      } else if (ch === '"' || ch === "'") quote = ch;
      else if (ch === '[') depth++;
      else if (ch === ']' && --depth === 0) break;
    }
  }
  return out;
}

const parsePyproject: Parser = (content) => {
  const deps: string[] = [];
  for (const [name, lines] of tomlSections(content)) {
    const body = lines.join('\n');
    // Poetry tables: [tool.poetry.dependencies], [tool.poetry.group.dev.dependencies]
    if (/(^|\.)(dev-)?dependencies$/.test(name)) deps.push(...tomlKeys(lines));
    // PEP 621 / PEP 735 arrays: dependencies = [ "fastapi>=0.1", ... ]
    if (name === 'project') {
      deps.push(...tomlArrayStrings(body, /(^|\n)\s*dependencies\s*=\s*\[/g));
    }
    if (name === 'project.optional-dependencies' || name === 'dependency-groups') {
      deps.push(...tomlArrayStrings(body, /(^|\n)\s*[\w.-]+\s*=\s*\[/g));
    }
  }
  return { deps: uniq(deps.map(pyName)).filter((d) => d !== 'python') };
};

const parseCargo: Parser = (content) => {
  const deps: string[] = [];
  for (const [name, lines] of tomlSections(content)) {
    if (/(^|\.)(dev-|build-)?dependencies$/.test(name)) {
      deps.push(...tomlKeys(lines));
    }
    const dotted = name.match(/(?:^|\.)(?:dev-|build-)?dependencies\.(.+)$/);
    if (dotted) deps.push(dotted[1]);
  }
  return { deps: uniq(deps) };
};

const parseGemfile: Parser = (content) => ({
  deps: uniq(
    [...content.matchAll(/^\s*gem\s+["']([^"']+)["']/gm)].map((m) => m[1]),
  ),
});

const parseComposer: Parser = (content) => {
  const json = JSON.parse(content) as Record<string, unknown>;
  return {
    deps: uniq(
      ['require', 'require-dev'].flatMap((k) =>
        Object.keys((json[k] as object | undefined) ?? {}),
      ),
    ),
  };
};

const parsePubspec: Parser = (content) => {
  const deps: string[] = [];
  let inDeps = false;
  for (const line of content.split('\n')) {
    if (/^(dev_)?dependencies:\s*$/.test(line)) inDeps = true;
    else if (/^\S/.test(line)) inDeps = false;
    else if (inDeps) {
      const m = line.match(/^ {2}([a-z0-9_]+):/);
      if (m) deps.push(m[1]);
    }
  }
  return { deps: uniq(deps) };
};

const parseMaven: Parser = (content) => ({
  deps: uniq([
    ...[...content.matchAll(/<artifactId>([^<]+)<\/artifactId>/g)].map(
      (m) => m[1],
    ),
    ...[...content.matchAll(/<groupId>([^<]+)<\/groupId>/g)].map((m) => m[1]),
  ]),
});

const parseGradle: Parser = (content) => {
  const deps: string[] = [];
  // "group:artifact:version" coordinates
  for (const m of content.matchAll(/["']([\w.\-]+):([\w.\-]+)(?::[^"']*)?["']/g)) {
    deps.push(m[1], m[2]);
  }
  // plugins { id("org.springframework.boot") }
  for (const m of content.matchAll(/\bid\s*\(?\s*["']([\w.\-]+)["']/g)) {
    deps.push(m[1]);
  }
  return { deps: uniq(deps) };
};

const parseCsproj: Parser = (content) => ({
  deps: uniq([
    ...[...content.matchAll(/<PackageReference\s+Include="([^"]+)"/gi)].map(
      (m) => m[1],
    ),
    ...[...content.matchAll(/<Project\s+Sdk="([^"]+)"/gi)].map((m) => m[1]),
  ]),
});

const parseMix: Parser = (content) => ({
  deps: uniq([...content.matchAll(/\{\s*:([a-z0-9_]+)\s*,/g)].map((m) => m[1])),
});

const MANIFESTS: {
  test: RegExp;
  ecosystem: Ecosystem;
  parse: Parser;
}[] = [
  { test: /(^|\/)package\.json$/, ecosystem: 'npm', parse: parsePackageJson },
  { test: /(^|\/)go\.mod$/, ecosystem: 'go', parse: parseGoMod },
  { test: /(^|\/)pyproject\.toml$/, ecosystem: 'pypi', parse: parsePyproject },
  {
    test: /(^|\/)requirements([.-][\w-]+)?\.txt$/,
    ecosystem: 'pypi',
    parse: parseRequirements,
  },
  { test: /(^|\/)cargo\.toml$/, ecosystem: 'cargo', parse: parseCargo },
  { test: /(^|\/)gemfile$/, ecosystem: 'gem', parse: parseGemfile },
  { test: /(^|\/)composer\.json$/, ecosystem: 'composer', parse: parseComposer },
  { test: /(^|\/)pubspec\.yaml$/, ecosystem: 'pub', parse: parsePubspec },
  { test: /(^|\/)pom\.xml$/, ecosystem: 'maven', parse: parseMaven },
  { test: /(^|\/)build\.gradle(\.kts)?$/, ecosystem: 'maven', parse: parseGradle },
  { test: /\.(cs|fs|vb)proj$/, ecosystem: 'nuget', parse: parseCsproj },
  { test: /(^|\/)mix\.exs$/, ecosystem: 'hex', parse: parseMix },
];

/** Directories whose manifests describe third-party or sample code */
const SKIP_DIRS =
  /(^|\/)(node_modules|vendor|third[_-]?party|examples?|samples?|fixtures?|test-?data|\.venv|venv|dist|build)\//;

export function isManifestPath(path: string): boolean {
  const lower = path.toLowerCase();
  return !SKIP_DIRS.test(lower) && MANIFESTS.some((m) => m.test.test(lower));
}

/** Pick the most relevant manifests from a repo tree: shallow ones first */
export function selectManifestPaths(paths: string[], limit = 6): string[] {
  return paths
    .filter((p) => p.split('/').length <= 3 && isManifestPath(p))
    .sort((a, b) => a.split('/').length - b.split('/').length)
    .slice(0, limit);
}

/** Root manifests worth probing when no tree is available, by primary language */
export const ROOT_MANIFESTS_BY_LANGUAGE: Record<string, string[]> = {
  TypeScript: ['package.json'],
  JavaScript: ['package.json'],
  Vue: ['package.json'],
  Svelte: ['package.json'],
  Astro: ['package.json'],
  Python: ['pyproject.toml', 'requirements.txt'],
  'Jupyter Notebook': ['requirements.txt'],
  Go: ['go.mod'],
  Rust: ['Cargo.toml'],
  Ruby: ['Gemfile'],
  PHP: ['composer.json'],
  Dart: ['pubspec.yaml'],
  Java: ['pom.xml', 'build.gradle'],
  Kotlin: ['build.gradle.kts'],
  Elixir: ['mix.exs'],
};

export function parseManifest(
  path: string,
  content: string,
): ParsedManifest | null {
  const def = MANIFESTS.find((m) => m.test.test(path.toLowerCase()));
  if (!def) return null;
  try {
    return { path, ecosystem: def.ecosystem, ...def.parse(content) };
  } catch {
    return null; // malformed manifest — ignore rather than fail the scan
  }
}
