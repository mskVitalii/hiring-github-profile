import { useEffect, useState } from 'react';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    // Merge objects so settings added later get their defaults
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? { ...fallback, ...parsed }
      : parsed;
  } catch {
    return fallback;
  }
}

/** useState backed by localStorage; re-reads when `key` changes */
export function usePersistentState<T>(key: string, fallback: T) {
  const [state, setState] = useState<T>(() => read(key, fallback));
  const [loadedKey, setLoadedKey] = useState(key);

  if (loadedKey !== key) {
    setLoadedKey(key);
    setState(read(key, fallback));
  }

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // storage unavailable — keep working in memory
    }
  }, [key, state]);

  return [state, setState] as const;
}
