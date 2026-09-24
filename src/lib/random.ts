// Barajado determinista: con la misma semilla produce el mismo orden en el
// servidor y en el navegador (evita desajustes de hidratación).

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffled<T>(items: readonly T[], seed: string): T[] {
  const rnd = mulberry32(hashString(seed));
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Baraja índices 0..n-1 garantizando que no quede en el orden correcto. */
export function shuffledIndexes(n: number, seed: string): number[] {
  const base = Array.from({ length: n }, (_, i) => i);
  const out = shuffled(base, seed);
  if (n > 1 && out.every((v, i) => v === i)) out.push(out.shift()!);
  return out;
}

/** Solo en manejadores de eventos: nunca durante el render. */
export function newSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}
