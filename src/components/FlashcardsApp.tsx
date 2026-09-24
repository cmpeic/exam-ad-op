"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { Lightbulb, Play, RotateCcw, Shuffle, X } from "lucide-react";
import type { Flashcard } from "@/data/types";
import { newSeed, shuffled } from "@/lib/random";
import { gradeCard, startCardSession, useProgress, type CardStat } from "@/lib/progress";
import { Chip, Rich } from "@/components/ui";

// Sistema Leitner: cada tarjeta vive en una caja (1–5). Si la sabes sube de
// caja y aparece con menos frecuencia; si fallas vuelve a la caja 1.
const INTERVAL = [0, 1, 2, 4, 8, 16]; // sesiones entre repasos según la caja
const SESSION_SIZE = 15;

type Grade = "again" | "good" | "easy";
type Session = {
  n: number;
  queue: string[];
  idx: number;
  flipped: boolean;
  results: Record<string, Grade>;
  requeued: string[];
};

function isDue(stat: CardStat | undefined, session: number) {
  if (!stat) return true;
  return session - stat.last >= (INTERVAL[stat.box] ?? 1);
}

function nextBox(prev: number, g: Grade) {
  if (g === "again") return 1;
  return Math.min(5, Math.max(prev, 1) + (g === "good" ? 1 : 2));
}

type TopicRef = { slug: string; title: string };

export function FlashcardsApp({
  subjectId,
  flashcards,
  topics,
}: {
  subjectId: string;
  flashcards: Flashcard[];
  topics: TopicRef[];
}) {
  const progress = useProgress();
  const topicTitle = (slug: string) => topics.find((t) => t.slug === slug)?.title ?? "";
  const [topic, setTopic] = useState("all");
  const [session, setSession] = useState<Session | null>(null);
  const [summary, setSummary] = useState<Record<Grade, number> | null>(null);

  const cards = topic === "all" ? flashcards : flashcards.filter((c) => c.topic === topic);
  const upcoming = (progress.cardSessions[subjectId] ?? 0) + 1;
  const due = cards.filter((c) => isDue(progress.cards[c.id], upcoming));
  const boxCounts = [1, 2, 3, 4, 5].map((b) => flashcards.filter((c) => progress.cards[c.id]?.box === b).length);
  const fresh = flashcards.filter((c) => !progress.cards[c.id]).length;
  const mastered = boxCounts[3] + boxCounts[4];

  const start = (all: boolean) => {
    const from = all ? cards : due;
    if (from.length === 0) return;
    const n = startCardSession(subjectId);
    const queue = shuffled(from, newSeed())
      .sort((a, b) => (progress.cards[a.id]?.box ?? 0) - (progress.cards[b.id]?.box ?? 0))
      .slice(0, SESSION_SIZE)
      .map((c) => c.id);
    setSummary(null);
    setSession({ n, queue, idx: 0, flipped: false, results: {}, requeued: [] });
    window.scrollTo({ top: 0 });
  };

  const flip = () => setSession((s) => (s ? { ...s, flipped: !s.flipped } : s));

  const grade = (g: Grade) => {
    if (!session || !session.flipped) return;
    const id = session.queue[session.idx];
    gradeCard(id, nextBox(progress.cards[id]?.box ?? 0, g), session.n);
    let { queue, requeued } = session;
    if (g === "again" && !requeued.includes(id)) {
      queue = [...queue, id];
      requeued = [...requeued, id];
    }
    const results = { ...session.results, [id]: g };
    const idx = session.idx + 1;
    if (idx >= queue.length) {
      const counts: Record<Grade, number> = { again: 0, good: 0, easy: 0 };
      Object.values(results).forEach((r) => counts[r]++);
      setSummary(counts);
      setSession(null);
    } else {
      setSession({ ...session, queue, requeued, results, idx, flipped: false });
    }
  };

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (!session) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      flip();
    } else if (session.flipped && e.key === "1") grade("again");
    else if (session.flipped && e.key === "2") grade("good");
    else if (session.flipped && e.key === "3") grade("easy");
  });

  useEffect(() => {
    const h = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  if (session) {
    const card = flashcards.find((c) => c.id === session.queue[session.idx]);
    if (!card) return null;
    const box = progress.cards[card.id]?.box ?? 0;
    return (
      <div>
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            aria-label="Terminar sesión"
            onClick={() => setSession(null)}
            className="grid size-9 place-items-center rounded-full border border-line text-muted"
          >
            <X className="size-4" aria-hidden />
          </button>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-linear-to-r from-primary to-accent transition-all"
              style={{ width: `${(session.idx / session.queue.length) * 100}%` }}
            />
          </div>
          <span className="font-mono text-xs text-muted">
            {session.idx + 1}/{session.queue.length}
          </span>
        </div>

        <div className="flip">
          <div className={`flip-inner ${session.flipped ? "is-flipped" : ""}`}>
            <button
              type="button"
              onClick={flip}
              aria-label="Voltear tarjeta"
              className="flip-face flex min-h-[340px] flex-col rounded-3xl border border-line bg-linear-to-br from-surface-2 to-surface p-6 text-left"
            >
              <div className="flex items-center justify-between gap-2">
                <Chip>{topicTitle(card.topic)}</Chip>
                <span className="text-xs text-faint">{box ? `Caja ${box}` : "Nueva"}</span>
              </div>
              <div className="flex flex-1 items-center">
                <p className="font-display text-[26px] leading-tight font-semibold text-ink">{card.front}</p>
              </div>
              <p className="text-center text-xs text-faint">Piensa la respuesta y toca para voltear</p>
            </button>
            <div
              className="flip-face flip-back flex min-h-[340px] flex-col rounded-3xl border border-primary/40 bg-linear-to-br from-primary/15 via-surface-2 to-surface p-6"
              onClick={flip}
            >
              <p className="text-sm text-muted">{card.front}</p>
              <div className="mt-3 flex-1 text-[17px] leading-relaxed text-ink">
                <Rich text={card.back} />
              </div>
              {card.hint && (
                <p className="mt-4 flex items-start gap-2 rounded-2xl bg-bg/40 p-3 text-sm text-accent">
                  <Lightbulb className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <Rich text={card.hint} />
                </p>
              )}
            </div>
          </div>
        </div>

        {session.flipped ? (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button type="button" onClick={() => grade("again")} className="rounded-2xl border border-bad/40 bg-bad/10 py-3 text-bad">
              <span className="block font-semibold">Otra vez</span>
              <span className="text-[11px] opacity-80">caja 1</span>
            </button>
            <button type="button" onClick={() => grade("good")} className="rounded-2xl border border-primary/40 bg-primary/10 py-3 text-primary">
              <span className="block font-semibold">Bien</span>
              <span className="text-[11px] opacity-80">caja {nextBox(box, "good")}</span>
            </button>
            <button type="button" onClick={() => grade("easy")} className="rounded-2xl border border-ok/40 bg-ok/10 py-3 text-ok">
              <span className="block font-semibold">Fácil</span>
              <span className="text-[11px] opacity-80">caja {nextBox(box, "easy")}</span>
            </button>
          </div>
        ) : (
          <button type="button" onClick={flip} className="mt-4 w-full rounded-2xl bg-primary py-3.5 font-semibold text-bg">
            Ver respuesta
          </button>
        )}
        <p className="mt-3 hidden text-center text-xs text-faint sm:block">Teclado: espacio = voltear · 1 / 2 / 3 = calificar</p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-5 animate-fade-up">
        <h1 className="font-display text-[28px] leading-tight font-bold text-ink">Tarjetas</h1>
        <p className="mt-2 text-[15px] text-muted">
          Repetición espaciada (sistema Leitner): lo que ya sabes aparece menos y lo que te cuesta vuelve más seguido.
        </p>
      </header>

      {summary && (
        <div className="mb-5 animate-pop rounded-3xl border border-line bg-surface/80 p-5 text-center">
          <p className="font-display text-xl font-semibold text-ink">¡Sesión terminada!</p>
          <div className="mt-3 flex justify-center gap-2">
            <Chip tone="bad">Otra vez: {summary.again}</Chip>
            <Chip tone="primary">Bien: {summary.good}</Chip>
            <Chip tone="ok">Fácil: {summary.easy}</Chip>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-line bg-surface/80 p-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm font-semibold text-ink">Tus cajas</div>
            <div className="text-xs text-faint">
              {fresh} nuevas · {mastered} dominadas (cajas 4–5) de {flashcards.length}
            </div>
          </div>
        </div>
        <div className="mt-4 flex h-28 items-end gap-2">
          {boxCounts.map((c, i) => {
            const max = Math.max(1, ...boxCounts);
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-semibold text-ink">{c}</span>
                <div
                  className="w-full rounded-t-lg bg-linear-to-t from-primary-strong to-accent transition-all"
                  style={{ height: `${Math.max(4, (c / max) * 72)}px`, opacity: 0.35 + i * 0.16 }}
                />
                <span className="text-[10px] text-faint">Caja {i + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4">
        {[{ slug: "all", title: "Todas" }, ...topics].map((t) => (
          <button
            key={t.slug}
            type="button"
            aria-pressed={topic === t.slug}
            onClick={() => setTopic(t.slug)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              topic === t.slug ? "border-primary bg-primary text-bg" : "border-line bg-surface-2 text-muted"
            }`}
          >
            {t.title}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <button
          type="button"
          disabled={due.length === 0}
          onClick={() => start(false)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-semibold text-bg shadow-xl shadow-primary/25 disabled:opacity-40"
        >
          <Play className="size-4" aria-hidden />
          {due.length === 0
            ? "¡Todo al día por ahora!"
            : `Estudiar ${Math.min(due.length, SESSION_SIZE)} ${due.length === 1 ? "tarjeta pendiente" : "tarjetas pendientes"}`}
        </button>
        <button
          type="button"
          onClick={() => start(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-surface-2 py-3.5 text-sm font-semibold text-ink"
        >
          {due.length === 0 ? <RotateCcw className="size-4" aria-hidden /> : <Shuffle className="size-4" aria-hidden />}
          Repasar {cards.length === flashcards.length ? "todas" : "las de este tema"} igualmente
        </button>
      </div>

      <div className="mt-6 rounded-3xl border border-line bg-surface/60 p-4 text-sm text-muted">
        <div className="mb-1 font-semibold text-ink">¿Cómo funciona?</div>
        Lee la pregunta, <strong className="text-ink">di la respuesta en voz alta</strong> y recién entonces voltea. Sé
        honesto: «Otra vez» la devuelve a la caja 1 y la verás de nuevo en esta sesión; «Bien» y «Fácil» la suben de caja
        y aparecerá con menos frecuencia.
      </div>
    </div>
  );
}
