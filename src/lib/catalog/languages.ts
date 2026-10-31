import type { TechDef } from './types';

export const JS_TS = ['TypeScript', 'JavaScript'] as const;
export const JVM = ['Java', 'Kotlin', 'Scala'] as const;
export const DOTNET = ['C#', 'F#', 'Visual Basic .NET'] as const;

const lang = (
  name: string,
  badge?: TechDef['badge'],
  linguist?: string[],
): TechDef => ({
  name,
  category: 'languages',
  linguist: linguist ?? [name],
  badge,
});

/**
 * Programming languages come only from GitHub linguist data (primary language
 * + byte breakdown) — never from topics or descriptions, which is where words
 * like "go" or "java" leak in from unrelated text.
 */
export const LANGUAGES: TechDef[] = [
  lang('TypeScript', ['3178C6', 'typescript', 'ffffff']),
  lang('JavaScript', ['F7DF1E', 'javascript', '000000']),
  lang('Python', ['3776AB', 'python', 'ffffff'], ['Python', 'Cython']),
  lang('Go', ['00ADD8', 'go', 'ffffff']),
  lang('Rust', ['CE422B', 'rust', 'ffffff']),
  lang('Java', ['ED8B00', 'openjdk', 'ffffff']),
  lang('Kotlin', ['7F52FF', 'kotlin', 'ffffff']),
  lang('Scala', ['DC322F', 'scala', 'ffffff']),
  lang('C#', ['512BD4', 'dotnet', 'ffffff']),
  lang('F#', ['378BBA', 'fsharp', 'ffffff']),
  lang('Visual Basic .NET', ['512BD4', 'dotnet', 'ffffff']),
  lang('C', ['A8B9CC', 'c', '000000']),
  lang('C++', ['00599C', 'cplusplus', 'ffffff']),
  lang('Objective-C', ['438EFF', 'apple', 'ffffff'], [
    'Objective-C',
    'Objective-C++',
  ]),
  lang('Swift', ['FA7343', 'swift', 'ffffff']),
  lang('Dart', ['0175C2', 'dart', 'ffffff']),
  lang('Ruby', ['CC342D', 'ruby', 'ffffff']),
  lang('PHP', ['777BB4', 'php', 'ffffff']),
  lang('Elixir', ['4B275F', 'elixir', 'ffffff']),
  lang('Erlang', ['A90533', 'erlang', 'ffffff']),
  lang('Haskell', ['5D4F85', 'haskell', 'ffffff']),
  lang('OCaml', ['EC6813', 'ocaml', 'ffffff']),
  lang('Clojure', ['5881D8', 'clojure', 'ffffff']),
  lang('Lua', ['2C2D72', 'lua', 'ffffff']),
  lang('Perl', ['39457E', 'perl', 'ffffff']),
  lang('R', ['276DC3', 'r', 'ffffff']),
  lang('Julia', ['9558B2', 'julia', 'ffffff']),
  lang('Zig', ['F7A41D', 'zig', '000000']),
  lang('Nim', ['FFE953', 'nim', '000000']),
  lang('Solidity', ['363636', 'solidity', 'ffffff']),
  lang('Assembly', ['654FF0', 'assemblyscript', 'ffffff']),
  lang('Shell', ['4EAA25', 'gnubash', 'ffffff']),
  lang('PowerShell', ['5391FE', 'powershell', 'ffffff']),
  lang('SQL', ['336791', 'postgresql', 'ffffff'], [
    'SQL',
    'PLpgSQL',
    'TSQL',
    'PLSQL',
  ]),
];

/**
 * Linguist names that are configuration, markup, or build glue — they say
 * nothing about a developer's skills.
 */
export const IGNORED_LINGUIST = new Set([
  'Makefile',
  'Batchfile',
  'Procfile',
  'Roff',
  'Text',
  'JSON',
  'YAML',
  'TOML',
  'XML',
  'Markdown',
  'MDX',
  'GitHub Actions Workflow',
  'Smarty',
  'Jinja',
  'Mustache',
  'Handlebars',
  'EJS',
  'Nunjucks',
  'Twig',
  'Blade',
  'Starlark',
  'CMake',
  'M4',
]);
