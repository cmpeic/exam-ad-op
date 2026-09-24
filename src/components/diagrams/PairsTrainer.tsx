"use client";

import { Fragment, useState } from "react";
import { ArrowLeftRight, Check, Eye, RotateCcw, Trophy, X } from "lucide-react";
import type { PairItem, PairsDiagram } from "@/data/types";
import { newSeed, shuffled } from "@/lib/random";
import { recordDiagram } from "@/lib/progress";

type Mode = "tabla" | "recordar" | "emparejar";

type Game = {
  reverse: boolean;
  queue: { item: PairItem; options: string[] }[];
  idx: number;
  hits: number;
  errors: number;
  answer: { picked: string; ok: boolean } | null;
};

/** Tabla clave → valor (normas, partes, siglas): consultar, recordar y emparejar. */
export function PairsTrainer({ d }: { d: PairsDiagram }) {
  const [mode, setMode] = useState<Mode>("tabla");
  const [shown, setShown] = useState<string[]>([]);
  const [grades, setGrades] = useState<Record<string, boolean>>({});
  const [reverse, setReverse] = useState(false);
  const [game, setGame] = useState<Game | null>(null);
  const [openNote, setOpenNote] = useState<string | null>(null);

  const groups = Array.from(new Set(d.pairs.map((p) => p.group ?? "")));

  const newGame = (rev: boolean) => {
    const seed = newSeed();
    const queue = shuffled(d.pairs, seed).map((item, i) => {
      const answer = rev ? item.key : item.value;
      const others = shuffled(
        d.pairs.filter((p) => p !== item).map((p) => (rev ? p.key : p.value)),
        `${seed}:${i}`,
      ).slice(0, 3);
      return { item, options: shuffled([answer, ...others], `${seed}:o${i}`) };
    });
    setGame({ reverse: rev, queue, idx: 0, hits: 0, errors: 0, answer: null });
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setShown([]);
    setGrades({});
    if (m === "emparejar") newGame(reverse);
    else setGame(null);
  };

  const pick = (opt: string) => {
    if (!game || game.answer) return;
    const { item } = game.queue[game.idx];
    const ok = opt === (game.reverse ? item.key : item.value);
    if (!ok && typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(60);
    setGame({ ...game, hits: game.hits + (ok ? 1 : 0), errors: game.errors + (ok ? 0 : 1), answer: { picked: opt, ok } });
  };

  const nextItem = () => {
    if (!game) return;
    const idx = game.idx + 1;
    setGame({ ...game, idx, answer: null });
    if (idx >= game.queue.length) {
      recordDiagram(d.slug, (x) => ({
        ...x,
        orderDone: (x.orderDone ?? 0) + 1,
        orderBest: Math.min(x.orderBest ?? Infinity, game.errors),
      }));
    }
  };

  const finished = game !== null && game.idx >= game.queue.length;
  const current = game && !finished ? game.queue[game.idx] : null;
  const known = Object.values(grades).filter(Boolean).length;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Modo de práctica">
        {(
          [
            { id: "tabla", label: "Tabla" },
            { id: "recordar", label: "Recordar" },
            { id: "emparejar", label: "Emparejar" },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => switchMode(m.id)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              mode === m.id ? "border-primary bg-primary text-bg" : "border-line bg-surface-2 text-muted"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="mb-4 text-sm text-muted">
        {mode === "tabla" && `Consulta cada ${d.keyLabel.toLowerCase()} y su ${d.valueLabel.toLowerCase()}. Toca una fila para ver más.`}
        {mode === "recordar" && `Di el ${d.valueLabel.toLowerCase()} de memoria, revela y marca si lo sabías.`}
        {mode === "emparejar" && "Elige la opción correcta para cada una. Puedes invertir la dirección."}
      </p>

      {(mode === "tabla" || mode === "recordar") && (
        <div>
          {mode === "recordar" && (
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-muted">
                Lo sabía: <strong className="text-ok">{known}</strong> / {d.pairs.length}
              </span>
              <button type="button" onClick={() => setShown(d.pairs.map((p) => p.key))} className="inline-flex items-center gap-1 text-xs text-faint">
                <Eye className="size-3.5" aria-hidden /> Revelar todo
              </button>
            </div>
          )}
          {groups.map((g) => (
            <Fragment key={g || "all"}>
              {g && <h3 className="mt-4 mb-2 text-xs font-semibold tracking-wider text-accent uppercase">{g}</h3>}
              <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface/80">
                {d.pairs
                  .filter((p) => (p.group ?? "") === g)
                  .map((p) => {
                    const hidden = mode === "recordar" && !shown.includes(p.key);
                    const graded = grades[p.key];
                    return (
                      <li key={p.key} className="flex items-start gap-3 px-4 py-3">
                        <span className="w-[6.5rem] shrink-0 font-mono text-[13px] font-semibold text-ink">{p.key}</span>
                        <div className="min-w-0 flex-1">
                          {hidden ? (
                            <button type="button" onClick={() => setShown((s) => [...s, p.key])} className="text-sm text-faint">
                              ¿? Toca para revelar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setOpenNote(openNote === p.key ? null : p.key)}
                              className="block text-left text-sm text-muted"
                            >
                              {p.value}
                              {p.note && <span className="ml-1 text-accent">ⓘ</span>}
                            </button>
                          )}
                          {openNote === p.key && p.note && !hidden && (
                            <p className="mt-1 animate-fade-up text-xs text-accent">{p.note}</p>
                          )}
                        </div>
                        {mode === "recordar" && !hidden && graded === undefined && (
                          <span className="flex shrink-0 gap-1.5">
                            <button type="button" aria-label="Lo sabía" onClick={() => setGrades((x) => ({ ...x, [p.key]: true }))} className="grid size-8 place-items-center rounded-xl bg-ok/15 text-ok">
                              <Check className="size-4" aria-hidden />
                            </button>
                            <button type="button" aria-label="No lo sabía" onClick={() => setGrades((x) => ({ ...x, [p.key]: false }))} className="grid size-8 place-items-center rounded-xl bg-bad/15 text-bad">
                              <X className="size-4" aria-hidden />
                            </button>
                          </span>
                        )}
                        {mode === "recordar" && graded !== undefined && (
                          graded ? <Check className="size-4 shrink-0 text-ok" aria-label="lo sabía" /> : <X className="size-4 shrink-0 text-bad" aria-label="no lo sabía" />
                        )}
                      </li>
                    );
                  })}
              </ul>
            </Fragment>
          ))}
        </div>
      )}

      {mode === "emparejar" && (
        <button
          type="button"
          onClick={() => {
            setReverse(!reverse);
            newGame(!reverse);
          }}
          className="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-xs text-muted"
        >
          <ArrowLeftRight className="size-3.5" aria-hidden />
          {reverse ? `${d.valueLabel} → ${d.keyLabel}` : `${d.keyLabel} → ${d.valueLabel}`} (cambiar)
        </button>
      )}

      {current && game && (
        <div className="rounded-3xl border border-line bg-surface/80 p-4">
          <div className="flex items-center justify-between text-xs text-faint">
            <span>
              {game.idx + 1} de {game.queue.length}
            </span>
            <span>
              <span className="text-ok">{game.hits} ✓</span> · <span className="text-bad">{game.errors} ✗</span>
            </span>
          </div>
          <p className="mt-3 text-center font-display text-2xl leading-snug font-semibold text-ink">
            {game.reverse ? current.item.value : current.item.key}
          </p>
          <div className="mt-4 grid gap-2">
            {current.options.map((opt) => {
              const right = opt === (game.reverse ? current.item.key : current.item.value);
              let cls = "border-line bg-surface-2 text-ink";
              if (game.answer) {
                if (right) cls = "border-ok bg-ok/15 text-ink ring-1 ring-ok/50";
                else if (game.answer.picked === opt) cls = "border-bad bg-bad/15 text-ink";
                else cls = "border-line bg-surface-2 text-muted opacity-55";
              }
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={!!game.answer}
                  onClick={() => pick(opt)}
                  className={`flex items-center gap-2 rounded-2xl border px-3.5 py-3 text-left text-[15px] transition active:scale-[0.99] ${cls}`}
                >
                  <span className="flex-1">{opt}</span>
                  {game.answer && right && <Check className="size-4 text-ok" aria-hidden />}
                  {game.answer && !right && game.answer.picked === opt && <X className="size-4 text-bad" aria-hidden />}
                </button>
              );
            })}
          </div>
          {game.answer && (
            <div
              role="status"
              className={`mt-3 animate-pop rounded-2xl border p-3 text-sm ${
                game.answer.ok ? "border-ok/40 bg-ok/10" : "border-bad/40 bg-bad/10"
              }`}
            >
              <div className={`font-semibold ${game.answer.ok ? "text-ok" : "text-bad"}`}>
                {game.answer.ok ? "¡Correcto!" : `Era: ${game.reverse ? current.item.key : current.item.value}`}
              </div>
              <p className="mt-1 text-xs text-muted">
                {current.item.key} = {current.item.value}
                {current.item.note ? ` · ${current.item.note}` : ""}
              </p>
              <button type="button" onClick={nextItem} className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-bg">
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {finished && game && (
        <div className="animate-pop rounded-3xl border border-line bg-surface/80 p-5 text-center">
          <Trophy className={`mx-auto size-8 ${game.errors === 0 ? "text-warn" : "text-muted"}`} aria-hidden />
          <p className="mt-2 font-display text-xl font-semibold text-ink">
            {game.hits} de {game.queue.length} correctas
          </p>
          <p className="mt-1 text-sm text-muted">
            {game.errors === 0 ? "¡Perfecto!" : "Repite hasta hacerlo sin errores."}
          </p>
          <button type="button" onClick={() => newGame(game.reverse)} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 font-semibold text-bg">
            <RotateCcw className="size-4" aria-hidden /> Otra vez
          </button>
        </div>
      )}
    </div>
  );
}
