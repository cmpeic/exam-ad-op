"use client";

import { useState } from "react";
import type { FlowStep } from "@/data/types";

/** Pirámide de niveles de capacidad (Diap. 28): el nivel 0 es la base y el 5 la punta. */
export function SpicePyramid({ steps }: { steps: FlowStep[] }) {
  const [sel, setSel] = useState(steps.length - 1);
  const levels = steps.map((s, i) => ({ ...s, n: i })).reverse();
  const n = steps.length;
  const current = steps[sel];
  return (
    <div className="rounded-3xl border border-line bg-surface/80 p-4">
      <div className="font-display text-lg font-semibold text-ink">Toca un nivel de la pirámide</div>
      <div className="mt-4 flex flex-col items-center gap-1">
        {levels.map((l) => {
          const width = 30 + (70 * (n - l.n)) / n;
          const active = l.n === sel;
          return (
            <button
              key={l.id}
              type="button"
              aria-pressed={active}
              onClick={() => setSel(l.n)}
              className={`relative grid h-11 place-items-center text-sm font-semibold transition ${active ? "scale-[1.03]" : "opacity-80"}`}
              style={{
                width: `${width}%`,
                background: active ? l.color : `${l.color}40`,
                color: active ? "#07070d" : "var(--color-ink)",
                clipPath: "polygon(6% 0, 94% 0, 100% 100%, 0 100%)",
              }}
            >
              <span className="truncate px-4">
                {l.n} · {l.label}
              </span>
            </button>
          );
        })}
      </div>
      <div
        key={current.id}
        className="mt-4 animate-fade-up rounded-2xl border p-3"
        style={{ borderColor: `${current.color}66`, background: `${current.color}14` }}
      >
        <div className="font-semibold text-ink">
          Nivel {sel} · {current.label}
        </div>
        {current.sub && <div className="text-sm text-accent">{current.sub}</div>}
        <p className="mt-1 text-sm text-muted">{current.detail}</p>
      </div>
      <p className="mt-3 text-center text-xs text-faint">A mayor nivel, mayor capacidad del proceso ↑</p>
    </div>
  );
}
