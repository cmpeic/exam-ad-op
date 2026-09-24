"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Pause,
  Play,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { ALL_TOOLS, PHASES } from "@/data/cicd/phases";
import { CD_LABEL, CI_LABEL, INF, SEG, SEGMENTS, START_T, infPoint, phaseIndexAt } from "@/lib/infinity";
import { newSeed, shuffled } from "@/lib/random";
import { recordDiagram } from "@/lib/progress";
import { Icon } from "@/components/Icon";
import { Rich } from "@/components/ui";

type Mode = "explorar" | "recordar" | "ubicar" | "ciclo" | "herramientas";

const MODES: { id: Mode; label: string }[] = [
  { id: "explorar", label: "Explorar" },
  { id: "recordar", label: "Recordar" },
  { id: "ubicar", label: "Ubicar" },
  { id: "ciclo", label: "Ciclo" },
  { id: "herramientas", label: "Herramientas" },
];

type Game = { queue: string[]; idx: number; errors: number; hits: number };
type Flash = { right?: string; wrong?: string } | null;

const SPEED = (2 * Math.PI) / 14; // una vuelta cada 14 s
const OK = "#34d399";
const BAD = "#fb7185";

function vibrate() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(60);
}

export function InfinityTrainer() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [mode, setMode] = useState<Mode>("explorar");
  const [selected, setSelected] = useState("plan");
  const [revealed, setRevealed] = useState<string[]>([]);
  const [game, setGame] = useState<Game | null>(null);
  const [flash, setFlash] = useState<Flash>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState<number | null>(null);
  const startRef = useRef(START_T);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    let cur = startRef.current;
    const loop = (now: number) => {
      cur += ((now - last) / 1000) * SPEED;
      last = now;
      setT(cur);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const activeIdx = playing && t !== null ? phaseIndexAt(t) : PHASES.findIndex((p) => p.id === selected);
  const active = PHASES[Math.max(0, activeIdx)];

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      if (t !== null) setSelected(PHASES[phaseIndexAt(t)].id);
      return;
    }
    const i = PHASES.findIndex((p) => p.id === selected);
    startRef.current = START_T + i * SEG;
    setT(startRef.current);
    setPlaying(true);
  };

  const step = (dir: 1 | -1) => {
    setPlaying(false);
    const i = PHASES.findIndex((p) => p.id === selected);
    setSelected(PHASES[(i + dir + PHASES.length) % PHASES.length].id);
  };

  const switchMode = (m: Mode) => {
    setPlaying(false);
    setFlash(null);
    setFeedback(null);
    setMode(m);
    if (m === "recordar") setRevealed([]);
    if (m === "ubicar") setGame({ queue: shuffled(PHASES.map((p) => p.id), newSeed()), idx: 0, errors: 0, hits: 0 });
    else if (m === "ciclo") setGame({ queue: PHASES.map((p) => p.id), idx: 0, errors: 0, hits: 0 });
    else if (m === "herramientas") {
      setGame({ queue: shuffled(ALL_TOOLS.map((x) => x.name), newSeed()), idx: 0, errors: 0, hits: 0 });
    } else setGame(null);
  };

  const flashFor = (f: Flash) => {
    setFlash(f);
    window.setTimeout(() => setFlash(null), 750);
  };

  const finishGame = (g: Game) => {
    if (mode === "ciclo") {
      recordDiagram("ciclo-infinito", (d) => ({
        ...d,
        orderDone: (d.orderDone ?? 0) + 1,
        orderBest: Math.min(d.orderBest ?? Infinity, g.errors),
      }));
    } else if (mode === "ubicar") {
      recordDiagram("ciclo-infinito", (d) => ({ ...d, locateBest: Math.min(d.locateBest ?? Infinity, g.errors) }));
    } else if (mode === "herramientas") {
      recordDiagram("ciclo-infinito", (d) => ({ ...d, toolsBest: Math.max(d.toolsBest ?? 0, g.hits) }));
    }
  };

  const tap = (id: string) => {
    if (mode === "explorar") {
      setPlaying(false);
      setSelected(id);
      return;
    }
    if (mode === "recordar") {
      setRevealed((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]));
      setSelected(id);
      return;
    }
    if (!game || game.idx >= game.queue.length) return;

    if (mode === "herramientas") {
      const tool = ALL_TOOLS.find((x) => x.name === game.queue[game.idx]);
      if (!tool) return;
      const ok = id === tool.phase;
      const phaseLabel = PHASES.find((p) => p.id === tool.phase)?.label ?? "";
      flashFor(ok ? { right: id } : { right: tool.phase, wrong: id });
      setFeedback({ ok, text: ok ? `${tool.name} → ${phaseLabel}` : `${tool.name} va en ${phaseLabel}` });
      if (!ok) vibrate();
      const next = { ...game, idx: game.idx + 1, hits: game.hits + (ok ? 1 : 0), errors: game.errors + (ok ? 0 : 1) };
      setGame(next);
      if (next.idx >= next.queue.length) finishGame(next);
      return;
    }

    const target = game.queue[game.idx];
    if (id === target) {
      flashFor({ right: id });
      const next = { ...game, idx: game.idx + 1, hits: game.hits + 1 };
      setGame(next);
      if (next.idx >= next.queue.length) finishGame(next);
    } else {
      flashFor({ wrong: id });
      vibrate();
      setGame({ ...game, errors: game.errors + 1 });
    }
  };

  const labelVisible = (id: string, i: number) => {
    if (mode === "explorar" || mode === "herramientas") return true;
    if (mode === "recordar") return revealed.includes(id);
    if (!game) return false;
    if (mode === "ciclo") return i < game.idx;
    return game.queue.slice(0, game.idx).includes(id);
  };

  // La fase activa se dibuja al final para que quede por encima en el cruce central.
  const drawOrder = PHASES.map((_, i) => i).sort(
    (a, b) => Number(mode === "explorar" && a === activeIdx) - Number(mode === "explorar" && b === activeIdx),
  );
  const token = playing && t !== null ? infPoint(t) : null;
  const finished = game !== null && game.idx >= game.queue.length;
  const currentTool = mode === "herramientas" && game && !finished ? ALL_TOOLS.find((x) => x.name === game.queue[game.idx]) : null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Modo de práctica">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => switchMode(m.id)}
            className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${
              mode === m.id ? "border-primary bg-primary text-bg" : "border-line bg-surface-2 text-muted"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Consigna del modo */}
      <div className="mb-3 min-h-[3.25rem] rounded-2xl border border-line bg-surface/80 px-4 py-3 text-sm text-muted">
        {mode === "explorar" && "Toca una fase para ver qué pasa y sus herramientas, o anima el ciclo completo."}
        {mode === "recordar" && (
          <span>
            Di el nombre de cada fase <strong className="text-ink">antes</strong> de tocarla para revelarla. ·{" "}
            {revealed.length}/8
          </span>
        )}
        {mode === "ubicar" && game && !finished && (
          <span className="text-base">
            ¿Dónde está <strong className="font-display text-lg text-accent">{PHASES.find((p) => p.id === game.queue[game.idx])?.label}</strong>?
            <span className="ml-2 text-xs text-faint">
              {game.idx}/8 · errores {game.errors}
            </span>
          </span>
        )}
        {mode === "ciclo" && game && !finished && (
          <span>
            Toca las fases <strong className="text-ink">en orden</strong>, empezando por PLAN. Vas por la fase{" "}
            <strong className="text-accent">{game.idx + 1}</strong> de 8 · errores {game.errors}
          </span>
        )}
        {currentTool && game && (
          <span>
            <span className="text-xs text-faint">
              {game.idx + 1}/{game.queue.length} · aciertos {game.hits}
            </span>
            <br />
            ¿En qué fase aparece <strong className="font-display text-lg text-accent">{currentTool.name}</strong>?{" "}
            <span className="text-xs">({currentTool.desc})</span>
          </span>
        )}
        {finished && game && (
          <span className="flex items-center gap-2 text-ink">
            <Trophy className="size-4 text-warn" aria-hidden />
            {mode === "herramientas"
              ? `¡Listo! ${game.hits}/${game.queue.length} herramientas bien ubicadas.`
              : game.errors === 0
                ? "¡Perfecto, sin errores!"
                : `Completado con ${game.errors} ${game.errors === 1 ? "error" : "errores"}.`}
          </span>
        )}
      </div>

      <div className="rounded-3xl border border-line bg-surface/60 p-2">
        <svg
          viewBox={`0 0 ${INF.W} ${INF.H}`}
          className="w-full touch-manipulation select-none"
          role="group"
          aria-label="Diagrama del ciclo infinito CI/CD"
        >
          <defs>
            {SEGMENTS.map((s) => (
              <path key={s.id} id={`${uid}-t-${s.id}`} d={s.textD} />
            ))}
          </defs>
          <text x={CI_LABEL[0]} y={CI_LABEL[1]} dy="0.35em" textAnchor="middle" className="fill-ink font-display" fontSize={30} fontWeight={700}>
            CI
          </text>
          <text x={CD_LABEL[0]} y={CD_LABEL[1]} dy="0.35em" textAnchor="middle" className="fill-ink font-display" fontSize={30} fontWeight={700}>
            CD
          </text>
          {drawOrder.map((i) => {
            const s = SEGMENTS[i];
            const p = PHASES[i];
            const isActive = mode === "explorar" && p.id === active.id;
            const dimmed = mode === "explorar" && !isActive;
            const color = flash?.right === p.id ? OK : flash?.wrong === p.id ? BAD : p.color;
            const visible = labelVisible(p.id, i);
            return (
              <g
                key={s.id}
                role="button"
                tabIndex={0}
                aria-label={visible ? `${p.label}: ${p.es}` : `Fase ${i + 1} oculta`}
                onClick={() => tap(p.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    tap(p.id);
                  }
                }}
                className="inf-seg cursor-pointer outline-none"
                style={{ opacity: dimmed ? 0.4 : 1, transition: "opacity .25s" }}
              >
                <path d={s.d} stroke="transparent" strokeWidth={INF.SW + 14} fill="none" />
                <path
                  className="seg-stroke"
                  d={s.d}
                  stroke={color}
                  strokeWidth={INF.SW}
                  fill="none"
                  style={{
                    filter: isActive || flash?.right === p.id || flash?.wrong === p.id ? `drop-shadow(0 0 6px ${color})` : undefined,
                    transition: "stroke .2s",
                  }}
                />
                <path d={s.arrow} fill={color} style={{ transition: "fill .2s" }} />
                <text fontSize={11} fontWeight={700} letterSpacing={1.1} fill="#fff" dy="0.36em" pointerEvents="none">
                  <textPath href={`#${uid}-t-${s.id}`} startOffset={s.textOffset} textAnchor="middle">
                    {visible ? p.label : "?"}
                  </textPath>
                </text>
              </g>
            );
          })}
          {token && (
            <circle cx={token[0]} cy={token[1]} r={7} fill="#fff" style={{ filter: "drop-shadow(0 0 6px #fff)" }} />
          )}
        </svg>
      </div>

      {/* Controles y panel por modo */}
      {mode === "explorar" && (
        <>
          <div className="mt-3 flex items-center gap-2">
            <button type="button" onClick={() => step(-1)} aria-label="Fase anterior" className="grid size-11 place-items-center rounded-2xl border border-line bg-surface-2 text-muted">
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary font-semibold text-bg"
            >
              {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
              {playing ? "Pausar" : "Animar el ciclo"}
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Fase siguiente" className="grid size-11 place-items-center rounded-2xl border border-line bg-surface-2 text-muted">
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>
          <PhasePanel phaseId={active.id} />
        </>
      )}

      {mode === "recordar" && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setRevealed(PHASES.map((p) => p.id))} className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface-2 py-3 text-sm text-ink">
            <Eye className="size-4" aria-hidden /> Revelar todo
          </button>
          <button type="button" onClick={() => setRevealed([])} className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface-2 py-3 text-sm text-ink">
            <EyeOff className="size-4" aria-hidden /> Ocultar todo
          </button>
        </div>
      )}

      {mode === "herramientas" && !finished && (
        <div className="mt-3">
          {feedback && (
            <p className={`mb-2 text-center text-sm font-medium ${feedback.ok ? "text-ok" : "text-bad"}`} role="status">
              {feedback.ok ? "✓ " : "✗ "}
              {feedback.text}
            </p>
          )}
          <div className="grid grid-cols-4 gap-2">
            {PHASES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => tap(p.id)}
                className="rounded-xl px-1 py-2.5 text-[11px] font-bold tracking-wide text-white"
                style={{ background: p.color }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {finished && (
        <button
          type="button"
          onClick={() => switchMode(mode)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-semibold text-bg"
        >
          <RotateCcw className="size-4" aria-hidden /> Otra vez
        </button>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] leading-tight">
        <div className="rounded-2xl border border-line bg-surface/80 p-2.5">
          <div className="font-semibold text-ink">CI</div>
          <div className="text-muted">Code · Build · Test</div>
        </div>
        <div className="rounded-2xl border border-line bg-surface/80 p-2.5">
          <div className="font-semibold text-ink">Cruces</div>
          <div className="text-muted">Release (CI→CD) · Plan (CD→CI)</div>
        </div>
        <div className="rounded-2xl border border-line bg-surface/80 p-2.5">
          <div className="font-semibold text-ink">CD</div>
          <div className="text-muted">Deploy · Operate · Monitor</div>
        </div>
      </div>

      <details className="group mt-4 rounded-3xl border border-line bg-surface/80 p-4">
        <summary className="cursor-pointer list-none font-semibold text-ink">
          Mapa de herramientas por fase <span className="text-faint group-open:hidden">(ver)</span>
        </summary>
        <ul className="mt-3 space-y-2">
          {PHASES.filter((p) => p.tools.length).map((p) => (
            <li key={p.id} className="flex items-start gap-3">
              <span className="mt-0.5 w-[4.75rem] shrink-0 rounded-md px-1.5 py-0.5 text-center text-[11px] font-bold text-white" style={{ background: p.color }}>
                {p.label}
              </span>
              <span className="text-sm text-muted">{p.tools.map((x) => x.name).join(" · ")}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

function PhasePanel({ phaseId }: { phaseId: string }) {
  const p = PHASES.find((x) => x.id === phaseId) ?? PHASES[0];
  const n = PHASES.indexOf(p) + 1;
  return (
    <div key={p.id} className="mt-3 animate-fade-up rounded-3xl border p-4" style={{ borderColor: `${p.color}66`, background: `${p.color}14` }}>
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl text-white" style={{ background: p.color }}>
          <Icon name={p.icon} className="size-5" />
        </span>
        <div className="flex-1">
          <div className="font-display text-xl font-bold text-ink">
            {n}. {p.label} <span className="text-base font-medium text-muted">· {p.es}</span>
          </div>
          <div className="text-xs text-muted">{p.sideLabel}</div>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{p.detail}</p>
      {p.tools.length > 0 && (
        <ul className="mt-3 grid gap-2">
          {p.tools.map((tool) => (
            <li key={tool.name} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-bg/40 px-3 py-2">
              <span className="font-semibold text-ink">{tool.name}</span>
              <span className="text-right text-xs text-muted">{tool.desc}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 rounded-xl bg-bg/40 px-3 py-2 text-sm text-accent">
        💡 <Rich text={p.hook} />
      </p>
    </div>
  );
}
