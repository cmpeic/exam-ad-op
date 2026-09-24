"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { ArrowDown, Check, Eye, Lightbulb, Pause, Play, Repeat, RotateCcw, Trophy, X } from "lucide-react";
import type { FlowDiagram, FlowStep } from "@/data/types";
import { newSeed, shuffledIndexes } from "@/lib/random";
import { recordDiagram } from "@/lib/progress";
import { Icon } from "@/components/Icon";

type Mode = "ver" | "recordar" | "ordenar";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "ver", label: "Ver y entender", hint: "Toca cada paso o reproduce el recorrido para ver qué pasa en cada flecha." },
  { id: "recordar", label: "Recordar", hint: "Los nombres están ocultos: dilos de memoria y luego revela para comprobar." },
  { id: "ordenar", label: "Ordenar", hint: "Toca los pasos en el orden correcto. Un error suma, así que piensa antes." },
];

type Block = { group?: { id: string; label: string; color: string }; steps: number[] };

function blocksOf(d: FlowDiagram): Block[] {
  const out: Block[] = [];
  d.steps.forEach((s, i) => {
    const last = out[out.length - 1];
    if (last && last.group?.id === s.group) last.steps.push(i);
    else out.push({ group: d.groups?.find((g) => g.id === s.group), steps: [i] });
  });
  return out;
}

function hintOf(label: string) {
  return label
    .split(" ")
    .map((w) => (w.length <= 2 ? w : w[0] + "·".repeat(Math.min(w.length - 1, 8))))
    .join(" ");
}

export function FlowTrainer({ d }: { d: FlowDiagram }) {
  const [mode, setMode] = useState<Mode>("ver");
  const [round, setRound] = useState(d.slug);

  const switchMode = (m: Mode) => {
    setMode(m);
    setRound(newSeed());
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Modo de práctica">
        {MODES.map((m) => (
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
      <p className="mb-4 text-sm text-muted">{MODES.find((m) => m.id === mode)?.hint}</p>

      {mode === "ver" && <FlowExplore d={d} />}
      {mode === "recordar" && <FlowRecall key={round} d={d} onRestart={() => setRound(newSeed())} />}
      {mode === "ordenar" && <FlowOrder key={round} d={d} seed={round} onRestart={() => setRound(newSeed())} />}
    </div>
  );
}

function StepNode({ step, filled, size = "md" }: { step: FlowStep; filled: boolean; size?: "md" | "sm" }) {
  return (
    <span
      className={`relative z-10 grid shrink-0 place-items-center rounded-2xl border-2 transition ${size === "md" ? "size-12" : "size-10"}`}
      style={{
        borderColor: step.color,
        background: filled ? step.color : `${step.color}1f`,
        color: filled ? "#07070d" : step.color,
      }}
    >
      <Icon name={step.icon} className="size-5" />
    </span>
  );
}

function FlowExplore({ d }: { d: FlowDiagram }) {
  const from = d.numberFrom ?? 1;
  const [active, setActive] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState<number[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const n = d.steps.length;

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(
      () => {
        if (active >= n - 1) setPlaying(false);
        else setActive(active + 1);
      },
      active < 0 ? 150 : 2200,
    );
    return () => window.clearTimeout(id);
  }, [playing, active, n]);

  useEffect(() => {
    if (!playing || active < 0) return;
    listRef.current
      ?.querySelector(`[data-step="${active}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [active, playing]);

  const toggle = (i: number) => {
    setPlaying(false);
    setActive(i);
    setOpen((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]));
  };

  const chunkAt = (i: number) => d.chunks?.findIndex((c) => c.start === i) ?? -1;

  const renderStep = (i: number) => {
    const s = d.steps[i];
    const isActive = active === i;
    const passed = playing && i < active;
    const expanded = isActive || open.includes(i);
    const ci = chunkAt(i);
    const isLastInBlock = i === n - 1;
    return (
      <Fragment key={s.id}>
        {ci >= 0 && d.chunks && (
          <div className="mt-2 mb-2 ml-[3.75rem] text-[11px] font-semibold tracking-wider text-accent uppercase">
            {ci + 1} · {d.chunks[ci].label}
          </div>
        )}
        <div data-step={i} className="relative flex gap-3">
          <div className="flex flex-col items-center">
            <button type="button" onClick={() => toggle(i)} aria-label={`Paso ${i + from}: ${s.label}`} className={isActive ? "animate-glow rounded-2xl" : ""} style={{ color: s.color }}>
              <StepNode step={s} filled={isActive || passed} />
            </button>
            {!isLastInBlock && (
              <div
                className={`my-1 w-1 flex-1 rounded-full ${isActive && playing ? "flow-line animate-flow" : ""}`}
                style={{
                  minHeight: 20,
                  color: s.color,
                  background: isActive && playing ? undefined : `linear-gradient(${s.color}66, ${d.steps[i + 1].color}66)`,
                }}
              />
            )}
          </div>
          <div className="min-w-0 flex-1 pb-4">
            <button type="button" onClick={() => toggle(i)} className="w-full text-left" aria-expanded={expanded}>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xs text-faint">{i + from}</span>
                <span className={`font-semibold ${isActive ? "text-ink" : "text-ink/90"}`}>{s.label}</span>
              </div>
              {s.sub && <div className="text-xs text-muted">{s.sub}</div>}
            </button>
            {expanded && (
              <p className="mt-2 animate-fade-up rounded-2xl border border-line bg-surface-2 p-3 text-sm leading-relaxed text-muted">
                {s.detail}
              </p>
            )}
            {s.arrow && i < n - 1 && (
              <p className={`mt-2 flex items-start gap-1.5 text-xs italic transition ${isActive ? "text-accent" : "text-faint"}`}>
                <ArrowDown className="mt-px size-3.5 shrink-0" aria-hidden /> {s.arrow}
              </p>
            )}
          </div>
        </div>
      </Fragment>
    );
  };

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => {
            if (playing) setPlaying(false);
            else {
              setActive(active >= n - 1 ? -1 : active);
              setPlaying(true);
            }
          }}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary font-semibold text-bg"
        >
          {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
          {playing ? "Pausar" : active >= 0 && active < n - 1 ? "Continuar recorrido" : "Recorrer el flujo"}
        </button>
        <button
          type="button"
          onClick={() => {
            setPlaying(false);
            setActive(-1);
            setOpen((o) => (o.length === n ? [] : d.steps.map((_, i) => i)));
          }}
          className="h-11 rounded-2xl border border-line bg-surface-2 px-4 text-sm text-muted"
        >
          {open.length === n ? "Contraer" : "Expandir todo"}
        </button>
      </div>

      <div ref={listRef}>
        {blocksOf(d).map((b, bi) =>
          b.group ? (
            <div
              key={bi}
              className="relative my-4 rounded-3xl border border-dashed p-3 pt-6"
              style={{ borderColor: `${b.group.color}80`, background: `${b.group.color}0d` }}
            >
              <span
                className="absolute -top-3 left-4 rounded-full px-3 py-0.5 text-xs font-semibold"
                style={{ background: b.group.color, color: "#07070d" }}
              >
                {b.group.label}
              </span>
              {b.steps.map(renderStep)}
            </div>
          ) : (
            <Fragment key={bi}>{b.steps.map(renderStep)}</Fragment>
          ),
        )}
        {d.loop && (
          <div className="mt-1 flex items-center gap-2 rounded-2xl border border-dashed border-accent/50 bg-accent/5 px-3 py-2.5 text-sm text-accent">
            <Repeat className="size-4 shrink-0" aria-hidden />
            Vuelve a empezar: {d.steps[0].label} ↺
          </div>
        )}
      </div>
    </div>
  );
}

function FlowRecall({ d, onRestart }: { d: FlowDiagram; onRestart: () => void }) {
  const n = d.steps.length;
  const from = d.numberFrom ?? 1;
  const [shown, setShown] = useState<boolean[]>(() => d.steps.map(() => false));
  const [grade, setGrade] = useState<(boolean | null)[]>(() => d.steps.map(() => null));
  const [hints, setHints] = useState<boolean[]>(() => d.steps.map(() => false));
  const graded = grade.filter((g) => g !== null).length;
  const known = grade.filter((g) => g === true).length;
  const allDone = graded === n;

  const setAt = <T,>(arr: T[], i: number, v: T) => arr.map((x, j) => (j === i ? v : x));

  const mark = (i: number, ok: boolean) => {
    const next = setAt(grade, i, ok);
    setGrade(next);
    if (next.every((g) => g !== null)) {
      const pct = Math.round((100 * next.filter((g) => g === true).length) / n);
      recordDiagram(d.slug, (x) => ({ ...x, recallBest: Math.max(x.recallBest ?? 0, pct) }));
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="text-muted">
          Lo sabía: <strong className="text-ok">{known}</strong> / {n}
        </span>
        <button
          type="button"
          onClick={() => setShown(d.steps.map(() => true))}
          className="inline-flex items-center gap-1.5 text-xs text-faint hover:text-muted"
        >
          <Eye className="size-3.5" aria-hidden /> Revelar todo
        </button>
      </div>
      <ol className="space-y-2">
        {d.steps.map((s, i) => (
          <li
            key={s.id}
            className={`flex items-center gap-3 rounded-2xl border p-2.5 transition ${
              grade[i] === true ? "border-ok/50 bg-ok/8" : grade[i] === false ? "border-bad/50 bg-bad/8" : "border-line bg-surface/80"
            }`}
          >
            <StepNode step={s} filled={shown[i]} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[11px] text-faint">{from === 0 ? "Nivel" : "Paso"} {i + from}</div>
              {shown[i] ? (
                <div className="animate-pop">
                  <div className="font-semibold text-ink">{s.label}</div>
                  {s.sub && <div className="text-xs text-muted">{s.sub}</div>}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShown(setAt(shown, i, true))}
                  className="text-left font-semibold text-faint"
                >
                  {hints[i] ? hintOf(s.label) : "¿? Toca para revelar"}
                </button>
              )}
            </div>
            {!shown[i] && !hints[i] && (
              <button
                type="button"
                onClick={() => setHints(setAt(hints, i, true))}
                aria-label="Pista"
                className="grid size-9 place-items-center rounded-xl border border-line text-warn"
              >
                <Lightbulb className="size-4" aria-hidden />
              </button>
            )}
            {shown[i] && grade[i] === null && (
              <div className="flex gap-1.5">
                <button type="button" onClick={() => mark(i, true)} aria-label="Lo sabía" className="grid size-9 place-items-center rounded-xl bg-ok/15 text-ok">
                  <Check className="size-4" aria-hidden />
                </button>
                <button type="button" onClick={() => mark(i, false)} aria-label="No lo sabía" className="grid size-9 place-items-center rounded-xl bg-bad/15 text-bad">
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            )}
          </li>
        ))}
      </ol>
      {allDone && (
        <div className="mt-4 animate-pop rounded-3xl border border-line bg-surface/80 p-5 text-center">
          <p className="font-display text-xl font-semibold text-ink">
            Recordaste {known} de {n}
          </p>
          <p className="mt-1 text-sm text-muted">
            {known === n ? "¡Memoria perfecta! Pasa al modo Ordenar." : "Repite: cada intento fortalece el recuerdo."}
          </p>
          <button type="button" onClick={onRestart} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 font-semibold text-bg">
            <RotateCcw className="size-4" aria-hidden /> Otra vez
          </button>
        </div>
      )}
    </div>
  );
}

function FlowOrder({ d, seed, onRestart }: { d: FlowDiagram; seed: string; onRestart: () => void }) {
  const n = d.steps.length;
  const from = d.numberFrom ?? 1;
  const [pool] = useState(() => shuffledIndexes(n, `${d.slug}:${seed}`));
  const [placed, setPlaced] = useState(0);
  const [errors, setErrors] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const done = placed >= n;

  const pick = (i: number) => {
    if (done) return;
    if (i === placed) {
      const next = placed + 1;
      setPlaced(next);
      if (next >= n) {
        recordDiagram(d.slug, (x) => ({
          ...x,
          orderDone: (x.orderDone ?? 0) + 1,
          orderBest: Math.min(x.orderBest ?? Infinity, errors),
        }));
      }
    } else {
      setErrors((e) => e + 1);
      setWrong(i);
      window.setTimeout(() => setWrong((w) => (w === i ? null : w)), 450);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(60);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="text-muted">
          {placed}/{n} colocados
        </span>
        <span className={errors ? "text-bad" : "text-faint"}>
          {errors} {errors === 1 ? "error" : "errores"}
        </span>
      </div>
      <ol className="space-y-1.5">
        {d.steps.map((s, i) => (
          <li
            key={s.id}
            className={`flex min-h-12 items-center gap-3 rounded-2xl border px-2.5 py-1.5 transition ${
              i < placed ? "animate-pop border-transparent" : i === placed ? "border-dashed border-primary/70 bg-primary/5" : "border-dashed border-line"
            }`}
            style={i < placed ? { background: `${s.color}1a`, borderColor: `${s.color}55` } : undefined}
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-3 font-mono text-xs text-muted">{i + from}</span>
            {i < placed ? (
              <>
                <span style={{ color: s.color }}>
                  <Icon name={s.icon} className="size-4" />
                </span>
                <span className="font-semibold text-ink">{s.label}</span>
              </>
            ) : (
              <span className="text-sm text-faint">{i === placed ? "¿Qué va aquí?" : ""}</span>
            )}
          </li>
        ))}
      </ol>

      {!done ? (
        <div className="sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 -mx-4 mt-4 border-t border-line/60 bg-bg/90 px-4 pt-3 pb-3 backdrop-blur-xl">
          <div className="flex flex-wrap gap-2">
            {pool
              .filter((i) => i >= placed)
              .map((i) => (
                <button
                  key={d.steps[i].id}
                  type="button"
                  onClick={() => pick(i)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition active:scale-95 ${
                    wrong === i ? "animate-shake border-bad bg-bad/15 text-bad" : "border-line-strong bg-surface-2 text-ink"
                  }`}
                >
                  {d.steps[i].label}
                </button>
              ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 animate-pop rounded-3xl border border-line bg-surface/80 p-5 text-center">
          <Trophy className={`mx-auto size-8 ${errors === 0 ? "text-warn" : "text-muted"}`} aria-hidden />
          <p className="mt-2 font-display text-xl font-semibold text-ink">
            {errors === 0 ? "¡Perfecto, sin errores!" : `Completado con ${errors} ${errors === 1 ? "error" : "errores"}`}
          </p>
          <p className="mt-1 text-sm text-muted">
            {errors === 0 ? "Ya puedes dibujar este diagrama de memoria." : "Repite hasta hacerlo sin errores."}
          </p>
          <button type="button" onClick={onRestart} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 font-semibold text-bg">
            <RotateCcw className="size-4" aria-hidden /> Otra vez
          </button>
        </div>
      )}
    </div>
  );
}
