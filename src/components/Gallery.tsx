import { GALLERY, galleryAvatar } from '../lib/gallery';

interface Props {
  onSelect: (login: string) => void;
  disabled?: boolean;
}

export default function Gallery({ onSelect, disabled = false }: Props) {
  const base = (typeof window !== 'undefined' && window.__BASE_URL__) || '/';

  return (
    <section
      aria-labelledby='gallery-heading'
      className='w-full max-w-5xl mx-auto px-4 py-10 space-y-8'
    >
      <div className='text-center'>
        <h2 id='gallery-heading' className='text-xl font-semibold text-gh-text'>
          Explore famous developers
        </h2>
      </div>

      {GALLERY.map((group) => (
        <div key={group.title}>
          <h3
            className={`text-xs font-semibold text-gh-text-secondary uppercase tracking-wide mb-3 ${group.centered ? 'text-center' : ''}`}
          >
            {group.title}
          </h3>
          <ul
            className={
              group.centered
                ? 'flex flex-wrap justify-center gap-2 [&>li]:w-full [&>li]:max-w-xs'
                : 'grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'
            }
          >
            {group.profiles.map((p) => (
              <li
                key={p.login}
                className='flex flex-col rounded-lg border border-gh-border bg-gh-bg-secondary hover:border-gh-accent transition-colors'
              >
                <a
                  href={`${base}${p.login}`.replace(/\/+/g, '/')}
                  onClick={(e) => {
                    // Keep modifier-clicks as normal links (new tab)
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) {
                      return;
                    }
                    e.preventDefault();
                    if (!disabled) onSelect(p.login);
                  }}
                  aria-disabled={disabled}
                  className='flex flex-1 items-center gap-3 p-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent/70'
                >
                  <img
                    src={galleryAvatar(p.login)}
                    alt=''
                    width={40}
                    height={40}
                    loading='lazy'
                    className='w-10 h-10 rounded-full border border-gh-border shrink-0'
                  />
                  <span className='min-w-0'>
                    <span className='block text-sm font-medium text-gh-text truncate'>
                      {p.name}
                    </span>
                    <span className='block text-xs text-gh-text-secondary truncate'>
                      {p.tagline}
                    </span>
                  </span>
                </a>
                {(p.youtube || p.link) && (
                  <div className='flex flex-wrap gap-x-3 px-2.5 pb-2 -mt-1 pl-[3.875rem] text-xs'>
                    {p.youtube && (
                      <a
                        href={p.youtube.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-gh-text-secondary hover:text-gh-red'
                        aria-label={`${p.name} on YouTube, ${p.youtube.subscribers} subscribers`}
                      >
                        ▶ YouTube · {p.youtube.subscribers}
                      </a>
                    )}
                    {p.link && (
                      <a
                        href={p.link.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-gh-text-secondary hover:text-gh-accent'
                      >
                        {p.link.label} ↗
                      </a>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
