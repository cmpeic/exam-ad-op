const COLORS = ["#2dd4bf", "#34d399", "#a3e635", "#fbbf24", "#fb923c", "#f87171"];
const LABELS = ["5 Optimización", "4 Predecible", "3 Establecido", "2 Gestionado", "1 Realizado", "0 Incompleto"];

/** Pirámide SPICE decorativa para la portada de la materia Calidad. */
export function PyramidMini({ className = "" }: { className?: string }) {
  const W = 320;
  const H = 210;
  const rowH = H / 6;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden>
      {COLORS.map((c, i) => {
        const top = i * rowH;
        const halfTop = 18 + (i * (W / 2 - 18)) / 6;
        const halfBottom = 18 + ((i + 1) * (W / 2 - 18)) / 6;
        const cx = W / 2;
        const points = `${cx - halfTop},${top + 1.5} ${cx + halfTop},${top + 1.5} ${cx + halfBottom},${top + rowH - 1.5} ${cx - halfBottom},${top + rowH - 1.5}`;
        return (
          <g key={c}>
            <polygon points={points} fill={c} opacity={0.9} />
            <text x={cx} y={top + rowH / 2} dy="0.35em" textAnchor="middle" fontSize={i < 2 ? 9 : 11} fontWeight={700} fill="#07070d">
              {LABELS[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
