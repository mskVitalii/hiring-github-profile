import { getCategory } from '../lib/catalog';
import { skillLabel } from '../lib/markdown';
import type { FrameworkLanguageMode } from '../lib/settings';
import type { SkillCategory, TechSource } from '../lib/types';

interface Props {
  categories: SkillCategory[];
  hiddenSkills: string[];
  /** Skills that pass hidden/min-repos/excluded-repos filters */
  visibleSkills: Set<string>;
  frameworkLanguage: FrameworkLanguageMode;
  onToggle: (skillName: string) => void;
}

const SOURCE_LABELS: Record<TechSource, string> = {
  manifest: 'dependencies',
  language: 'code languages',
  files: 'config files',
  compose: 'docker compose',
  topic: 'repo topics',
  description: 'repo description',
  implied: 'related tech',
};

export default function SkillsList({
  categories,
  hiddenSkills,
  visibleSkills,
  frameworkLanguage,
  onToggle,
}: Props) {
  const hidden = new Set(hiddenSkills.map((s) => s.toLowerCase()));

  return (
    <div className='w-full max-w-3xl mx-auto space-y-4'>
      <p className='text-xs text-gh-text-secondary'>
        Click a skill to remove it from the README. Dimmed skills are filtered
        out by your settings.
      </p>
      {categories.map((category) => (
        <div key={category.id}>
          <h3 className='text-xs font-semibold text-gh-text-secondary uppercase tracking-wide mb-2'>
            {`${getCategory(category.id).emoji} ${category.name}`}
          </h3>
          <div className='flex flex-wrap gap-1.5'>
            {category.skills.map((skill) => {
              const isHidden = hidden.has(skill.name.toLowerCase());
              const isFiltered = !isHidden && !visibleSkills.has(skill.name);
              const via = skill.sources.map((s) => SOURCE_LABELS[s]).join(', ');
              return (
                <button
                  key={skill.name}
                  type='button'
                  onClick={() => onToggle(skill.name)}
                  aria-pressed={!isHidden}
                  title={`${skill.repos.length} repo(s) · detected via ${via}\n${skill.repos.slice(0, 8).join(', ')}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors cursor-pointer ${
                    isHidden
                      ? 'border-dashed border-gh-border text-gh-text-secondary line-through opacity-60'
                      : isFiltered
                        ? 'border-gh-border bg-gh-bg-secondary text-gh-text-secondary opacity-60'
                        : 'border-gh-border bg-gh-bg-secondary text-gh-text hover:border-gh-accent hover:text-gh-accent'
                  }`}
                >
                  {skillLabel(skill, frameworkLanguage)}
                  <span className='text-xs text-gh-text-secondary'>
                    {skill.repos.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
