/**
 * Deterministic FNV-1a string hash + Mulberry32 PRNG.
 * Guarantees realistic, repeatable numbers for any (destination, date) pair.
 */
export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function createSeededRng(seedKey: string): () => number {
  let state = hashString(seedKey) || 1;
  return function nextRandom(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Rounds VND neatly to nearest step (default 5,000 VND or 10,000 VND)
 */
export function roundToVndStep(value: number, step = 10000): number {
  return Math.round(value / step) * step;
}
