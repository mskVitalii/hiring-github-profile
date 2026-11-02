import { describe, expect, it } from 'vitest';
import { aggregateSkills, buildRepoInfo } from './detect';
import { generateMarkdown, skillLabel } from './markdown';
import { parseManifest } from './manifests';
import { DEFAULT_SETTINGS, EMPTY_SELECTION } from './settings';
import type { GitHubRepo, ScanResult } from './types';

function repo(name: string, language: string, stars = 0): GitHubRepo {
  return {
    name,
    html_url: `https://github.com/me/${name}`,
    homepage: null,
    description: `${name} description`,
    language,
    topics: [],
    stargazers_count: stars,
    updated_at: '2026-01-01T00:00:00Z',
    fork: false,
    archived: false,
    size: 1,
  };
}

function scan(): ScanResult {
  const pkg = parseManifest(
    'package.json',
    '{"dependencies":{"react":"1"},"devDependencies":{"typescript":"5"}}',
  )!;
  const repos = [
    buildRepoInfo(repo('web', 'TypeScript', 5), { manifests: [pkg] }, false),
    buildRepoInfo(repo('api', 'Go', 1), {}, false),
  ];
  return {
    user: {
      login: 'me',
      avatar_url: '',
      name: 'Me',
      bio: 'Builder',
      public_repos: 2,
      html_url: 'https://github.com/me',
    },
    repos,
    categories: aggregateSkills(repos),
    totalRepos: 2,
    deepScannedRepos: 0,
    mode: 'basic',
    warnings: [],
  };
}

describe('skillLabel', () => {
  it('adds the language only when the framework spans several languages', () => {
    expect(skillLabel({ name: 'React', languages: { TypeScript: 3 } }, 'auto')).toBe('React (TS)');
    expect(skillLabel({ name: 'Django', languages: { Python: 2 } }, 'auto')).toBe('Django');
    expect(skillLabel({ name: 'Django', languages: { Python: 2 } }, 'always')).toBe('Django (Python)');
    expect(skillLabel({ name: 'React', languages: { TypeScript: 1 } }, 'never')).toBe('React');
  });
});

describe('generateMarkdown', () => {
  it('lists each project once with its stack by default', () => {
    const md = generateMarkdown(scan());
    expect(md.match(/\[web\]\(/g)).toHaveLength(1);
    expect(md).toContain('## 🚀 Projects');
  });

  it('keeps the stack inside its project item and spaces projects apart', () => {
    const md = generateMarkdown(scan());
    // hard break (trailing backslash) + indented stack = same list item
    expect(md).toMatch(/\[web\]\([^)]+\)\*\*.*\\\n {2}`TypeScript` `React`\n\n- \*\*\[api\]/);
  });

  it('honours hidden skills, custom skills and excluded repos', () => {
    const md = generateMarkdown(scan(), DEFAULT_SETTINGS, {
      hiddenSkills: ['react'],
      customSkills: [{ name: 'Kafka', category: 'tools' }],
      excludedRepos: ['api'],
    });
    expect(md).not.toContain('React');
    expect(md).not.toContain('[api]');
    expect(md).not.toMatch(/!\[Go\]/);
    expect(md).toContain('🧰 Tools & Infrastructure');
    expect(md).toContain('logo=apachekafka');
  });

  it('can group projects under skills and drop sections', () => {
    const md = generateMarkdown(
      scan(),
      { ...DEFAULT_SETTINGS, groupBy: 'skill', title: '', showFooter: false, showBadges: false },
      EMPTY_SELECTION,
    );
    expect(md.startsWith('## 🧠 Languages')).toBe(true);
    expect(md).toContain('### React (TS)');
    expect(md).not.toContain('Generated with');
  });

  it('applies the badge style and min repo threshold', () => {
    const md = generateMarkdown(scan(), { ...DEFAULT_SETTINGS, badgeStyle: 'for-the-badge', minRepos: 2 });
    expect(md).not.toContain('style=for-the-badge'); // nothing has 2+ repos
    const md1 = generateMarkdown(scan(), { ...DEFAULT_SETTINGS, badgeStyle: 'for-the-badge' });
    expect(md1).toContain('style=for-the-badge');
  });
});
