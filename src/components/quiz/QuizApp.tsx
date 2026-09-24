"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  ChevronRight,
  CircleCheck,
  CircleX,
  Flame,
  PenLine,
  RotateCcw,
  Sparkles,
  Timer,
  Trophy,
  Workflow,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Question } from "@/data/types";
import { newSeed, shuffled } from "@/lib/random";
import { bestExam, recordExam, useProgress, type Progress } from "@/lib/progress";
import { answerText } from "@/lib/questions";
import { ProgressRing } from "@/components/ProgressRing";
import { Chip, Rich } from "@/components/ui";
import { QuestionCard } from "./QuestionCard";

type Mode = "rapido" | "examen" | "tema" | "secuencias" | "errores" | "nuevas" | "abiertas";

export type QuizTopic = { slug: string; title: string; slide: number; hint?: string };

type Props = {
  subject: { id: string; name: string; exam: { size: number; minutes: number } };
  questions: Question[];
  topics: QuizTopic[];
};

function modes(exam: Props["subject"]["exam"]): { id: Mode; title: string; desc: string; icon: LucideIcon }[] {
  return [
    { id: "rapido", title: "Quiz rápido", desc: "10 preguntas mezcladas de toda la presentación.", icon: Zap },
    { id: "examen", title: "Examen simulado", desc: `${exam.size} preguntas de todos los temas · ${exam.minutes} min · nota al final.`, icon: Timer },
    { id: "tema", title: "Por tema", desc: "Elige una o varias diapositivas.", icon: BookOpen },
    { id: "secuencias", title: "Secuencias y diagramas", desc: "Ordenar, relacionar y completar.", icon: Workflow },
    { id: "errores", title: "Repasar errores", desc: "Solo las que fallaste la última vez.", icon: RotateCcw },
    { id: "nuevas", title: "Solo nuevas", desc: "Preguntas que todavía no respondiste.", icon: Sparkles },
    { id: "abiertas", title: "Preguntas abiertas", desc: "Como en el examen escrito, con autoevaluación por checks.", icon: PenLine },
  ];
}

const isMode = (v: string | null): v is Mode =>
  ["rapido", "examen", "tema", "secuencias", "errores", "nuevas", "abiertas"].includes(v ?? "");

function limitFor(mode: Mode, examSize: number): number {
  if (mode === "rapido") return 10;
  if (mode === "examen") return examSize;
  if (mode === "secuencias") return 12;
  if (mode === "nuevas") return 15;
  return Infinity;
}

type Play = {
  mode: Mode;
  list: Question[];
  seed: string;
  idx: number;
  answers: Record<string, boolean>;
  startedAt: number;
  deadline: number | null;
  answered: boolean;
  feedback: boolean;
  streak: number;
  bestStreak: number;
};

type Done = {
  mode: Mode;
  list: Question[];
  answers: Record<string, boolean>;
  elapsed: number;
  timeUp: boolean;
  bestStreak: number;
};

/** Marca de tiempo; solo se usa en manejadores de eventos y temporizadores. */
function timestamp() {
  return Date.now();
}

function fmt(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function QuizApp({ subject, questions, topics }: Props) {
  const params = useSearchParams();
  const progress = useProgress();
  const gradable = questions.filter((q) => q.type !== "open");
  const hints = Object.fromEntries(topics.map((t) => [t.slug, t.hint]));
  const MODES = modes(subject.exam);

  const [mode, setMode] = useState<Mode>(() => {
    const m = params.get("modo");
    if (isMode(m)) return m;
    return params.get("tema") ? "tema" : "rapido";
  });
  const [selTopics, setSelTopics] = useState<string[]>(() => {
    const t = params.get("tema");
    return t && topics.some((x) => x.slug === t) ? [t] : [];
  });
  const [examFeedback, setExamFeedback] = useState(true);
  const [play, setPlay] = useState<Play | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const [now, setNow] = useState(0);

  const pool = (m: Mode, p: Progress): Question[] => {
    switch (m) {
      case "rapido":
      case "examen":
        return gradable;
      case "tema":
        return questions.filter((q) => selTopics.includes(q.topic));
      case "secuencias":
        return gradable.filter((q) => q.type === "order" || q.type === "match" || q.type === "fill");
      case "errores":
        return questions.filter((q) => p.questions[q.id]?.last === 0);
      case "nuevas":
        return gradable.filter((q) => !p.questions[q.id]);
      case "abiertas":
        return questions.filter((q) => q.type === "open");
    }
  };

  /** Examen equilibrado: reparte las preguntas entre todos los temas. */
  const examPick = (seed: string): Question[] => {
    const groups = topics.map((t) => shuffled(gradable.filter((q) => q.topic === t.slug), `${seed}:${t.slug}`));
    const out: Question[] = [];
    for (let round = 0; out.length < subject.exam.size && round < 20; round++) {
      for (const g of groups) {
        if (g[round] && out.length < subject.exam.size) out.push(g[round]);
      }
    }
    return shuffled(out, `${seed}:final`);
  };

  const finish = (p: Play, timeUp: boolean) => {
    if (p.mode === "examen") {
      recordExam(subject.id, p.list.filter((q) => p.answers[q.id]).length, p.list.length);
    }
    setDone({
      mode: p.mode,
      list: p.list,
      answers: p.answers,
      elapsed: timestamp() - p.startedAt,
      timeUp,
      bestStreak: p.bestStreak,
    });
    setPlay(null);
    window.scrollTo({ top: 0 });
  };

  const onTick = useEffectEvent(() => {
    const t = timestamp();
    setNow(t);
    if (play?.deadline && t >= play.deadline) finish(play, true);
  });

  useEffect(() => {
    if (!play?.deadline) return;
    const id = setInterval(() => onTick(), 1000);
    return () => clearInterval(id);
  }, [play?.deadline]);

  const start = (m: Mode, ids?: string[]) => {
    const seed = newSeed();
    let list: Question[];
    if (ids) list = shuffled(questions.filter((q) => ids.includes(q.id)), seed);
    else if (m === "examen") list = examPick(seed);
    else list = shuffled(pool(m, progress), seed).slice(0, limitFor(m, subject.exam.size));
    if (list.length === 0) return;
    const t = timestamp();
    setDone(null);
    setPlay({
      mode: m,
      list,
      seed,
      idx: 0,
      answers: {},
      startedAt: t,
      deadline: m === "examen" ? t + subject.exam.minutes * 60_000 : null,
      answered: false,
      feedback: m !== "examen" || examFeedback,
      streak: 0,
      bestStreak: 0,
    });
    window.scrollTo({ top: 0 });
  };

  const onResult = (q: Question, correct: boolean) => {
    if (!play) return;
    const answers = { ...play.answers, [q.id]: correct };
    const streak = correct ? play.streak + 1 : 0;
    const bestStreak = Math.max(play.bestStreak, streak);
    if (play.mode === "examen" && !play.feedback) {
      const next = play.idx + 1;
      const updated = { ...play, answers, streak, bestStreak };
      if (next >= play.list.length) finish(updated, false);
      else setPlay({ ...updated, idx: next, answered: false });
    } else {
      setPlay({ ...play, answers, answered: true, streak, bestStreak });
    }
  };

  const next = () => {
    if (!play) return;
    if (play.idx + 1 >= play.list.length) finish(play, false);
    else {
      setPlay({ ...play, idx: play.idx + 1, answered: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ——— Jugando ———
  if (play) {
    const q = play.list[play.idx];
    const remaining = play.deadline ? play.deadline - Math.max(now, play.startedAt) : null;
    const isLast = play.idx + 1 >= play.list.length;
    const cardMode = play.mode === "examen" ? (play.feedback ? "feedback" : "silent") : "practice";
    return (
      <div>
        <div className="sticky top-0 z-30 -mx-4 mb-5 border-b border-line/60 bg-bg/85 px-4 pt-3 pb-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Salir del quiz"
              onClick={() => {
                if (window.confirm("¿Salir del quiz? Se perderá esta ronda (tus respuestas ya quedaron guardadas).")) {
                  setPlay(null);
                }
              }}
              className="grid size-9 place-items-center rounded-full border border-line text-muted hover:text-ink"
            >
              <X className="size-4" aria-hidden />
            </button>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-linear-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${((play.idx + (play.answered ? 1 : 0)) / play.list.length) * 100}%` }}
              />
            </div>
            <span className="font-mono text-xs text-muted">
              {play.idx + 1}/{play.list.length}
            </span>
            {play.feedback && play.streak > 1 && (
              <span className="inline-flex animate-pop items-center gap-0.5 rounded-full bg-warn/15 px-2 py-0.5 text-xs font-semibold text-warn">
                <Flame className="size-3.5" aria-hidden /> {play.streak}
              </span>
            )}
            {remaining !== null && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs ${
                  remaining < 60_000 ? "bg-bad/15 text-bad" : "bg-surface-2 text-muted"
                }`}
              >
                <Timer className="size-3.5" aria-hidden />
                {fmt(remaining)}
              </span>
            )}
          </div>
        </div>

        <QuestionCard
          key={`${q.id}:${play.seed}`}
          q={q}
          seed={play.seed}
          mode={cardMode}
          hint={hints[q.topic]}
          onResult={(c) => onResult(q, c)}
        />

        {play.answered && (
          <button
            type="button"
            onClick={next}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/50 bg-primary/15 px-4 py-3.5 font-semibold text-primary transition active:scale-[0.99]"
          >
            {isLast ? "Ver resultados" : "Siguiente"} <ChevronRight className="size-4" aria-hidden />
          </button>
        )}
      </div>
    );
  }

  // ——— Resultados ———
  if (done) {
    const total = done.list.length;
    const correct = done.list.filter((q) => done.answers[q.id]).length;
    const pct = total ? correct / total : 0;
    const wrong = done.list.filter((q) => done.answers[q.id] !== true);
    const msg =
      pct >= 0.9
        ? "¡Excelente! Estás listo para el examen."
        : pct >= 0.7
          ? "¡Muy bien! Repasa los errores y lo dominas."
          : pct >= 0.5
            ? "Vas bien. Sigue practicando con las tarjetas y los diagramas."
            : "Toca repasar: vuelve a los temas y a los trucos de memoria.";
    const againMode = done.mode === "errores" && pool("errores", progress).length === 0 ? "rapido" : done.mode;
    return (
      <div className="animate-fade-up">
        <div className="flex flex-col items-center rounded-3xl border border-line bg-surface/80 p-6 text-center">
          {done.mode === "examen" && <Chip tone="accent">Examen simulado</Chip>}
          <div className="mt-4">
            <ProgressRing
              value={pct}
              size={140}
              stroke={12}
              sublabel={`${correct}/${total} correctas`}
              color={pct >= 0.7 ? "var(--color-ok)" : pct >= 0.5 ? "var(--color-warn)" : "var(--color-bad)"}
            />
          </div>
          <p className="mt-4 font-display text-xl font-semibold text-ink">{msg}</p>
          <p className="mt-1 text-sm text-faint">
            Tiempo: {fmt(done.elapsed)}
            {done.timeUp && " · se acabó el tiempo"}
            {done.bestStreak > 1 && ` · mejor racha: ${done.bestStreak}`}
          </p>
          {done.mode === "examen" && (
            <p className="mt-1 text-sm text-muted">
              Nota sobre 100: <span className="font-semibold text-ink">{Math.round(pct * 100)}</span>
            </p>
          )}
          <p className="mt-2 text-xs text-faint">Cuenta el primer intento de cada pregunta.</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => start(againMode)}
            className="rounded-2xl bg-primary px-4 py-3.5 text-[15px] font-semibold text-bg"
          >
            Otra ronda
          </button>
          <button
            type="button"
            disabled={wrong.length === 0}
            onClick={() => start("errores", wrong.map((q) => q.id))}
            className="rounded-2xl border border-line bg-surface-2 px-4 py-3.5 text-[15px] font-semibold text-ink disabled:opacity-40"
          >
            Repasar {wrong.length} {wrong.length === 1 ? "error" : "errores"}
          </button>
        </div>
        <button
          type="button"
          onClick={() => setDone(null)}
          className="mt-3 w-full rounded-2xl px-4 py-3 text-sm text-muted hover:text-ink"
        >
          Cambiar de modo
        </button>

        {wrong.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">Corrección: lo que falló</h2>
            <ul className="space-y-3">
              {wrong.map((q) => (
                <li key={q.id} className="rounded-2xl border border-line bg-surface/80 p-4">
                  <div className="flex items-start gap-2">
                    <CircleX className="mt-0.5 size-4 shrink-0 text-bad" aria-hidden />
                    <p className="text-sm font-medium text-ink">
                      <Rich text={q.prompt} />
                    </p>
                  </div>
                  <p className="mt-2 flex items-start gap-2 rounded-xl bg-ok/10 px-3 py-2 text-sm text-ok">
                    <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>{answerText(q)}</span>
                  </p>
                  {q.type !== "open" && (
                    <p className="mt-2 text-xs leading-relaxed text-muted">
                      <Rich text={q.explain} />
                    </p>
                  )}
                  <Link href={`/${subject.id}/temas/${q.topic}`} className="mt-2 inline-block text-xs text-primary">
                    Ver tema (Diap. {q.slide}) →
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  // ——— Configuración ———
  const answeredCount = gradable.filter((q) => progress.questions[q.id]).length;
  const right = gradable.filter((q) => progress.questions[q.id]?.last === 1).length;
  const best = bestExam(progress, subject.id);
  const count =
    mode === "examen" ? subject.exam.size : Math.min(pool(mode, progress).length, limitFor(mode, subject.exam.size));

  return (
    <div>
      <header className="mb-5 animate-fade-up">
        <h1 className="font-display text-[28px] leading-tight font-bold text-ink">Quiz · {subject.name}</h1>
        <p className="mt-2 text-[15px] text-muted">
          {questions.length} preguntas. Si fallas, verás qué está mal y podrás volver a intentarlo: recuperar la respuesta de
          memoria es lo que más fija lo aprendido.
        </p>
      </header>

      <div className="mb-5 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl border border-line bg-surface/80 p-3">
          <div className="font-display text-xl font-bold text-ink">
            {answeredCount}/{gradable.length}
          </div>
          <div className="text-[11px] text-faint">respondidas</div>
        </div>
        <div className="rounded-2xl border border-line bg-surface/80 p-3">
          <div className="font-display text-xl font-bold text-ok">
            {answeredCount ? Math.round((right / answeredCount) * 100) : 0}%
          </div>
          <div className="text-[11px] text-faint">aciertos</div>
        </div>
        <div className="rounded-2xl border border-line bg-surface/80 p-3">
          <div className="inline-flex items-center gap-1 font-display text-xl font-bold text-warn">
            <Trophy className="size-4" aria-hidden />
            {best === null ? "–" : Math.round(best * 100)}
          </div>
          <div className="text-[11px] text-faint">mejor examen</div>
        </div>
      </div>

      <div className="space-y-2.5" role="radiogroup" aria-label="Modo de quiz">
        {MODES.map((m) => {
          const n =
            m.id === "examen"
              ? subject.exam.size
              : Math.min(pool(m.id, progress).length, limitFor(m.id, subject.exam.size));
          const disabled = (m.id === "errores" || m.id === "nuevas") && n === 0;
          const active = mode === m.id;
          const ModeIcon = m.icon;
          return (
            <div key={m.id}>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                disabled={disabled}
                onClick={() => setMode(m.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition disabled:opacity-40 ${
                  active ? "border-primary/70 bg-primary/10" : "border-line bg-surface/80 hover:border-line-strong"
                }`}
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                    active ? "bg-primary text-bg" : "bg-surface-3 text-muted"
                  }`}
                >
                  <ModeIcon className="size-5" aria-hidden />
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-2 font-semibold text-ink">
                    {m.title}
                    {(m.id === "errores" || m.id === "nuevas") && (
                      <span className="rounded-full bg-surface-3 px-2 text-xs text-muted">{n}</span>
                    )}
                  </span>
                  <span className="block text-[13px] leading-snug text-muted">{m.desc}</span>
                </span>
              </button>

              {m.id === "examen" && active && (
                <button
                  type="button"
                  role="switch"
                  aria-checked={examFeedback}
                  onClick={() => setExamFeedback((v) => !v)}
                  className="mt-2 flex w-full items-center gap-3 rounded-2xl border border-line bg-surface/60 p-3 text-left"
                >
                  <span
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${examFeedback ? "bg-ok" : "bg-surface-3"}`}
                  >
                    <span
                      className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${
                        examFeedback ? "left-[1.375rem]" : "left-0.5"
                      }`}
                    />
                  </span>
                  <span className="text-sm">
                    <span className="block font-medium text-ink">Mostrar la corrección después de cada pregunta</span>
                    <span className="block text-xs text-muted">
                      {examFeedback
                        ? "Verás si acertaste y la respuesta correcta (sin reintentos: cuenta la primera)."
                        : "Como un examen real: la nota y la corrección aparecen al final."}
                    </span>
                  </span>
                </button>
              )}

              {m.id === "tema" && active && (
                <div className="mt-2 flex flex-wrap gap-2 rounded-2xl border border-line bg-surface/60 p-3">
                  {topics.map((t) => {
                    const on = selTopics.includes(t.slug);
                    return (
                      <button
                        key={t.slug}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setSelTopics((s) => (on ? s.filter((x) => x !== t.slug) : [...s, t.slug]))}
                        className={`rounded-xl border px-2.5 py-1.5 text-left text-xs transition ${
                          on ? "border-primary bg-primary/20 text-ink" : "border-line bg-surface-2 text-muted"
                        }`}
                      >
                        <span className="font-mono text-faint">D{t.slide}</span> {t.title}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 mt-5">
        <button
          type="button"
          disabled={count === 0}
          onClick={() => start(mode)}
          className="w-full rounded-2xl bg-primary px-4 py-4 text-base font-semibold text-bg shadow-xl shadow-primary/25 transition active:scale-[0.99] disabled:opacity-40"
        >
          {count === 0
            ? mode === "tema"
              ? "Elige al menos un tema"
              : "No hay preguntas para este modo"
            : `Empezar · ${count} ${count === 1 ? "pregunta" : "preguntas"}`}
        </button>
      </div>
    </div>
  );
}
