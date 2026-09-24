import { PHASES } from "@/data/cicd/phases";

// Geometría del diagrama ∞ (lemniscata de Gerono). Todo se calcula de forma
// determinista para que el SVG sea idéntico en el servidor y en el navegador.
//
// Con t creciente el recorrido es: PLAN (cruce ↖) → CODE (arriba izq.) →
// BUILD (extremo izq.) → TEST (abajo izq.) → RELEASE (cruce ↗) → DEPLOY →
// OPERATE → MONITOR → PLAN… exactamente como en la diapositiva.

export const INF = { W: 360, H: 212, CX: 180, CY: 106, A: 150, B: 150, SW: 28 } as const;

export const SEG = Math.PI / 4;
const GAP = 0.05;
const HEAD = 0.08;
/** Inicio del segmento PLAN (centrado en el cruce, t = π/2). */
export const START_T = Math.PI / 2 - SEG / 2;

export function infPoint(t: number): [number, number] {
  return [INF.CX + INF.A * Math.cos(t), INF.CY + INF.B * Math.sin(t) * Math.cos(t)];
}

function unitTangent(t: number): [number, number] {
  const dx = -INF.A * Math.sin(t);
  const dy = INF.B * Math.cos(2 * t);
  const l = Math.hypot(dx, dy) || 1;
  return [dx / l, dy / l];
}

const f = (n: number) => n.toFixed(2);

function pathFor(t0: number, t1: number, n = 32): string {
  let d = "";
  for (let i = 0; i <= n; i++) {
    const [x, y] = infPoint(t0 + (t1 - t0) * (i / n));
    d += `${i ? " L" : "M"}${f(x)} ${f(y)}`;
  }
  return d;
}

export type SegmentGeometry = {
  id: string;
  d: string;
  /** Trazo para el texto, invertido cuando el segmento va hacia la izquierda. */
  textD: string;
  /** Posición del texto sobre el trazo (los dos cruces se separan como en la diapositiva). */
  textOffset: string;
  arrow: string;
};

const TEXT_OFFSET: Record<string, string> = { plan: "27%", release: "70%" };

export const SEGMENTS: SegmentGeometry[] = PHASES.map((p, i) => {
  const c = START_T + SEG / 2 + i * SEG;
  const t0 = c - SEG / 2 + GAP;
  const tip = c + SEG / 2 - GAP;
  const t1 = tip - HEAD;
  const d = pathFor(t0, t1);
  const s = Math.sin(c);
  const reverse = s > 0.01 || (Math.abs(s) <= 0.01 && Math.cos(c) < 0);
  const [bx, by] = infPoint(t1);
  const [tx, ty] = unitTangent(t1);
  const w = INF.SW / 2 + 4;
  const [px, py] = infPoint(tip);
  const arrow = `M${f(bx - ty * w)} ${f(by + tx * w)} L${f(px + tx * 2)} ${f(py + ty * 2)} L${f(bx + ty * w)} ${f(by - tx * w)} Z`;
  return {
    id: p.id,
    d,
    textD: reverse ? pathFor(t1, t0) : d,
    textOffset: TEXT_OFFSET[p.id] ?? "50%",
    arrow,
  };
});

export const FULL_PATH = `${pathFor(START_T, START_T + 2 * Math.PI, 192)} Z`;

export function phaseIndexAt(t: number): number {
  const rel = (((t - START_T) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  return Math.floor(rel / SEG) % PHASES.length;
}

export const CI_LABEL: [number, number] = [INF.CX - INF.A * 0.6, INF.CY];
export const CD_LABEL: [number, number] = [INF.CX + INF.A * 0.6, INF.CY];
