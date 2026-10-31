import { useMemo, useState } from 'react';
import type { RepoInfo } from '../lib/types';

interface Props {
  repos: RepoInfo[];
  excludedRepos: string[];
  onChange: (excluded: string[]) => void;
}

const buttonClass =
  'px-2 py-1 rounded text-xs border border-gh-border text-gh-text-secondary hover:text-gh-text hover:border-gh-accent transition-colors cursor-pointer';

export default function ProjectPicker({ repos, excludedRepos, onChange }: Props) {
  const [filter, setFilter] = useState('');
  const excluded = new Set(excludedRepos);

  const sorted = useMemo(
    () =>
      [...repos].sort(
        (a, b) =>
          Number(a.archived) - Number(b.archived) ||
          b.stars - a.stars ||
          a.name.localeCompare(b.name),
      ),
    [repos],
  );
  const shown = sorted.filter((r) =>
    r.name.toLowerCase().includes(filter.trim().toLowerCase()),
  );

  const toggle = (name: string, enabled: boolean) => {
    const next = new Set(excluded);
    if (enabled) next.delete(name);
    else next.add(name);
    onChange([...next]);
  };

  return (
    <div className='border border-gh-border rounded-lg bg-gh-bg-secondary px-4 py-3'>
      <div className='flex flex-wrap items-center justify-between gap-2 mb-2'>
        <h3 className='text-sm font-semibold text-gh-text'>
          Projects for Markdown
          <span className='ml-2 text-xs font-normal text-gh-text-secondary'>
            {repos.length - excluded.size} of {repos.length}
          </span>
        </h3>
        <div className='flex flex-wrap gap-2'>
          <input
            type='search'
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder='Filter'
            aria-label='Filter projects'
            className='h-7 w-28 rounded border border-gh-border bg-gh-bg px-2 text-xs text-gh-text focus:outline-none focus:ring-1 focus:ring-gh-accent'
          />
          <button type='button' onClick={() => onChange([])} className={buttonClass}>
            Enable all
          </button>
          <button
            type='button'
            onClick={() =>
              onChange(repos.filter((r) => r.archived).map((r) => r.name))
            }
            className={buttonClass}
          >
            Only active
          </button>
          <button
            type='button'
            onClick={() => onChange(repos.map((r) => r.name))}
            className={buttonClass}
          >
            Disable all
          </button>
        </div>
      </div>

      <div className='max-h-44 overflow-auto rounded border border-gh-border bg-gh-bg p-2 space-y-1'>
        {shown.map((repo) => (
          <label
            key={repo.name}
            className='flex items-center justify-between gap-3 text-sm text-gh-text py-1'
          >
            <span className='truncate'>
              {repo.name}
              {repo.archived && (
                <span className='ml-2 text-xs text-gh-text-secondary'>archived</span>
              )}
            </span>
            <span className='inline-flex items-center gap-2 shrink-0'>
              <span className='text-xs text-gh-text-secondary'>
                {repo.techs.length} techs · ★ {repo.stars}
              </span>
              <input
                type='checkbox'
                checked={!excluded.has(repo.name)}
                onChange={(e) => toggle(repo.name, e.target.checked)}
                className='h-4 w-4 rounded border-gh-border bg-gh-bg text-gh-accent focus:ring-gh-accent'
              />
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
