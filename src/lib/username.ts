/** Parse username from input (handles full GitHub URLs and @handles) */
export function parseUsername(input: string): string {
  const raw = input.trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (url.hostname.toLowerCase().replace(/^www\./, '') === 'github.com') {
      return url.pathname.split('/').filter(Boolean)[0] ?? '';
    }
  } catch {
    // Not a URL — treat as username
  }
  return raw.replace(/^@/, '').split('/')[0] ?? '';
}
