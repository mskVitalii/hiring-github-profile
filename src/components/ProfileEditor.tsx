import { useMemo } from 'react';
import { generateMarkdown, visibleCategories } from '../lib/markdown';
import {
  DEFAULT_SETTINGS,
  EMPTY_SELECTION,
  type MarkdownSettings,
  type ProfileSelection,
} from '../lib/settings';
import type { ScanResult } from '../lib/types';
import CustomizePanel from './CustomizePanel';
import MarkdownPreview from './MarkdownPreview';
import ProjectPicker from './ProjectPicker';
import SkillsList from './SkillsList';
import { usePersistentState } from './usePersistentState';

interface Props {
  result: ScanResult;
}

/** Skills, customization and README preview for one scanned profile */
export default function ProfileEditor({ result }: Props) {
  const [settings, setSettings] = usePersistentState<MarkdownSettings>(
    'hgp_settings_v2',
    DEFAULT_SETTINGS,
  );
  const [selection, setSelection] = usePersistentState<ProfileSelection>(
    `hgp_profile_v2_${result.user.login.toLowerCase()}`,
    EMPTY_SELECTION,
  );

  const updateSelection = (patch: Partial<ProfileSelection>) =>
    setSelection((prev) => ({ ...prev, ...patch }));

  const toggleSkill = (name: string) => {
    const key = name.toLowerCase();
    const hidden = selection.hiddenSkills.some((s) => s.toLowerCase() === key);
    updateSelection({
      hiddenSkills: hidden
        ? selection.hiddenSkills.filter((s) => s.toLowerCase() !== key)
        : [...selection.hiddenSkills, name],
    });
  };

  const visibleSkills = useMemo(
    () =>
      new Set(
        visibleCategories(result, settings, selection).flatMap((c) =>
          c.skills.map((s) => s.name),
        ),
      ),
    [result, selection, settings],
  );

  const markdown = useMemo(
    () => generateMarkdown(result, settings, selection),
    [result, selection, settings],
  );

  return (
    <div className='w-full max-w-3xl mx-auto space-y-6'>
      <SkillsList
        categories={result.categories}
        hiddenSkills={selection.hiddenSkills}
        visibleSkills={visibleSkills}
        frameworkLanguage={settings.frameworkLanguage}
        onToggle={toggleSkill}
      />
      <CustomizePanel
        settings={settings}
        onChange={setSettings}
        customSkills={selection.customSkills}
        onCustomSkillsChange={(customSkills) => updateSelection({ customSkills })}
      />
      <ProjectPicker
        repos={result.repos}
        excludedRepos={selection.excludedRepos}
        onChange={(excludedRepos) => updateSelection({ excludedRepos })}
      />
      <MarkdownPreview
        markdown={markdown}
        login={result.user.login}
        analytics={{
          group_by: settings.groupBy,
          project_layout: settings.layout,
          project_sort_mode: settings.sort,
          badge_style: settings.badgeStyle,
          hidden_skills_count: selection.hiddenSkills.length,
          custom_skills_count: selection.customSkills.length,
          selected_projects_count:
            result.repos.length - selection.excludedRepos.length,
        }}
      />
    </div>
  );
}
