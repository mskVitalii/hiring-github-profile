import { useState, type FormEvent, type ReactNode } from 'react';
import { CATALOG, CATEGORIES, findTech, type CategoryId } from '../lib/catalog';
import {
  DEFAULT_SETTINGS,
  type CustomSkill,
  type MarkdownSettings,
} from '../lib/settings';

interface Props {
  settings: MarkdownSettings;
  onChange: (next: MarkdownSettings) => void;
  customSkills: CustomSkill[];
  onCustomSkillsChange: (next: CustomSkill[]) => void;
}

const inputClass =
  'h-7 rounded border border-gh-border bg-gh-bg px-2 text-xs text-gh-text focus:outline-none focus:ring-1 focus:ring-gh-accent';
const selectClass = `${inputClass} gh-select`;
const checkboxClass =
  'h-4 w-4 rounded border-gh-border bg-gh-bg text-gh-accent focus:ring-gh-accent';

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className='space-y-2'>
      <legend className='text-xs font-semibold text-gh-text uppercase tracking-wide mb-1'>
        {title}
      </legend>
      <div className='flex flex-wrap items-center gap-x-4 gap-y-2'>
        {children}
      </div>
    </fieldset>
  );
}

export default function CustomizePanel({
  settings,
  onChange,
  customSkills,
  onCustomSkillsChange,
}: Props) {
  const [newSkill, setNewSkill] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryId | ''>('');

  const set = <K extends keyof MarkdownSettings>(
    key: K,
    value: MarkdownSettings[K],
  ) => onChange({ ...settings, [key]: value });

  const toggle = (key: keyof MarkdownSettings, label: string) => (
    <label className='inline-flex items-center gap-2 text-xs text-gh-text-secondary select-none'>
      <input
        type='checkbox'
        checked={Boolean(settings[key])}
        onChange={(e) => set(key, e.target.checked as never)}
        className={checkboxClass}
      />
      {label}
    </label>
  );

  const select = <K extends keyof MarkdownSettings>(
    key: K,
    label: string,
    options: [MarkdownSettings[K], string][],
  ) => (
    <label className='inline-flex items-center gap-2 text-xs text-gh-text-secondary select-none'>
      {label}
      <select
        value={String(settings[key])}
        onChange={(e) => {
          const picked = options.find(([v]) => String(v) === e.target.value);
          if (picked) set(key, picked[0]);
        }}
        className={selectClass}
      >
        {options.map(([value, text]) => (
          <option key={String(value)} value={String(value)}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );

  const addCustomSkill = (e: FormEvent) => {
    e.preventDefault();
    const name = newSkill.trim();
    if (!name) return;
    const known = findTech(name);
    const category = newCategory || known?.category || 'other';
    const next = customSkills.filter(
      (s) => s.name.toLowerCase() !== name.toLowerCase(),
    );
    onCustomSkillsChange([...next, { name: known?.name ?? name, category }]);
    setNewSkill('');
    setNewCategory('');
  };

  const projectsEnabled = settings.groupBy !== 'none';

  return (
    <div className='border border-gh-border rounded-lg bg-gh-bg-secondary px-4 py-4 space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-semibold text-gh-text'>Customize README</h3>
        <button
          type='button'
          onClick={() => onChange(DEFAULT_SETTINGS)}
          className='px-2 py-1 rounded text-xs border border-gh-border text-gh-text-secondary hover:text-gh-text hover:border-gh-accent cursor-pointer'
        >
          Reset
        </button>
      </div>

      <Group title='Header'>
        <label className='inline-flex items-center gap-2 text-xs text-gh-text-secondary'>
          Title
          <input
            type='text'
            value={settings.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder='No title'
            className={`${inputClass} w-40`}
          />
        </label>
        {toggle('showIntro', 'Name & bio')}
        {toggle('showFooter', 'Footer credit')}
      </Group>

      <Group title='Skill badges'>
        {toggle('showBadges', 'Show')}
        {select('badgeStyle', 'Style', [
          ['flat-square', 'Flat square'],
          ['flat', 'Flat'],
          ['for-the-badge', 'For the badge'],
          ['plastic', 'Plastic'],
        ])}
        {select('frameworkLanguage', 'Language suffix', [
          ['auto', 'Auto — React (TS)'],
          ['always', 'Always — Django (Python)'],
          ['never', 'Never'],
        ])}
        {select('minRepos', 'Min repos', [
          [1, '1+'],
          [2, '2+'],
          [3, '3+'],
          [5, '5+'],
        ])}
      </Group>

      <Group title='Projects'>
        {select('groupBy', 'Group', [
          ['project', 'Each project once'],
          ['skill', 'Under each skill'],
          ['none', 'Hide projects'],
        ])}
        {projectsEnabled && (
          <>
            {select('layout', 'Layout', [
              ['list', 'List'],
              ['table', 'Table'],
            ])}
            {select('sort', 'Sort', [
              ['composite', 'Demo → Stars → Date'],
              ['stars', 'Stars'],
              ['updated', 'Last push'],
            ])}
            {select('projectLimit', 'Limit', [
              [5, '5'],
              [10, '10'],
              [20, '20'],
              [0, 'All'],
            ])}
          </>
        )}
      </Group>

      {projectsEnabled && (
        <Group title='Project details'>
          {settings.groupBy === 'project' && toggle('showStack', 'Stack')}
          {toggle('showDescription', 'Description')}
          {toggle('showStars', 'Stars')}
          {toggle('showDemo', 'Demo link')}
          {toggle('showTopics', 'Topics')}
          {toggle('showArchivedBadge', 'Archived badge')}
          {toggle('skipArchived', 'Skip archived repos')}
        </Group>
      )}

      <Group title='Add a skill'>
        <form onSubmit={addCustomSkill} className='flex flex-wrap items-center gap-2'>
          <input
            type='text'
            list='catalog-skills'
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder='e.g. Kafka, Figma'
            aria-label='Skill name'
            className={`${inputClass} w-40`}
          />
          <datalist id='catalog-skills'>
            {CATALOG.map((t) => (
              <option key={t.name} value={t.name} />
            ))}
          </datalist>
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as CategoryId | '')}
            aria-label='Skill category'
            className={selectClass}
          >
            <option value=''>Auto category</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type='submit'
            disabled={!newSkill.trim()}
            className='px-2 py-1 rounded text-xs border border-gh-border text-gh-text hover:border-gh-accent disabled:opacity-40 cursor-pointer'
          >
            Add
          </button>
        </form>
        {customSkills.map((skill) => (
          <span
            key={skill.name}
            className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-gh-accent/60 text-gh-text'
          >
            {skill.name}
            <button
              type='button'
              aria-label={`Remove ${skill.name}`}
              onClick={() =>
                onCustomSkillsChange(customSkills.filter((s) => s !== skill))
              }
              className='text-gh-text-secondary hover:text-gh-red cursor-pointer'
            >
              ×
            </button>
          </span>
        ))}
      </Group>
    </div>
  );
}
