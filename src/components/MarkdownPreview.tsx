import { useMemo, useState } from 'react';
import { trackAnalyticsEvent } from '../lib/analytics';

interface Props {
  markdown: string;
  login: string;
  /** Extra fields for the markdown_copied analytics event */
  analytics: Record<string, string | number | boolean>;
}

type ProfileRepoStatus = 'idle' | 'checking' | 'exists' | 'missing' | 'error';

export default function MarkdownPreview({ markdown, login, analytics }: Props) {
  const [copied, setCopied] = useState(false);
  const [showPostCopyPopup, setShowPostCopyPopup] = useState(false);
  const [profileRepoStatus, setProfileRepoStatus] =
    useState<ProfileRepoStatus>('idle');
  const [tab, setTab] = useState<'preview' | 'raw'>('preview');

  const checkProfileReadmeRepo = async () => {
    setProfileRepoStatus('checking');

    try {
      const response = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(login)}/${encodeURIComponent(login)}`,
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
      markdown_length: markdown.length,
      ...analytics,
    });
    setCopied(true);
    setShowPostCopyPopup(true);
    void checkProfileReadmeRepo();
    setTimeout(() => setCopied(false), 2000);
  };

  const githubStarUrl = 'https://github.com/mskVitalii/hiring-github-profile';
  const profileReadmeRepoUrl = `https://github.com/${login}/${login}`;
  const profileReadmeEditUrl = `${profileReadmeRepoUrl}/edit/main/README.md`;
  const createProfileRepoUrl = `https://github.com/new?name=${encodeURIComponent(login)}&description=${encodeURIComponent('GitHub profile README')}`;

  const tabClass = (active: boolean) =>
    `px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${
      active
        ? 'bg-gh-bg text-gh-text border border-gh-border'
        : 'text-gh-text-secondary hover:text-gh-text'
    }`;

  return (
    <div className='w-full'>
      {/* Toolbar */}
      <div className='flex items-center justify-between border border-gh-border rounded-t-lg bg-gh-bg-secondary px-4 py-2'>
        <div className='flex gap-1'>
          <button onClick={() => setTab('preview')} className={tabClass(tab === 'preview')}>
            Preview
          </button>
          <button onClick={() => setTab('raw')} className={tabClass(tab === 'raw')}>
            Markdown
          </button>
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
                      {login}.
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

  // Inline code
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="px-1 py-0.5 rounded bg-gh-bg-secondary border border-gh-border text-xs">$1</code>',
  );

  // Images (badges)
  html = html.replace(
    /\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g,
    (_m, alt, src, href) =>
      `<a href="${safeUrl(href)}" class="inline-block mr-1 mb-1"><img src="${safeUrl(src)}" alt="${alt}" class="inline h-5" /></a>`,
  );
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_m, alt, src) =>
      `<img src="${safeUrl(src)}" alt="${alt}" class="inline h-5 mr-1 mb-1" />`,
  );

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_m, text, href) =>
      `<a href="${safeUrl(href)}" target="_blank" rel="noopener noreferrer" class="text-gh-accent underline underline-offset-2 decoration-1 hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent/70 rounded-sm">${text}</a>`,
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
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Repo descriptions are user content: only allow http(s) links */
function safeUrl(escapedUrl: string): string {
  return /^https?:\/\//i.test(escapedUrl.trim()) ? escapedUrl.trim() : '#';
}
