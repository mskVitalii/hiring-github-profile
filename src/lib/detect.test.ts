import { describe, expect, it } from 'vitest';
import { aggregateSkills, buildRepoInfo, detectRepoTechs } from './detect';
import { parseManifest } from './manifests';
import type { GitHubRepo } from './types';

function makeRepo(
  name: string,
  language: string | null,
  topics: string[] = [],
  description: string | null = null,
): GitHubRepo {
  return {
    name,
    html_url: `https://github.com/test/${name}`,
    homepage: null,
    description,
    language,
    topics,
    stargazers_count: 0,
    updated_at: '2026-01-01T00:00:00Z',
    fork: false,
    archived: false,
    size: 1,
  };
}

const names = (repo: GitHubRepo, signals = {}) =>
  detectRepoTechs(repo, signals).map((t) => t.name);

describe('languages come only from linguist data', () => {
  it('does not read "go" out of government, tango, or algorithms', () => {
    const repo = makeRepo(
      'Tango-server',
      'Python',
      ['bachelor-project'],
      'Semantic search across government open data, algorithms in Go-style',
    );
    expect(names(repo)).not.toContain('Go');
    expect(names(repo)).toContain('Python');
  });

  it('does not detect Java from "javascript" or TypeScript from "ts"', () => {
    const repo = makeRepo('ComBots', 'JavaScript', ['html-css-javascript'], 'Demo for NCahoots');
    const found = names(repo);
    expect(found).not.toContain('Java');
    expect(found).not.toContain('TypeScript');
    expect(found).toContain('JavaScript');
  });

  it('drops tiny shares like a 46-byte config file', () => {
    const repo = makeRepo('linear-adaptive', 'TypeScript');
    const found = names(repo, {
      languages: { TypeScript: 15144, SCSS: 2471, JavaScript: 46 },
    });
    expect(found).toEqual(expect.arrayContaining(['TypeScript', 'Sass']));
    expect(found).not.toContain('JavaScript');
  });

  it('keeps unknown languages as language skills, drops build glue', () => {
    const repo = makeRepo('soap-dish', 'OpenSCAD');
    const techs = detectRepoTechs(repo, {
      languages: { OpenSCAD: 900, Makefile: 100 },
    });
    expect(techs.map((t) => [t.name, t.category])).toEqual([
      ['OpenSCAD', 'languages'],
    ]);
  });
});

describe('frameworks are tied to the language they were used with', () => {
  it('attributes manifest deps to the ecosystem language', () => {
    const repo = makeRepo('chemnitz_map', 'TypeScript');
    const techs = detectRepoTechs(repo, {
      languages: { TypeScript: 111980, Go: 103070 },
      manifests: [
        parseManifest('client/package.json', JSON.stringify({
          dependencies: { react: '^19', vite: '^7' },
          devDependencies: { typescript: '^5' },
        }))!,
        parseManifest('server/go.mod', 'module x\n\nrequire github.com/gin-gonic/gin v1.9.1\n')!,
      ],
    });
    const byName = Object.fromEntries(techs.map((t) => [t.name, t]));
    expect(byName.React.language).toBe('TypeScript');
    expect(byName.Gin.language).toBe('Go');
    expect(byName.React.sources).toEqual(['manifest']);
  });

  it('attributes React to JavaScript in a JS-only repo', () => {
    const repo = makeRepo('old-app', 'JavaScript');
    const techs = detectRepoTechs(repo, {
      manifests: [parseManifest('package.json', '{"dependencies":{"react":"16"}}')!],
    });
    expect(techs.find((t) => t.name === 'React')?.language).toBe('JavaScript');
  });

  it('ignores ecosystem-bound topics when the language is absent', () => {
    expect(names(makeRepo('api-service', 'TypeScript', ['gin-gonic']))).not.toContain('Gin');
    expect(names(makeRepo('go-api', 'Go', ['gin-gonic']))).toContain('Gin');
    expect(names(makeRepo('react-redux-watcher', 'C#', ['react']))).not.toContain('React');
  });

  it('keeps language-agnostic topics', () => {
    expect(names(makeRepo('infra', 'Python', ['docker', 'postgresql']))).toEqual(
      expect.arrayContaining(['Docker', 'PostgreSQL']),
    );
  });

  it('adds implied techs with the same language', () => {
    const repo = makeRepo('site', 'TypeScript');
    const techs = detectRepoTechs(repo, {
      manifests: [parseManifest('package.json', '{"dependencies":{"next":"15"},"devDependencies":{"typescript":"5"}}')!],
    });
    const react = techs.find((t) => t.name === 'React');
    expect(react?.sources).toEqual(['implied']);
    expect(react?.language).toBe('TypeScript');
  });
});

describe('file tree signals', () => {
  it('needs .github/workflows for GitHub Actions, not just .github', () => {
    const repo = makeRepo('r', 'Go');
    expect(names(repo, { paths: ['.github/issue_template/bug.yml'] })).not.toContain('GitHub Actions');
    expect(names(repo, { paths: ['.github/workflows/ci.yml'] })).toContain('GitHub Actions');
  });

  it('does not treat a UI charts folder as Helm', () => {
    const repo = makeRepo('r', 'TypeScript');
    expect(names(repo, { paths: ['src/features/charts/searchbydatechart.tsx'] })).not.toContain('Helm');
    expect(names(repo, { paths: ['deploy/chart.yaml'] })).toContain('Helm');
  });

  it('does not call every *.test.ts file Jest', () => {
    const repo = makeRepo('r', 'TypeScript');
    expect(names(repo, { paths: ['src/lib/github.test.ts'] })).not.toContain('Jest');
  });

  it('reads databases from docker compose', () => {
    const repo = makeRepo('r', 'Go');
    const found = names(repo, {
      composeFiles: ['services:\n  db:\n    image: postgres:16\n  q:\n    image: qdrant/qdrant\n'],
    });
    expect(found).toEqual(expect.arrayContaining(['Docker', 'PostgreSQL', 'Qdrant']));
  });
});

describe('aggregateSkills', () => {
  it('counts per-language usage of frameworks across repos', () => {
    const ts = makeRepo('a', 'TypeScript');
    const js = makeRepo('b', 'JavaScript');
    const react = (typescript: boolean) => [
      parseManifest('package.json', JSON.stringify({
        dependencies: { react: '1' },
        devDependencies: typescript ? { typescript: '5' } : {},
      }))!,
    ];
    const categories = aggregateSkills([
      buildRepoInfo(ts, { manifests: react(true) }, false),
      buildRepoInfo(js, { manifests: react(false) }, false),
    ]);
    const skill = categories
      .flatMap((c) => c.skills)
      .find((s) => s.name === 'React');
    expect(skill?.repos).toEqual(['a', 'b']);
    expect(skill?.languages).toEqual({ TypeScript: 1, JavaScript: 1 });
    expect(categories.map((c) => c.id)).toEqual(['languages', 'frontend']);
  });
});
