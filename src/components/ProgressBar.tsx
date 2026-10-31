import type { ScanProgress } from '../lib/github';

interface Props {
  progress: ScanProgress;
}

const PHASES: Record<ScanProgress['phase'], { label: string; weight: number }> = {
  user: { label: 'Fetching user profile…', weight: 5 },
  repos: { label: 'Loading repositories…', weight: 10 },
  languages: { label: 'Reading language breakdowns', weight: 30 },
  trees: { label: 'Reading file trees', weight: 25 },
  manifests: { label: 'Reading dependency manifests', weight: 25 },
  analyzing: { label: 'Analyzing skills…', weight: 5 },
};
const ORDER = Object.keys(PHASES) as ScanProgress['phase'][];
const TOTAL = ORDER.reduce((sum, p) => sum + PHASES[p].weight, 0);

export default function ProgressBar({ progress }: Props) {
  const index = ORDER.indexOf(progress.phase);
  const before = ORDER.slice(0, index).reduce((s, p) => s + PHASES[p].weight, 0);
  const within =
    progress.current && progress.total ? progress.current / progress.total : 0;
  const percentage = Math.round(
    ((before + PHASES[progress.phase].weight * within) / TOTAL) * 100,
  );

  let label = PHASES[progress.phase].label;
  if (progress.current && progress.total) {
    label += ` (${progress.current}/${progress.total})`;
  }

  return (
    <div className='w-full max-w-xl mx-auto mt-6'>
      <div className='flex justify-between text-sm text-gh-text-secondary mb-1'>
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div
        className='w-full bg-gh-bg-secondary rounded-full h-2 overflow-hidden border border-gh-border'
        role='progressbar'
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className='h-full bg-gh-accent rounded-full transition-all duration-300'
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
