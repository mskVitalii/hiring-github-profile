import { useEffect, useMemo, useState } from 'react';
import { trackAnalyticsEvent } from '../lib/analytics';
import type { ProjectLayoutMode, ProjectSortMode } from '../lib/markdown';
import { generateMarkdown } from '../lib/markdown';
import type { ScanResult } from '../lib/types';

interface Props {
  result: ScanResult;
}

type ProfileRepoStatus = 'idle' | 'checking' | 'exists' | 'missing' | 'error';

export default function MarkdownPreview({ result }: Props) {
  const [copied, setCopied] = useState(false);
  const [showPostCopyPopup, setShowPostCopyPopup] = useState(false);
  const [profileRepoStatus, setProfileRepoStatus] =
    useState<ProfileRepoStatus>('idle');
  const [tab, setTab] = useState<'preview' | 'raw'>('preview');
  const [showStars, setShowStars] = useState(true);
  const [showDemo, setShowDemo] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [showTopics, setShowTopics] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [projectLayout, setProjectLayout] = useState<ProjectLayoutMode>('list');
  const [projectSortMode, setProjectSortMode] =
    useState<ProjectSortMode>('composite');
  const [excludedRepos, setExcludedRepos] = useState<Set<string>>(new Set());

  const allProjects = useMemo(() => {
    const projects = new Map<
      string,
      { name: string; url: string; stars: number }
    >();

    for (const category of result.categories) {
      for (const skill of category.skills) {
        for (let i = 0; i < skill.repos.length; i++) {
          const name = skill.repos[i];
          const url = skill.repoUrls[i] ?? '';
          const stars = skill.repoStars[i] ?? 0;
          const existing = projects.get(name);
          if (!existing || stars > existing.stars) {
            projects.set(name, { name, url, stars });
          }
        }
      }
    }

    return [...projects.values()].sort(
      (a, b) => b.stars - a.stars || a.name.localeCompare(b.name),
    );
  }, [result]);

  useEffect(() => {
    setExcludedRepos(new Set());
  }, [result]);

  const includedRepoNames = useMemo(() => {
    if (excludedRepos.size === 0) return undefined;
    return allProjects
      .filter((project) => !excludedRepos.has(project.name))
      .map((project) => project.name);
  }, [allProjects, excludedRepos]);

  const markdown = useMemo(
    () =>
      generateMarkdown(result, {
        showStars,
        showDemo,
        showArchived,
        showTopics,
        showDescription,
        projectSortMode,
        projectLayout,
        includedRepoNames,
      }),
    [
      includedRepoNames,
      projectLayout,
      result,
      projectSortMode,
      showArchived,
      showDemo,
      showDescription,
      showStars,
      showTopics,
    ],
  );

  const checkProfileReadmeRepo = async () => {
    setProfileRepoStatus('checking');

    try {
      const owner = result.user.login;
      const repo = result.user.login;
      const response = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
        {
          headers: {
            Accept: 'application/vnd.github+json',
          },
        },
      );

      if (response.status === 200) {
        setProfileRepoStatus('exists');
        return;
      }

      if (response.status === 404) {
        setProfileRepoStatus('missing');
        return;
      }

      setProfileRepoStatus('error');
    } catch {
      setProfileRepoStatus('error');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    trackAnalyticsEvent('markdown_copied', {
      active_tab: tab,
      show_stars: showStars,
      show_demo: showDemo,
      show_archived: showArchived,
      show_topics: showTopics,
      show_description: showDescription,
      project_sort_mode: projectSortMode,
      project_layout: projectLayout,
      selected_projects_count: allProjects.length - excludedRepos.size,
      markdown_length: markdown.length,
    });
    setCopied(true);
    setShowPostCopyPopup(true);
    void checkProfileReadmeRepo();
    setTimeout(() => setCopied(false), 2000);
  };

  const githubStarUrl = 'https://github.com/mskVitalii/hiring-github-profile';
  const profileReadmeRepoUrl = `https://github.com/${result.user.login}/${result.user.login}`;
  const profileReadmeEditUrl = `${profileReadmeRepoUrl}/edit/main/README.md`;
  const createProfileRepoUrl = `https://github.com/new?name=${encodeURIComponent(result.user.login)}&description=${encodeURIComponent('GitHub profile README')}`;

  const toggleRepo = (repoName: string, enabled: boolean) => {
    setExcludedRepos((prev) => {
      const next = new Set(prev);
      if (enabled) {
        next.delete(repoName);
      } else {
        next.add(repoName);
      }
      return next;
    });
  };

  const setAllReposEnabled = (enabled: boolean) => {
    if (enabled) {
      setExcludedRepos(new Set());
      return;
    }
    setExcludedRepos(new Set(allProjects.map((project) => project.name)));
  };

  return (
    <div className='w-full max-w-3xl mx-auto'>
      <div className='mb-3 border border-gh-border rounded-lg bg-gh-bg-secondary px-4 py-3'>
        <div className='flex items-center justify-between mb-2'>
          <h3 className='text-sm font-semibold text-gh-text'>
            Projects for Markdown
          </h3>
          <div className='flex gap-2'>
            <button
              onClick={() => setAllReposEnabled(true)}
              className='px-2 py-1 rounded text-xs border border-gh-border text-gh-text-secondary hover:text-gh-text hover:border-gh-accent transition-colors cursor-pointer'
            >
              Enable all
            </button>
            <button
              onClick={() => setAllReposEnabled(false)}
              className='px-2 py-1 rounded text-xs border border-gh-border text-gh-text-secondary hover:text-gh-text hover:border-gh-accent transition-colors cursor-pointer'
            >
              Disable all
            </button>
          </div>
        </div>

        <p className='text-xs text-gh-text-secondary mb-2'>
          Enabled {allProjects.length - excludedRepos.size} of{' '}
          {allProjects.length}
        </p>

        <div className='max-h-44 overflow-auto rounded border border-gh-border bg-gh-bg p-2 space-y-1'>
          {allProjects.map((project) => {
            const enabled = !excludedRepos.has(project.name);
            return (
              <label
                key={project.name}
                className='flex items-center justify-between gap-3 text-sm text-gh-text py-1'
              >
                <span className='truncate'>{project.name}</span>
                <span className='inline-flex items-center gap-2 shrink-0'>
                  <span className='text-xs text-gh-text-secondary'>
                    ★ {project.stars}
                  </span>
                  <input
                    type='checkbox'
                    checked={enabled}
                    onChange={(e) => toggleRepo(project.name, e.target.checked)}
                    className='h-4 w-4 rounded border-gh-border bg-gh-bg text-gh-accent focus:ring-gh-accent'
                  />
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div className='flex items-center justify-between border border-gh-border rounded-t-lg bg-gh-bg-secondary px-4 py-2'>
        <div className='flex items-center gap-3 flex-wrap'>
          <div className='flex gap-1'>
            <button
              onClick={() => setTab('preview')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${
                tab === 'preview'
                  ? 'bg-gh-bg text-gh-text border border-gh-border'
                  : 'text-gh-text-secondary hover:text-gh-text'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setTab('raw')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${
                tab === 'raw'
                  ? 'bg-gh-bg text-gh-text border border-gh-border'
                  : 'text-gh-text-secondary hover:text-gh-text'
              }`}
            >
              Markdown
            </button>
          </div>

          <label className='inline-flex items-center gap-2 text-xs text-gh-text-secondary select-none'>
            <input
              type='checkbox'
              checked={showStars}
              onChange={(e) => setShowStars(e.target.checked)}
              className='h-4 w-4 rounded border-gh-border bg-gh-bg text-gh-accent focus:ring-gh-accent'
            />
            Stars
          </label>

          <label className='inline-flex items-center gap-2 text-xs text-gh-text-secondary select-none'>
            <input
              type='checkbox'
              checked={showDemo}
              onChange={(e) => setShowDemo(e.target.checked)}
              className='h-4 w-4 rounded border-gh-border bg-gh-bg text-gh-accent focus:ring-gh-accent'
            />
            Demo
          </label>

          <label className='inline-flex items-center gap-2 text-xs text-gh-text-secondary select-none'>
            <input
              type='checkbox'
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className='h-4 w-4 rounded border-gh-border bg-gh-bg text-gh-accent focus:ring-gh-accent'
            />
            Archived
          </label>

          <label className='inline-flex items-center gap-2 text-xs text-gh-text-secondary select-none'>
            <input
              type='checkbox'
              checked={showTopics}
              onChange={(e) => setShowTopics(e.target.checked)}
              className='h-4 w-4 rounded border-gh-border bg-gh-bg text-gh-accent focus:ring-gh-accent'
            />
            Topics
          </label>

          <label className='inline-flex items-center gap-2 text-xs text-gh-text-secondary select-none'>
            <input
              type='checkbox'
              checked={showDescription}
              onChange={(e) => setShowDescription(e.target.checked)}
              className='h-4 w-4 rounded border-gh-border bg-gh-bg text-gh-accent focus:ring-gh-accent'
            />
            Description
          </label>

          <label className='inline-flex items-center gap-2 text-xs text-gh-text-secondary select-none'>
            Sort
            <select
              value={projectSortMode}
              onChange={(e) =>
                setProjectSortMode(e.target.value as ProjectSortMode)
              }
              className='h-7 rounded border border-gh-border bg-gh-bg px-2 text-xs text-gh-text focus:outline-none focus:ring-1 focus:ring-gh-accent'
            >
              <option value='composite'>Demo -&gt; Stars -&gt; Date</option>
              <option value='stars'>Stars</option>
              <option value='updated'>Last commit date</option>
              <option value='demo'>Demo</option>
            </select>
          </label>

          <label className='inline-flex items-center gap-2 text-xs text-gh-text-secondary select-none'>
            Layout
            <select
              value={projectLayout}
              onChange={(e) => {
                const nextLayout = e.target.value as ProjectLayoutMode;
                setProjectLayout(nextLayout);
                if (nextLayout === 'table') {
                  setShowDescription(true);
                }
              }}
              className='h-7 rounded border border-gh-border bg-gh-bg px-2 text-xs text-gh-text focus:outline-none focus:ring-1 focus:ring-gh-accent'
            >
              <option value='list'>List</option>
              <option value='table'>Table (experimental)</option>
            </select>
          </label>
        </div>
        <button
          onClick={handleCopy}
          className='px-3 py-1.5 rounded text-sm font-medium bg-gh-green text-white hover:opacity-90 transition-opacity cursor-pointer'
        >
          {copied ? '✓ Copied!' : 'Copy MD'}
        </button>
      </div>

      {/* Content */}
      <div className='border border-t-0 border-gh-border rounded-b-lg bg-gh-bg overflow-auto'>
        {tab === 'raw' ? (
          <pre className='p-4 text-sm text-gh-text font-mono whitespace-pre-wrap wrap-break-word'>
            {markdown}
          </pre>
        ) : (
          <div className='p-6 gh-markdown'>
            <RenderedMarkdown markdown={markdown} />
          </div>
        )}
      </div>

      {showPostCopyPopup && (
        <div className='fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center px-4'>
          <div className='w-full max-w-md rounded-xl border border-gh-border bg-gh-card p-5'>
            <h3 className='text-lg font-semibold text-gh-text mb-2'>
              🚀 One final step
            </h3>
            <p className='text-sm text-gh-text-secondary mb-4'>
              Markdown is copied. You can now star the project and apply the
              generated README in your GitHub profile repository.
            </p>
            <div className='space-y-2'>
              <a
                href={githubStarUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='w-full inline-flex items-center justify-center px-3 py-2 rounded-md bg-gh-accent text-gh-bg font-semibold hover:opacity-90'
              >
                ⭐ Star on GitHub
              </a>

              {profileRepoStatus === 'checking' && (
                <p className='text-xs text-gh-text-secondary'>
                  Checking your profile README repository...
                </p>
              )}

              {profileRepoStatus === 'exists' && (
                <>
                  <a
                    href={profileReadmeEditUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='w-full inline-flex items-center justify-center px-3 py-2 rounded-md border border-gh-border text-gh-text hover:border-gh-accent hover:text-gh-accent'
                  >
                    ✏️ Open README editor
                  </a>
                  <a
                    href={profileReadmeRepoUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='w-full inline-flex items-center justify-center px-3 py-2 rounded-md border border-gh-border text-gh-text-secondary hover:border-gh-accent hover:text-gh-accent'
                  >
                    📁 Open profile repository
                  </a>
                </>
              )}

              {profileRepoStatus === 'missing' && (
                <>
                  <div className='rounded-md border border-gh-border p-3 text-xs text-gh-text-secondary space-y-1'>
                    <p className='font-medium text-gh-text'>
                      Profile repository not found
                    </p>
                    <p>
                      1. Create a public repository named exactly{' '}
                      {result.user.login}.
                    </p>
                    <p>2. Add README.md during creation.</p>
                    <p>3. Paste copied markdown into README.md and commit.</p>
                  </div>
                  <a
                    href={createProfileRepoUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='w-full inline-flex items-center justify-center px-3 py-2 rounded-md border border-gh-border text-gh-text hover:border-gh-accent hover:text-gh-accent'
                  >
                    📁 Create profile repository
                  </a>
                </>
              )}

              {profileRepoStatus === 'error' && (
                <>
                  <p className='text-xs text-gh-text-secondary'>
                    Could not verify repository automatically. You can create it
                    or open it manually.
                  </p>
                  <div className='grid grid-cols-1 gap-2'>
                    <a
                      href={createProfileRepoUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='w-full inline-flex items-center justify-center px-3 py-2 rounded-md border border-gh-border text-gh-text hover:border-gh-accent hover:text-gh-accent'
                    >
                      📁 Create profile repository
                    </a>
                    <a
                      href={profileReadmeRepoUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='w-full inline-flex items-center justify-center px-3 py-2 rounded-md border border-gh-border text-gh-text-secondary hover:border-gh-accent hover:text-gh-accent'
                    >
                      📂 Open profile repository
                    </a>
                  </div>
                </>
              )}
            </div>
            <button
              type='button'
              onClick={() => setShowPostCopyPopup(false)}
              className='mt-4 w-full px-3 py-2 rounded-md text-sm text-gh-text-secondary hover:text-gh-text border border-gh-border'
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Simple GitHub-flavored markdown renderer (no external deps) */
function RenderedMarkdown({ markdown }: { markdown: string }) {
  const html = useMemo(() => renderGfm(markdown), [markdown]);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function toAnchor(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function isTableSeparatorLine(line: string): boolean {
  return /^\s*\|?(\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/.test(line);
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function renderTables(html: string): string {
  const lines = html.split('\n');
  const out: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1] ?? '';

    if (line.includes('|') && isTableSeparatorLine(nextLine)) {
      const headers = splitTableRow(line);
      const rows: string[][] = [];
      i += 2;

      while (i < lines.length) {
        const rowLine = lines[i];
        if (
          !rowLine.trim() ||
          !rowLine.includes('|') ||
          rowLine.startsWith('<')
        ) {
          break;
        }
        rows.push(splitTableRow(rowLine));
        i++;
      }
      i--;

      const thead = `<thead><tr>${headers
        .map(
          (h) =>
            `<th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gh-text-secondary border border-gh-border">${h}</th>`,
        )
        .join('')}</tr></thead>`;
      const tbody = `<tbody>${rows
        .map(
          (row) =>
            `<tr>${row
              .map(
                (cell) =>
                  `<td class="px-3 py-2 align-top text-sm text-gh-text border border-gh-border">${cell || '-'}</td>`,
              )
              .join('')}</tr>`,
        )
        .join('')}</tbody>`;

      out.push(
        `<div class="my-3 overflow-x-auto"><table class="w-full border-collapse">${thead}${tbody}</table></div>`,
      );
      continue;
    }

    out.push(line);
  }

  return out.join('\n');
}

function renderGfm(md: string): string {
  let html = escapeHtml(md);

  // Headings (order matters: h3 before h2 before h1)
  html = html.replace(/^### (.+)$/gm, (_match, p1) => {
    const id = toAnchor(p1);
    return `<h3 id="${id}" class="text-base font-semibold text-gh-text mt-6 mb-2 scroll-mt-4">${p1}</h3>`;
  });
  html = html.replace(
    /^## (.+)$/gm,
    (_match, p1) =>
      `<h2 class="text-lg font-bold text-gh-text mt-8 mb-3 pb-1 border-b border-gh-border">${p1}</h2>`,
  );
  html = html.replace(
    /^# (.+)$/gm,
    '<h1 class="text-2xl font-bold text-gh-text mb-4">$1</h1>',
  );

  // Blockquotes
  html = html.replace(
    /^&gt; (.+)$/gm,
    '<blockquote class="pl-4 border-l-4 border-gh-border text-gh-text-secondary italic my-2">$1</blockquote>',
  );

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="border-gh-border my-6" />');

  // Images (badges)
  html = html.replace(
    /\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g,
    '<a href="$3" class="inline-block mr-1 mb-1"><img src="$2" alt="$1" class="inline h-5" /></a>',
  );
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="inline h-5 mr-1 mb-1" />',
  );

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-gh-accent underline underline-offset-2 decoration-1 hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent/70 rounded-sm">$1</a>',
  );

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Markdown tables
  html = renderTables(html);

  // List items
  html = html.replace(
    /^- (.+)$/gm,
    '<li class="ml-4 list-disc text-gh-text text-sm leading-relaxed">$1</li>',
  );

  // Wrap consecutive <li> in <ul>
  html = html.replace(
    /((?:<li[^>]*>.*<\/li>\n?)+)/g,
    '<ul class="my-2 space-y-1">$1</ul>',
  );

  // Paragraphs: wrap remaining non-empty, non-tag lines
  html = html.replace(
    /^(?!<[a-z/])(.+)$/gm,
    '<p class="text-sm text-gh-text-secondary my-1">$1</p>',
  );

  // Clean empty lines
  html = html.replace(/\n{2,}/g, '\n');

  return html;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
