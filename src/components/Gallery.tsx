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
        <p className='text-sm text-gh-text-secondary mt-1'>
          See what their public repositories say about their stack.
        </p>
      </div>

      {GALLERY.map((group) => (
        <div key={group.title}>
          <h3 className='text-xs font-semibold text-gh-text-secondary uppercase tracking-wide mb-3'>
            {group.title}
          </h3>
          <ul className='grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'>
            {group.profiles.map((p) => (
              <li key={p.login}>
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
                  className='flex items-center gap-3 p-2.5 rounded-lg border border-gh-border bg-gh-bg-secondary hover:border-gh-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent/70'
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
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
