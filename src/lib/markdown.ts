import { CATEGORY_EMOJIS } from './keywords';
import type { ScanResult } from './types';

export interface MarkdownOptions {
  showStars?: boolean;
  showDemo?: boolean;
  showArchived?: boolean;
  showTopics?: boolean;
  projectSortMode?: ProjectSortMode;
  showDescription?: boolean;
  projectLayout?: ProjectLayoutMode;
  includedRepoNames?: string[];
}

export type ProjectSortMode = 'composite' | 'stars' | 'updated' | 'demo';
export type ProjectLayoutMode = 'list' | 'table';

type RepoView = {
  repoName: string;
  repoUrl: string;
  description: string | null;
  homepage: string | null;
  topics: string[];
  stars: number;
  updatedAt: string;
  archived: boolean;
};

function compareRepos(a: RepoView, b: RepoView, mode: ProjectSortMode): number {
  const demoDiff = Number(Boolean(b.homepage)) - Number(Boolean(a.homepage));
  const starsDiff = b.stars - a.stars;
  const updatedDiff =
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();

  if (mode === 'demo') {
    if (demoDiff !== 0) return demoDiff;
    if (starsDiff !== 0) return starsDiff;
    return updatedDiff;
  }

  if (mode === 'stars') {
    if (starsDiff !== 0) return starsDiff;
    if (updatedDiff !== 0) return updatedDiff;
    return demoDiff;
  }

  if (mode === 'updated') {
    if (updatedDiff !== 0) return updatedDiff;
    if (starsDiff !== 0) return starsDiff;
    return demoDiff;
  }

  // Default composite: demo -> stars -> updated
  if (demoDiff !== 0) return demoDiff;
  if (starsDiff !== 0) return starsDiff;
  return updatedDiff;
}

function formatUpdatedDate(value: string): string {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toISOString().slice(0, 10);
}

function escapeTableCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim();
}

const FRAMEWORK_LANGUAGE_MAP: Record<string, string> = {
  React: 'TS/JS',
  Vue: 'TS/JS',
  Angular: 'TypeScript',
  Svelte: 'TS/JS',
  'Next.js': 'TS/JS',
  Nuxt: 'TS/JS',
  Astro: 'TS/JS',
  Gatsby: 'TS/JS',
  'Tailwind CSS': 'CSS',
  Bootstrap: 'CSS',
  'Material UI': 'TS/JS',
  'Styled Components': 'TS/JS',
  Sass: 'CSS',
  Redux: 'TS/JS',
  Zustand: 'TS/JS',
  Vite: 'TS/JS',
  Webpack: 'JavaScript',
  'Node.js': 'TS/JS',
  Express: 'TS/JS',
  Fastify: 'TS/JS',
  NestJS: 'TypeScript',
  Django: 'Python',
  Flask: 'Python',
  FastAPI: 'Python',
  'Spring Boot': 'Java/Kotlin',
  'Ruby on Rails': 'Ruby',
  Laravel: 'PHP',
  Gin: 'Go',
  Fiber: 'Go',
  Actix: 'Rust',
  'React Native': 'TS/JS',
  Flutter: 'Dart',
  SwiftUI: 'Swift',
};
interface BadgeConfig {
  color: string;
  logo: string;
  logoColor?: string;
}

/** shields.io badge config per skill — color and Simple Icons logo slug */
const SKILL_BADGE_MAP: Record<string, BadgeConfig> = {
  // Languages
  JavaScript: { color: 'F7DF1E', logo: 'javascript', logoColor: '000000' },
  TypeScript: { color: '3178C6', logo: 'typescript', logoColor: 'ffffff' },
  HTML: { color: 'E34F26', logo: 'html5', logoColor: 'ffffff' },
  CSS: { color: '1572B6', logo: 'css3', logoColor: 'ffffff' },
  Python: { color: '3776AB', logo: 'python', logoColor: 'ffffff' },
  Java: { color: 'ED8B00', logo: 'openjdk', logoColor: 'ffffff' },
  Go: { color: '00ADD8', logo: 'go', logoColor: 'ffffff' },
  Rust: { color: 'CE422B', logo: 'rust', logoColor: 'ffffff' },
  Ruby: { color: 'CC342D', logo: 'ruby', logoColor: 'ffffff' },
  PHP: { color: '777BB4', logo: 'php', logoColor: 'ffffff' },
  Swift: { color: 'FA7343', logo: 'swift', logoColor: 'ffffff' },
  Kotlin: { color: '7F52FF', logo: 'kotlin', logoColor: 'ffffff' },
  Scala: { color: 'DC322F', logo: 'scala', logoColor: 'ffffff' },
  Dart: { color: '0175C2', logo: 'dart', logoColor: 'ffffff' },
  Elixir: { color: '4B275F', logo: 'elixir', logoColor: 'ffffff' },
  Haskell: { color: '5D4F85', logo: 'haskell', logoColor: 'ffffff' },
  Lua: { color: '2C2D72', logo: 'lua', logoColor: 'ffffff' },
  'C++': { color: '00599C', logo: 'cplusplus', logoColor: 'ffffff' },
  'C# / .NET': { color: '512BD4', logo: 'dotnet', logoColor: 'ffffff' },
  Shell: { color: '4EAA25', logo: 'gnubash', logoColor: 'ffffff' },
  // Frontend
  React: { color: '61DAFB', logo: 'react', logoColor: '000000' },
  Vue: { color: '4FC08D', logo: 'vuedotjs', logoColor: 'ffffff' },
  Angular: { color: 'DD0031', logo: 'angular', logoColor: 'ffffff' },
  Svelte: { color: 'FF3E00', logo: 'svelte', logoColor: 'ffffff' },
  'Next.js': { color: '000000', logo: 'nextdotjs', logoColor: 'ffffff' },
  Nuxt: { color: '00DC82', logo: 'nuxtdotjs', logoColor: 'ffffff' },
  Astro: { color: 'BC52EE', logo: 'astro', logoColor: 'ffffff' },
  Gatsby: { color: '663399', logo: 'gatsby', logoColor: 'ffffff' },
  'Tailwind CSS': { color: '06B6D4', logo: 'tailwindcss', logoColor: 'ffffff' },
  Bootstrap: { color: '7952B3', logo: 'bootstrap', logoColor: 'ffffff' },
  'Material UI': { color: '007FFF', logo: 'mui', logoColor: 'ffffff' },
  'Styled Components': {
    color: 'DB7093',
    logo: 'styledcomponents',
    logoColor: 'ffffff',
  },
  Sass: { color: 'CC6699', logo: 'sass', logoColor: 'ffffff' },
  Vite: { color: '646CFF', logo: 'vite', logoColor: 'ffffff' },
  Webpack: { color: '8DD6F9', logo: 'webpack', logoColor: '000000' },
  Redux: { color: '764ABC', logo: 'redux', logoColor: 'ffffff' },
  Zustand: { color: '764ABC', logo: 'react', logoColor: 'ffffff' },
  // Backend
  'Node.js': { color: '339933', logo: 'nodedotjs', logoColor: 'ffffff' },
  Express: { color: '000000', logo: 'express', logoColor: 'ffffff' },
  Fastify: { color: '000000', logo: 'fastify', logoColor: 'ffffff' },
  NestJS: { color: 'E0234E', logo: 'nestjs', logoColor: 'ffffff' },
  Django: { color: '092E20', logo: 'django', logoColor: 'ffffff' },
  Flask: { color: '000000', logo: 'flask', logoColor: 'ffffff' },
  FastAPI: { color: '009688', logo: 'fastapi', logoColor: 'ffffff' },
  'Spring Boot': { color: '6DB33F', logo: 'springboot', logoColor: 'ffffff' },
  'Ruby on Rails': {
    color: 'CC0000',
    logo: 'rubyonrails',
    logoColor: 'ffffff',
  },
  Laravel: { color: 'FF2D20', logo: 'laravel', logoColor: 'ffffff' },
  Gin: { color: '00ADD8', logo: 'go', logoColor: 'ffffff' },
  Fiber: { color: '00ADD8', logo: 'go', logoColor: 'ffffff' },
  Actix: { color: 'CE422B', logo: 'rust', logoColor: 'ffffff' },
  // Databases
  PostgreSQL: { color: '4169E1', logo: 'postgresql', logoColor: 'ffffff' },
  MySQL: { color: '4479A1', logo: 'mysql', logoColor: 'ffffff' },
  MongoDB: { color: '47A248', logo: 'mongodb', logoColor: 'ffffff' },
  Redis: { color: 'FF4438', logo: 'redis', logoColor: 'ffffff' },
  SQLite: { color: '003B57', logo: 'sqlite', logoColor: 'ffffff' },
  Elasticsearch: {
    color: '005571',
    logo: 'elasticsearch',
    logoColor: 'ffffff',
  },
  Firebase: { color: 'FFCA28', logo: 'firebase', logoColor: '000000' },
  Supabase: { color: '3ECF8E', logo: 'supabase', logoColor: 'ffffff' },
  Prisma: { color: '2D3748', logo: 'prisma', logoColor: 'ffffff' },
  DynamoDB: { color: '4053D6', logo: 'amazondynamodb', logoColor: 'ffffff' },
  // DevOps & Cloud
  Docker: { color: '2496ED', logo: 'docker', logoColor: 'ffffff' },
  Kubernetes: { color: '326CE5', logo: 'kubernetes', logoColor: 'ffffff' },
  AWS: { color: 'FF9900', logo: 'amazonaws', logoColor: '000000' },
  GCP: { color: '4285F4', logo: 'googlecloud', logoColor: 'ffffff' },
  Azure: { color: '0078D4', logo: 'microsoftazure', logoColor: 'ffffff' },
  Terraform: { color: '844FBA', logo: 'terraform', logoColor: 'ffffff' },
  Ansible: { color: 'EE0000', logo: 'ansible', logoColor: 'ffffff' },
  'GitHub Actions': {
    color: '2088FF',
    logo: 'githubactions',
    logoColor: 'ffffff',
  },
  Jenkins: { color: 'D24939', logo: 'jenkins', logoColor: 'ffffff' },
  Nginx: { color: '009639', logo: 'nginx', logoColor: 'ffffff' },
  Helm: { color: '0F1689', logo: 'helm', logoColor: 'ffffff' },
  Grafana: { color: 'F46800', logo: 'grafana', logoColor: 'ffffff' },
  Prometheus: { color: 'E6522C', logo: 'prometheus', logoColor: 'ffffff' },
  ArgoCD: { color: 'EF7B4D', logo: 'argo', logoColor: 'ffffff' },
  // Mobile
  'React Native': { color: '61DAFB', logo: 'react', logoColor: '000000' },
  Flutter: { color: '02569B', logo: 'flutter', logoColor: 'ffffff' },
  SwiftUI: { color: 'FA7343', logo: 'swift', logoColor: 'ffffff' },
  Android: { color: '34A853', logo: 'android', logoColor: 'ffffff' },
  Expo: { color: '000020', logo: 'expo', logoColor: 'ffffff' },
  // ML & AI
  TensorFlow: { color: 'FF6F00', logo: 'tensorflow', logoColor: 'ffffff' },
  PyTorch: { color: 'EE4C2C', logo: 'pytorch', logoColor: 'ffffff' },
  Pandas: { color: '150458', logo: 'pandas', logoColor: 'ffffff' },
  NumPy: { color: '013243', logo: 'numpy', logoColor: 'ffffff' },
  Jupyter: { color: 'F37626', logo: 'jupyter', logoColor: 'ffffff' },
  OpenAI: { color: '412991', logo: 'openai', logoColor: 'ffffff' },
  // Testing
  Jest: { color: 'C21325', logo: 'jest', logoColor: 'ffffff' },
  Vitest: { color: '6E9F18', logo: 'vitest', logoColor: 'ffffff' },
  Cypress: { color: '17202C', logo: 'cypress', logoColor: 'ffffff' },
  Playwright: { color: '2EAD33', logo: 'playwright', logoColor: 'ffffff' },
  Pytest: { color: '0A9EDC', logo: 'pytest', logoColor: 'ffffff' },
  Mocha: { color: '8D6748', logo: 'mocha', logoColor: 'ffffff' },
  Storybook: { color: 'FF4785', logo: 'storybook', logoColor: 'ffffff' },
  // Tools & Infrastructure
  GraphQL: { color: 'E10098', logo: 'graphql', logoColor: 'ffffff' },
  Kafka: { color: '231F20', logo: 'apachekafka', logoColor: 'ffffff' },
  RabbitMQ: { color: 'FF6600', logo: 'rabbitmq', logoColor: 'ffffff' },
};

function skillDisplayName(skillName: string): string {
  const lang = FRAMEWORK_LANGUAGE_MAP[skillName];
  return lang ? `${skillName} (${lang})` : skillName;
}

function categoryDisplayName(categoryName: string): string {
  return `${CATEGORY_EMOJIS[categoryName] ?? '📦'} ${categoryName}`;
}

function toTopicSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\+/g, 'plus')
    .replace(/#/g, 'sharp')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getTopicLink(topic: string, repoUrl: string): string {
  const topicSlug = toTopicSlug(topic);
  if (!topicSlug) return repoUrl;
  return `https://github.com/topics/${encodeURIComponent(topicSlug)}`;
}

function buildSkillBadge(skillName: string): string {
  const displayName = skillDisplayName(skillName);
  const config = SKILL_BADGE_MAP[skillName];

  const q = new URLSearchParams({
    label: '',
    message: displayName,
    color: config?.color ?? '58a6ff',
    style: 'flat-square',
    ...(config
      ? { logo: config.logo, logoColor: config.logoColor ?? 'ffffff' }
      : {}),
  });
  return `https://img.shields.io/static/v1?${q.toString()}`;
}

function topicBadgeUrl(topic: string): string {
  const q = new URLSearchParams({
    label: '🏷️',
    message: topic,
    color: '6e7681',
    style: 'flat-square',
  });
  return `https://img.shields.io/static/v1?${q.toString()}`;
}

/** Generate GitHub-flavored markdown for profile skills */
export function generateMarkdown(
  result: ScanResult,
  options: MarkdownOptions = {},
): string {
  const { categories } = result;
  const showStars = options.showStars ?? true;
  const showDemo = options.showDemo ?? true;
  const showArchived = options.showArchived ?? false;
  const showTopics = options.showTopics ?? false;
  const projectSortMode = options.projectSortMode ?? 'composite';
  const showDescription = options.showDescription ?? false;
  const projectLayout = options.projectLayout ?? 'list';
  const includedRepoSet = options.includedRepoNames
    ? new Set(options.includedRepoNames)
    : null;
  const lines: string[] = [];

  const filteredCategories = categories
    .map((category) => {
      const filteredSkills = category.skills
        .map((skill) => {
          const keptIndices = skill.repos
            .map((repoName, index) => ({ repoName, index }))
            .filter(
              ({ repoName }) =>
                !includedRepoSet || includedRepoSet.has(repoName),
            )
            .map(({ index }) => index);

          if (keptIndices.length === 0) return null;

          return {
            ...skill,
            repos: keptIndices.map((i) => skill.repos[i]),
            repoUrls: keptIndices.map((i) => skill.repoUrls[i]),
            repoDescriptions: keptIndices.map(
              (i) => skill.repoDescriptions[i] ?? null,
            ),
            repoHomepages: keptIndices.map((i) => skill.repoHomepages[i]),
            repoTopics: keptIndices.map((i) => skill.repoTopics[i] ?? []),
            repoStars: keptIndices.map((i) => skill.repoStars[i] ?? 0),
            repoUpdatedAt: keptIndices.map((i) => skill.repoUpdatedAt[i] ?? ''),
            repoArchived: keptIndices.map(
              (i) => skill.repoArchived[i] ?? false,
            ),
          };
        })
        .filter((skill): skill is (typeof category.skills)[number] =>
          Boolean(skill),
        );

      return {
        ...category,
        skills: filteredSkills,
      };
    })
    .filter((category) => category.skills.length > 0);

  // Header
  lines.push(`# Tech Stack`);
  lines.push('');

  // Category summary with grouped skill badges
  lines.push('## Skills by Category');
  lines.push('');
  for (const category of filteredCategories) {
    lines.push(`### ${categoryDisplayName(category.name)}`);
    const badges = category.skills.map(
      (skill) =>
        `![${skillDisplayName(skill.name)}](${buildSkillBadge(skill.name)})`,
    );
    lines.push(badges.join(' '));
    lines.push('');
  }

  // Detailed sections per category
  for (const category of filteredCategories) {
    lines.push(`## ${categoryDisplayName(category.name)}`);
    lines.push('');

    for (const skill of category.skills) {
      const displayName = skillDisplayName(skill.name);
      lines.push(`### ${displayName}`);
      lines.push('');

      const repos = skill.repos.map((repoName, i) => ({
        repoName,
        repoUrl: skill.repoUrls[i],
        description: skill.repoDescriptions[i] ?? null,
        homepage: skill.repoHomepages[i],
        topics: skill.repoTopics[i] ?? [],
        stars: skill.repoStars[i] ?? 0,
        updatedAt: skill.repoUpdatedAt[i] ?? '',
        archived: skill.repoArchived[i] ?? false,
      }));

      repos.sort((a, b) => compareRepos(a, b, projectSortMode));

      if (projectLayout === 'table') {
        const headers = ['Repository'];
        if (showDescription) headers.push('Description');
        if (showStars) headers.push('Stars');
        if (showDemo) headers.push('Demo');
        if (showArchived) headers.push('Archived');
        if (showTopics) headers.push('Topics');

        lines.push(`| ${headers.join(' | ')} |`);
        lines.push(`| ${headers.map(() => '---').join(' | ')} |`);

        for (const repo of repos) {
          const cells: string[] = [
            `[${escapeTableCell(repo.repoName)}](${repo.repoUrl})`,
          ];

          if (showDescription) {
            cells.push(
              repo.description?.trim()
                ? escapeTableCell(repo.description)
                : '-',
            );
          }

          if (showStars) {
            cells.push(String(repo.stars ?? 0));
          }

          if (showDemo) {
            cells.push(repo.homepage ? `[live](${repo.homepage})` : '-');
          }

          if (showArchived) {
            cells.push(repo.archived ? 'yes' : '-');
          }

          if (showTopics) {
            const topics = repo.topics
              .filter(Boolean)
              .slice(0, 6)
              .map(
                (topic) =>
                  `[![${topic}](${topicBadgeUrl(topic)})](${getTopicLink(topic, repo.repoUrl)})`,
              );
            cells.push(topics.length > 0 ? topics.join(' ') : '-');
          }

          lines.push(`| ${cells.join(' | ')} |`);
        }

        lines.push('');
        continue;
      }

      for (const repo of repos) {
        let line = `- [${repo.repoName}](${repo.repoUrl})`;
        if (showArchived && repo.archived) {
          line += ` [![archived](https://img.shields.io/badge/archived-yes-6e7781?style=flat-square)](${repo.repoUrl})`;
        }
        if (showStars && repo.stars > 0) {
          line += ` [![stars](https://img.shields.io/badge/stars-${repo.stars}-1f6feb?style=flat-square)](${repo.repoUrl})`;
        }
        if (showDemo && repo.homepage) {
          line += ` [![demo](https://img.shields.io/badge/demo-live-2ea043?style=flat-square)](${repo.homepage})`;
        }
        if (showDescription && repo.description?.trim()) {
          line += ` - ${repo.description.trim().replace(/\s+/g, ' ')}`;
        }

        lines.push(line);

        if (showTopics) {
          const topics = repo.topics
            .filter(Boolean)
            .slice(0, 6)
            .map(
              (topic) =>
                `[![${topic}](${topicBadgeUrl(topic)})](${getTopicLink(topic, repo.repoUrl)})`,
            );

          if (topics.length > 0) {
            lines.push(`  ${topics.join(' ')}`);
          }
        }
      }
      lines.push('');
    }
  }

  // Footer
  lines.push('---');
  lines.push('');
  lines.push(
    '*Generated with [Hiring GitHub Profile](https://hiring-github-profile.vercel.app/)*',
  );
  lines.push('');

  return lines.join('\n');
}
