import type { CategoryId } from './catalog';

export type BadgeStyle = 'flat' | 'flat-square' | 'for-the-badge' | 'plastic';
export type ProjectSortMode = 'composite' | 'stars' | 'updated';
export type ProjectGrouping = 'project' | 'skill' | 'none';
export type ProjectLayoutMode = 'list' | 'table';
/** Framework badge suffix: "React (TS)" */
export type FrameworkLanguageMode = 'auto' | 'always' | 'never';

/** How the README looks — remembered across profiles */
export interface MarkdownSettings {
  title: string;
  showIntro: boolean;
  showBadges: boolean;
  badgeStyle: BadgeStyle;
  frameworkLanguage: FrameworkLanguageMode;
  minRepos: number;
  groupBy: ProjectGrouping;
  layout: ProjectLayoutMode;
  sort: ProjectSortMode;
  /** Max projects (per skill when grouped by skill); 0 = all */
  projectLimit: number;
  showStack: boolean;
  showDescription: boolean;
  showStars: boolean;
  showDemo: boolean;
  showTopics: boolean;
  showArchivedBadge: boolean;
  skipArchived: boolean;
  showFooter: boolean;
}

export interface CustomSkill {
  name: string;
  category: CategoryId;
}

/** What goes into the README — remembered per profile */
export interface ProfileSelection {
  hiddenSkills: string[];
  customSkills: CustomSkill[];
  excludedRepos: string[];
}

export const DEFAULT_SETTINGS: MarkdownSettings = {
  title: 'Tech Stack',
  showIntro: false,
  showBadges: true,
  badgeStyle: 'flat-square',
  frameworkLanguage: 'auto',
  minRepos: 1,
  groupBy: 'project',
  layout: 'list',
  sort: 'composite',
  projectLimit: 10,
  showStack: true,
  showDescription: true,
  showStars: true,
  showDemo: true,
  showTopics: false,
  showArchivedBadge: false,
  skipArchived: false,
  showFooter: true,
};

export const EMPTY_SELECTION: ProfileSelection = {
  hiddenSkills: [],
  customSkills: [],
  excludedRepos: [],
};
