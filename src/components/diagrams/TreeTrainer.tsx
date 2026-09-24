"use client";

import { useState } from "react";
import { Check, ChevronDown, Eye, EyeOff, RotateCcw, Trophy, X } from "lucide-react";
import type { TreeDiagram, TreeLeaf } from "@/data/types";
import { newSeed, shuffled } from "@/lib/random";
import { recordDiagram } from "@/lib/progress";

type Mode = "ver" | "recordar" | "clasificar" | "preguntas";

type Game = {
  kind: "clasificar" | "preguntas";
  queue: { leaf: TreeLeaf; cat: string; options: string[] }[];
  idx: number;
  hits: number;
  errors: number;
  answer: { picked: string; ok: boolean } | null;
};

function vibrate() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(60);
}

/** Árbol (categorías → elementos): explorar, recordar, clasificar y responder preguntas. */
export function TreeTrainer({ d }: { d: TreeDiagram }) {
  const hasAsk = d.categories.some((c) => c.leaves.some((l) => l.ask));
  const modes: { id: Mode; label: string; hint: string }[] = [
    { id: "ver", label: "Ver el árbol", hint: "Toca cada rama para abrirla y cada elemento para ver su definición." },
    { id: "recordar", label: "Recordar", hint: "Los elementos están ocultos: di cuáles van en cada rama y toca para comprobar." },
    { id: "clasificar", label: "Clasificar", hint: "Te mostramos un elemento: elige a qué rama pertenece." },
    ...(hasAsk
      ? [{ id: "preguntas" as const, label: "Preguntas", hint: d.askLabel ?? "Elige el elemento que responde a la pregunta." }]
      : []),
  ];
  const [mode, setMode] = useState<Mode>("ver");
  const [open, setOpen] = useState<string[]>(() => d.categories.map((c) => c.id));
  const [leafOpen, setLeafOpen] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [game, setGame] = useState<Game | null>(null);

  const allLeaves = d.categories.flatMap((c) => c.leaves.map((leaf) => ({ leaf, cat: c.id })));
  const total = allLeaves.length;

  const newGame = (kind: Game["kind"]) => {
    const seed = newSeed();
    const items = kind === "preguntas" ? allLeaves.filter((x) => x.leaf.ask) : allLeaves;
    const queue = shuffled(items, seed).map((x, i) => {
      if (kind === "clasificar") return { ...x, options: d.categories.map((c) => c.id) };
      // 4 opciones: la correcta + 3 elementos distintos
      const others = shuffled(
        allLeaves.filter((o) => o.leaf.id !== x.leaf.id).map((o) => o.leaf.id),
        `${seed}:${i}`,
      ).slice(0, 3);
      return { ...x, options: shuffled([x.leaf.id, ...others], `${seed}:o${i}`) };
    });
    setGame({ kind, queue, idx: 0, hits: 0, errors: 0, answer: null });
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setRevealed([]);
    if (m === "clasificar" || m === "preguntas") newGame(m);
    else setGame(null);
  };

  const pick = (option: string) => {
    if (!game || game.answer) return;
    const item = game.queue[game.idx];
    const ok = game.kind === "clasificar" ? option === item.cat : option === item.leaf.id;
    if (!ok) vibrate();
    setGame({ ...game, hits: game.hits + (ok ? 1 : 0), errors: game.errors + (ok ? 0 : 1), answer: { picked: option, ok } });
  };

  const nextItem = () => {
    if (!game) return;
    const idx = game.idx + 1;
    const updated = { ...game, idx, answer: null };
    setGame(updated);
    if (idx >= game.queue.length && game.kind === "clasificar") {
      recordDiagram(d.slug, (x) => ({
        ...x,
        orderDone: (x.orderDone ?? 0) + 1,
        orderBest: Math.min(x.orderBest ?? Infinity, game.errors),
      }));
    }
  };

  const catOf = (id: string) => d.categories.find((c) => c.id === id);
  const leafLabel = (id: string) => allLeaves.find((x) => x.leaf.id === id)?.leaf.label ?? id;
  const finished = game !== null && game.idx >= game.queue.length;
  const current = game && !finished ? game.queue[game.idx] : null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Modo de práctica">
        {modes.map((m) => (
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
      <p className="mb-4 text-sm text-muted">{modes.find((m) => m.id === mode)?.hint}</p>

      {(mode === "ver" || mode === "recordar") && (
        <div>
          <div className="mx-auto w-fit rounded-2xl border border-line-strong bg-surface-2 px-4 py-2 text-center font-display font-semibold text-ink">
            {d.root}
          </div>
          <div className="mx-auto h-4 w-0.5 bg-line-strong" />
          {mode === "recordar" && (
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-muted">
                Revelados: <strong className="text-ink">{revealed.length}</strong>/{total}
              </span>
              <span className="flex gap-3">
                <button type="button" onClick={() => setRevealed(allLeaves.map((x) => x.leaf.id))} className="inline-flex items-center gap-1 text-xs text-faint">
                  <Eye className="size-3.5" aria-hidden /> Revelar todo
                </button>
                <button type="button" onClick={() => setRevealed([])} className="inline-flex items-center gap-1 text-xs text-faint">
                  <EyeOff className="size-3.5" aria-hidden /> Ocultar
                </button>
              </span>
            </div>
          )}
          <div className="space-y-3">
            {d.categories.map((c) => {
              const isOpen = open.includes(c.id);
              return (
                <div key={c.id} className="overflow-hidden rounded-3xl border" style={{ borderColor: `${c.color}66`, background: `${c.color}0f` }}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen((o) => (isOpen ? o.filter((x) => x !== c.id) : [...o, c.id]))}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    <span className="size-3 shrink-0 rounded-full" style={{ background: c.color }} />
                    <span className="flex-1">
                      <span className="block font-semibold text-ink">{c.label}</span>
                      {c.sub && <span className="block text-xs text-muted">{c.sub}</span>}
                    </span>
                    <span className="rounded-full bg-bg/40 px-2 py-0.5 font-mono text-xs text-muted">{c.leaves.length}</span>
                    <ChevronDown className={`size-4 text-faint transition ${isOpen ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                  {isOpen && (
                    <ul className="space-y-1.5 px-3 pb-3">
                      {c.leaves.map((leaf) => {
                        const hidden = mode === "recordar" && !revealed.includes(leaf.id);
                        const expanded = mode === "ver" && leafOpen === leaf.id;
                        return (
                          <li key={leaf.id} className="flex gap-2">
                            <span className="mt-3 h-0.5 w-3 shrink-0 rounded" style={{ background: c.color }} aria-hidden />
                            <button
                              type="button"
                              onClick={() => {
                                if (mode === "recordar") setRevealed((r) => (r.includes(leaf.id) ? r : [...r, leaf.id]));
                                else setLeafOpen(expanded ? null : leaf.id);
                              }}
                              className="flex-1 rounded-2xl border border-line bg-bg/40 px-3 py-2 text-left"
                            >
                              {hidden ? (
                                <span className="text-sm text-faint">¿? Toca para revelar</span>
                              ) : (
                                <>
                                  <span className="block text-sm font-medium text-ink">{leaf.label}</span>
                                  {leaf.ask && <span className="block text-xs text-accent">{leaf.ask}</span>}
                                  {expanded && leaf.detail && (
                                    <span className="mt-1 block animate-fade-up text-xs leading-relaxed text-muted">{leaf.detail}</span>
                                  )}
                                </>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
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
          <p className="mt-3 text-center font-display text-xl leading-snug font-semibold text-ink">
            {game.kind === "clasificar" ? current.leaf.label : current.leaf.ask}
          </p>
          {game.kind === "clasificar" && (
            <p className="mt-1 text-center text-xs text-muted">¿En qué rama va?</p>
          )}
          <div className="mt-4 grid gap-2">
            {current.options.map((opt) => {
              const cat = game.kind === "clasificar" ? catOf(opt) : undefined;
              const label = game.kind === "clasificar" ? cat?.label ?? opt : leafLabel(opt);
              const right = game.kind === "clasificar" ? opt === current.cat : opt === current.leaf.id;
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
                  className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left text-[15px] transition active:scale-[0.99] ${cls}`}
                >
                  {cat && <span className="size-3 shrink-0 rounded-full" style={{ background: cat.color }} />}
                  <span className="flex-1">{label}</span>
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
                game.answer.ok ? "border-ok/40 bg-ok/10 text-ok" : "border-bad/40 bg-bad/10 text-bad"
              }`}
            >
              <div className="font-semibold">
                {game.answer.ok
                  ? "¡Correcto!"
                  : game.kind === "clasificar"
                    ? `Va en: ${catOf(current.cat)?.label}`
                    : `Es: ${current.leaf.label}`}
              </div>
              {current.leaf.detail && <p className="mt-1 text-xs leading-relaxed text-muted">{current.leaf.detail}</p>}
              <button
                type="button"
                onClick={nextItem}
                className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-bg"
              >
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
            {game.errors === 0 ? "¡Perfecto! Ya puedes dibujar este árbol de memoria." : "Repite hasta hacerlo sin errores."}
          </p>
          <button
            type="button"
            onClick={() => newGame(game.kind)}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 font-semibold text-bg"
          >
            <RotateCcw className="size-4" aria-hidden /> Otra vez
          </button>
        </div>
      )}
    </div>
  );
}
