import {
  CATALOG,
  CATEGORIES,
  findTech,
  getCategory,
  shortLanguage,
} from './catalog';
import {
  DEFAULT_SETTINGS,
  EMPTY_SELECTION,
  type BadgeStyle,
  type FrameworkLanguageMode,
  type MarkdownSettings,
  type ProfileSelection,
  type ProjectSortMode,
} from './settings';
import type { RepoInfo, ScanResult, Skill, SkillCategory } from './types';

const CATALOG_INDEX = new Map(CATALOG.map((t, i) => [t.name, i]));

export interface VisibleSkill extends Skill {
  custom?: boolean;
}

export interface VisibleCategory extends Omit<SkillCategory, 'skills'> {
  skills: VisibleSkill[];
}

/** Repos that may appear in the README */
export function visibleRepos(
  result: ScanResult,
  settings: MarkdownSettings,
  selection: ProfileSelection,
): RepoInfo[] {
  const excluded = new Set(selection.excludedRepos);
  return result.repos.filter(
    (r) => !excluded.has(r.name) && !(settings.skipArchived && r.archived),
  );
}

/**
 * Skills after user edits: excluded repos, hidden skills, the min-repo
 * threshold, and manually added skills.
 */
export function visibleCategories(
  result: ScanResult,
  settings: MarkdownSettings,
  selection: ProfileSelection,
): VisibleCategory[] {
  const repoNames = new Set(
    visibleRepos(result, settings, selection).map((r) => r.name),
  );
  const hidden = new Set(selection.hiddenSkills.map((s) => s.toLowerCase()));

  const categories: VisibleCategory[] = result.categories.map((category) => ({
    ...category,
    skills: category.skills
      .map((skill) => ({
        ...skill,
        repos: skill.repos.filter((name) => repoNames.has(name)),
      }))
      .filter(
        (skill) =>
          !hidden.has(skill.name.toLowerCase()) &&
          skill.repos.length >= Math.max(1, settings.minRepos),
      ),
  }));

  for (const custom of selection.customSkills) {
    const existing = categories
      .flatMap((c) => c.skills)
      .some((s) => s.name.toLowerCase() === custom.name.toLowerCase());
    if (existing) continue;
    let category = categories.find((c) => c.id === custom.category);
    if (!category) {
      const def = getCategory(custom.category);
      category = { id: def.id, name: def.name, skills: [] };
      categories.push(category);
    }
    category.skills.push({
      name: custom.name,
      category: custom.category,
      repos: [],
      sources: [],
      languages: {},
      bytes: 0,
      lastUsed: '',
      custom: true,
    });
  }

  const order = (id: string) => CATEGORIES.findIndex((c) => c.id === id);
  return categories
    .filter((c) => c.skills.length > 0)
    .sort((a, b) => order(a.id) - order(b.id));
}

/** "React (TS)", "Spring Boot (Kotlin)" — only when it adds information */
export function skillLabel(
  skill: Pick<Skill, 'name' | 'languages'>,
  mode: FrameworkLanguageMode,
): string {
  const used = Object.entries(skill.languages)
    .sort((a, b) => b[1] - a[1])
    .map(([lang]) => shortLanguage(lang));
  if (mode === 'never' || used.length === 0) return skill.name;
  const def = findTech(skill.name);
  // auto: Django is always Python, but React may be TS or JS
  if (mode === 'auto' && (def?.langs?.length ?? 0) < 2) return skill.name;
  return `${skill.name} (${used.join('/')})`;
}

function badgeUrl(message: string, style: BadgeStyle, name: string): string {
  const badge = findTech(name)?.badge;
  const q = new URLSearchParams({
    label: '',
    message,
    color: badge?.[0] ?? '58a6ff',
    style,
    ...(badge ? { logo: badge[1], logoColor: badge[2] ?? 'ffffff' } : {}),
  });
  return `https://img.shields.io/static/v1?${q.toString()}`;
}

function smallBadge(label: string, message: string, color: string): string {
  const q = new URLSearchParams({ label, message, color, style: 'flat-square' });
  return `https://img.shields.io/static/v1?${q.toString()}`;
}

function compareRepos(a: RepoInfo, b: RepoInfo, mode: ProjectSortMode): number {
  // Archived coursework should not push active work out of a limited list
  const active = Number(a.archived) - Number(b.archived);
  if (active !== 0) return active;
  const demo = Number(Boolean(b.homepage)) - Number(Boolean(a.homepage));
  const stars = b.stars - a.stars;
  const updated = b.updatedAt.localeCompare(a.updatedAt);
  switch (mode) {
    case 'stars':
      return stars || updated || demo;
    case 'updated':
      return updated || stars || demo;
    default: // composite: projects with a live demo first, then stars, then recency
      return demo || stars || updated;
  }
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
}

function topicSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\+/g, 'plus')
    .replace(/#/g, 'sharp')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

class ReadmeBuilder {
  private readonly hidden: Set<string>;

  constructor(
    private readonly settings: MarkdownSettings,
    selection: ProfileSelection,
  ) {
    this.hidden = new Set(selection.hiddenSkills.map((s) => s.toLowerCase()));
  }

  stack(repo: RepoInfo): string {
    const order = (id: string) => CATEGORIES.findIndex((c) => c.id === id);
    // Unknown (pass-through) languages sort after catalog entries
    const rank = (name: string) => CATALOG_INDEX.get(name) ?? CATALOG.length;
    return [...repo.techs]
      .filter((t) => !this.hidden.has(t.name.toLowerCase()))
      .sort(
        (a, b) =>
          order(a.category) - order(b.category) || rank(a.name) - rank(b.name),
      )
      .slice(0, 8)
      .map((t) => `\`${t.name}\``)
      .join(' ');
  }

  topics(repo: RepoInfo): string {
    return repo.topics
      .filter(Boolean)
      .slice(0, 6)
      .map((topic) => {
        const slug = topicSlug(topic);
        const link = slug
          ? `https://github.com/topics/${encodeURIComponent(slug)}`
          : repo.url;
        return `[![${topic}](${smallBadge('🏷️', topic, '6e7681')})](${link})`;
      })
      .join(' ');
  }

  description(repo: RepoInfo): string {
    return repo.description?.trim().replace(/\s+/g, ' ') ?? '';
  }

  listItem(repo: RepoInfo, withStack: boolean): string[] {
    const s = this.settings;
    let line = `- **[${repo.name}](${repo.url})**`;
    if (s.showArchivedBadge && repo.archived) {
      line += ` [![archived](${smallBadge('', 'archived', '6e7781')})](${repo.url})`;
    }
    if (s.showStars && repo.stars > 0) {
      line += ` [![stars](${smallBadge('★', String(repo.stars), '1f6feb')})](${repo.url})`;
    }
    if (s.showDemo && repo.homepage) {
      line += ` [![demo](${smallBadge('', 'live demo', '2ea043')})](${repo.homepage})`;
    }
    const description = this.description(repo);
    if (s.showDescription && description) line += ` — ${description}`;

    const extra = [
      withStack && s.showStack ? this.stack(repo) : '',
      s.showTopics ? this.topics(repo) : '',
    ].filter(Boolean);
    // A trailing backslash is a GFM hard break: the stack stays inside this
    // list item, indented under its project instead of floating below it.
    return [line, ...extra.map((l) => `  ${l}`)].map((l, i, all) =>
      i < all.length - 1 ? `${l}\\` : l,
    );
  }

  table(repos: RepoInfo[], withStack: boolean): string[] {
    const s = this.settings;
    const columns: [string, (r: RepoInfo) => string][] = [
      ['Project', (r) => `[${escapeCell(r.name)}](${r.url})`],
    ];
    if (s.showDescription) {
      columns.push(['Description', (r) => escapeCell(this.description(r)) || '-']);
    }
    if (withStack && s.showStack) {
      columns.push(['Stack', (r) => this.stack(r) || '-']);
    }
    if (s.showStars) columns.push(['★', (r) => String(r.stars)]);
    if (s.showDemo) {
      columns.push(['Demo', (r) => (r.homepage ? `[live](${r.homepage})` : '-')]);
    }
    if (s.showArchivedBadge) {
      columns.push(['Archived', (r) => (r.archived ? 'yes' : '-')]);
    }
    if (s.showTopics) columns.push(['Topics', (r) => this.topics(r) || '-']);

    return [
      `| ${columns.map(([h]) => h).join(' | ')} |`,
      `| ${columns.map(() => '---').join(' | ')} |`,
      ...repos.map((r) => `| ${columns.map(([, cell]) => cell(r)).join(' | ')} |`),
    ];
  }

  projects(repos: RepoInfo[], withStack: boolean): string[] {
    const sorted = [...repos].sort((a, b) =>
      compareRepos(a, b, this.settings.sort),
    );
    const limited =
      this.settings.projectLimit > 0
        ? sorted.slice(0, this.settings.projectLimit)
        : sorted;
    if (this.settings.layout === 'table') return this.table(limited, withStack);
    const items = limited.map((r) => this.listItem(r, withStack));
    // Blank lines make a loose list, so multi-line projects get breathing room
    const loose = items.some((item) => item.length > 1);
    return items.flatMap((item, i) =>
      loose && i < items.length - 1 ? [...item, ''] : item,
    );
  }
}

/** Generate GitHub-flavored markdown for a profile README */
export function generateMarkdown(
  result: ScanResult,
  settings: MarkdownSettings = DEFAULT_SETTINGS,
  selection: ProfileSelection = EMPTY_SELECTION,
): string {
  const s = settings;
  const builder = new ReadmeBuilder(s, selection);
  const categories = visibleCategories(result, s, selection);
  const repos = visibleRepos(result, s, selection);
  const lines: string[] = [];

  if (s.title.trim()) lines.push(`# ${s.title.trim()}`, '');

  if (s.showIntro) {
    const name = result.user.name?.trim() || result.user.login;
    const bio = result.user.bio?.trim();
    lines.push(`**${name}**${bio ? ` — ${bio}` : ''}`, '');
  }

  if (s.showBadges) {
    for (const category of categories) {
      const def = getCategory(category.id);
      lines.push(`### ${def.emoji} ${category.name}`);
      lines.push(
        category.skills
          .map((skill) => {
            const label = skillLabel(skill, s.frameworkLanguage);
            return `![${label}](${badgeUrl(label, s.badgeStyle, skill.name)})`;
          })
          .join(' '),
      );
      lines.push('');
    }
  }

  if (s.groupBy === 'project') {
    const withTechs = repos.filter((r) => r.techs.length > 0);
    if (withTechs.length > 0) {
      lines.push('## 🚀 Projects', '');
      lines.push(...builder.projects(withTechs, true), '');
    }
  }

  if (s.groupBy === 'skill') {
    const byName = new Map(repos.map((r) => [r.name, r]));
    for (const category of categories) {
      const skills = category.skills.filter((skill) => skill.repos.length > 0);
      if (skills.length === 0) continue;
      lines.push(`## ${getCategory(category.id).emoji} ${category.name}`, '');
      for (const skill of skills) {
        lines.push(`### ${skillLabel(skill, s.frameworkLanguage)}`, '');
        const skillRepos = skill.repos
          .map((name) => byName.get(name))
          .filter((r): r is RepoInfo => Boolean(r));
        lines.push(...builder.projects(skillRepos, false), '');
      }
    }
  }

  if (s.showFooter) {
    lines.push(
      '---',
      '',
      '*Generated with [Hiring GitHub Profile](https://hiring-github-profile.vercel.app/)*',
      '',
    );
  }

  return lines.join('\n');
}
