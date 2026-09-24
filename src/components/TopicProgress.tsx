"use client";

import { Check } from "lucide-react";
import { setCheck, useProgress } from "@/lib/progress";
import { topicChecksDone } from "@/lib/stats";

/** Insignia de avance del checklist de un tema (lista de temas). */
export function TopicBadge({ slug, total }: { slug: string; total: number }) {
  const p = useProgress();
  const done = topicChecksDone(p, slug, total);
  if (done === total) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-ok/15 px-2 py-0.5 text-[11px] font-semibold text-ok">
        <Check className="size-3" strokeWidth={3} aria-hidden /> Dominado
      </span>
    );
  }
  return (
    <span className="rounded-full bg-surface-3 px-2 py-0.5 font-mono text-[11px] text-muted">
      {done}/{total}
    </span>
  );
}

/** Checklist de autoevaluación "puedo…" de cada tema. */
export function TopicChecklist({ slug, items }: { slug: string; items: string[] }) {
  const p = useProgress();
  const done = topicChecksDone(p, slug, items.length);
  return (
    <div className="rounded-3xl border border-line bg-surface/80 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-ink">¿Lo tienes? Marca lo que ya puedes hacer</div>
        <span className={`font-mono text-xs ${done === items.length ? "text-ok" : "text-faint"}`}>
          {done}/{items.length}
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((it, i) => {
          const key = `${slug}:${i}`;
          const on = !!p.checks[key];
          return (
            <li key={key}>
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => setCheck(key, !on)}
                className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left text-sm transition ${
                  on ? "border-ok/40 bg-ok/8 text-ink" : "border-line bg-surface-2 text-muted"
                }`}
              >
                <span
                  className={`mt-px grid size-5 shrink-0 place-items-center rounded-md border-2 transition ${
                    on ? "border-ok bg-ok text-bg" : "border-line-strong"
                  }`}
                >
                  {on && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
                </span>
                {it}
              </button>
            </li>
          );
        })}
      </ul>
      {done === items.length && (
        <p className="mt-3 animate-pop text-center text-sm font-medium text-ok">¡Tema dominado! 🎉</p>
      )}
    </div>
  );
}
