/**
 * Server-side in-memory TTL cache (default 6 hours = 21,600,000 ms).
 * Preserves fetchedAt timestamp and surfaces `cached: true` on hits.
 */
const DEFAULT_TTL_MS = 6 * 60 * 60 * 1000;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const memoryStore = new Map<string, CacheEntry<unknown>>();

export async function withProviderCache<T extends object>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T & { cached: boolean }> {
  const now = Date.now();
  const hit = memoryStore.get(key) as CacheEntry<T> | undefined;

  if (hit && hit.expiresAt > now) {
    return {
      ...hit.value,
      cached: true,
    };
  }

  const fresh = await fetcher();
  memoryStore.set(key, {
    value: fresh,
    expiresAt: now + ttlMs,
  });

  // Bound memory in long-lived server processes
  if (memoryStore.size > 500) {
    const oldestKey = memoryStore.keys().next().value;
    if (oldestKey) memoryStore.delete(oldestKey);
  }

  return {
    ...fresh,
    cached: false,
  };
}

export function clearProviderCache(): void {
  memoryStore.clear();
}
