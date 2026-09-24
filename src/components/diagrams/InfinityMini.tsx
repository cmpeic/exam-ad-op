import { PHASES } from "@/data/cicd/phases";
import { CD_LABEL, CI_LABEL, FULL_PATH, INF, SEGMENTS } from "@/lib/infinity";

/** ∞ decorativo con un "paquete" que recorre el ciclo (SVG puro, sin JS). */
export function InfinityMini({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${INF.W} ${INF.H}`} className={className} aria-hidden>
      {SEGMENTS.map((s, i) => (
        <g key={s.id}>
          <path d={s.d} stroke={PHASES[i].color} strokeWidth={INF.SW} fill="none" />
          <path d={s.arrow} fill={PHASES[i].color} />
        </g>
      ))}
      <text x={CI_LABEL[0]} y={CI_LABEL[1]} dy="0.35em" textAnchor="middle" className="fill-ink font-display" fontSize={30} fontWeight={700}>
        CI
      </text>
      <text x={CD_LABEL[0]} y={CD_LABEL[1]} dy="0.35em" textAnchor="middle" className="fill-ink font-display" fontSize={30} fontWeight={700}>
        CD
      </text>
      <g className="motion-reduce:hidden">
        <circle r={7} fill="#fff" style={{ filter: "drop-shadow(0 0 6px #fff)" }}>
          <animateMotion dur="9s" repeatCount="indefinite" path={FULL_PATH} />
        </circle>
      </g>
    </svg>
  );
}
