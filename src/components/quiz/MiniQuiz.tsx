"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, RotateCcw } from "lucide-react";
import type { Question } from "@/data/types";
import { newSeed, shuffled } from "@/lib/random";
import { QuestionCard } from "./QuestionCard";

const PER_ROUND = 4;

/** Mini práctica al final de cada tema (sin preguntas abiertas). */
export function MiniQuiz({
  subjectId,
  topic,
  questions,
  hint,
}: {
  subjectId: string;
  topic: string;
  questions: Question[];
  hint?: string;
}) {
  const [seed, setSeed] = useState(topic);
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const list = shuffled(questions, seed).slice(0, PER_ROUND);

  if (list.length === 0) return null;

  const restart = () => {
    setSeed(newSeed());
    setIdx(0);
    setAnswered(false);
    setScore(0);
  };

  if (idx >= list.length) {
    return (
      <div className="rounded-3xl border border-line bg-surface/80 p-5 text-center">
        <p className="font-display text-xl font-semibold text-ink">
          {score}/{list.length} correctas al primer intento
        </p>
        <p className="mt-1 text-sm text-muted">
          {score === list.length ? "¡Perfecto! Este tema está dominado." : "Repite para fijarlo mejor."}
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 font-semibold text-bg"
          >
            <RotateCcw className="size-4" aria-hidden /> Otras preguntas
          </button>
          <Link href={`/${subjectId}/quiz?tema=${topic}`} className="rounded-2xl px-4 py-2 text-sm text-primary">
            Practicar todo el tema en el Quiz →
          </Link>
        </div>
      </div>
    );
  }

  const q = list[idx];
  return (
    <div className="rounded-3xl border border-line bg-surface/80 p-4">
      <div className="mb-3 text-xs text-faint">
        Pregunta {idx + 1} de {list.length}
      </div>
      <QuestionCard
        key={`${q.id}:${seed}`}
        q={q}
        seed={seed}
        hint={hint}
        onResult={(c) => {
          setAnswered(true);
          if (c) setScore((s) => s + 1);
        }}
      />
      {answered && (
        <button
          type="button"
          onClick={() => {
            setIdx(idx + 1);
            setAnswered(false);
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/50 bg-primary/15 px-4 py-3 font-semibold text-primary"
        >
          {idx + 1 >= list.length ? "Ver resultado" : "Siguiente"} <ChevronRight className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
