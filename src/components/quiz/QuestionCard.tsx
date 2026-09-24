"use client";

import { useState } from "react";
import { CircleCheck, CircleX, Eye, Lightbulb, PartyPopper, RotateCcw } from "lucide-react";
import type { Question } from "@/data/types";
import { recordAnswer } from "@/lib/progress";
import { QUESTION_TYPE_LABEL, answerText } from "@/lib/questions";
import { Chip, Rich } from "@/components/ui";
import {
  FillBody,
  MatchBody,
  MultiBody,
  OpenBody,
  OrderBody,
  SingleBody,
  TFBody,
  type CheckResult,
  type Status,
} from "./Bodies";

const MAX_ATTEMPTS = 3;

function vibrate(ms: number) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(ms);
}

/**
 * Una pregunta con retroalimentación:
 * - al acertar se marca en verde y se explica por qué;
 * - al fallar se señala qué está mal (sin revelar la respuesta) y se puede volver a
 *   intentar (hasta 3 intentos) o ver la respuesta.
 * Para las estadísticas cuenta solo el primer intento.
 */
export function QuestionCard({
  q,
  seed,
  mode = "practice",
  hint,
  onResult,
}: {
  q: Question;
  seed: string;
  /** practice: con reintentos · feedback: sin reintentos pero con corrección · silent: examen sin corrección. */
  mode?: "practice" | "feedback" | "silent";
  hint?: string;
  /** Se llama una vez, al terminar la pregunta, con el resultado del primer intento. */
  onResult?: (firstTryCorrect: boolean) => void;
}) {
  const [attempt, setAttempt] = useState(1);
  const [status, setStatus] = useState<Status>("answering");
  const [first, setFirst] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string | undefined>(undefined);
  const [carry, setCarry] = useState<unknown>(undefined);

  const canRetry = mode === "practice" && q.type !== "tf" && q.type !== "open";

  const onCheck = ({ correct, feedback: fb, carry: next }: CheckResult) => {
    const firstResult = first ?? correct;
    if (first === null) {
      setFirst(correct);
      recordAnswer(q.id, correct);
    }
    if (correct) {
      setStatus("correct");
      vibrate(25);
      onResult?.(firstResult);
      return;
    }
    vibrate(70);
    if (mode === "silent") {
      setStatus("locked");
      onResult?.(firstResult);
    } else if (canRetry && attempt < MAX_ATTEMPTS) {
      setStatus("wrong");
      setFeedback(fb);
      setCarry(next);
    } else {
      setStatus("revealed");
      onResult?.(firstResult);
    }
  };

  const retry = () => {
    setAttempt((a) => a + 1);
    setStatus("answering");
    setFeedback(undefined);
  };

  const reveal = () => {
    setStatus("revealed");
    onResult?.(first ?? false);
  };

  const body = { seed, status, carry, onCheck };

  return (
    <div className="animate-fade-up">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Chip tone="primary">{QUESTION_TYPE_LABEL[q.type]}</Chip>
        <span className="text-xs text-faint">Diap. {q.slide}</span>
        {attempt > 1 && (
          <span className="ml-auto rounded-full bg-warn/15 px-2 py-0.5 text-xs font-medium text-warn">
            Intento {attempt} de {MAX_ATTEMPTS}
          </span>
        )}
      </div>
      <h2 className="mb-4 text-[17px] leading-snug font-semibold text-ink">
        <Rich text={q.prompt} />
      </h2>

      {q.type === "single" && <SingleBody key={attempt} q={q} {...body} />}
      {q.type === "multi" && <MultiBody key={attempt} q={q} {...body} />}
      {q.type === "tf" && <TFBody key={attempt} q={q} {...body} />}
      {q.type === "order" && <OrderBody key={attempt} q={q} {...body} />}
      {q.type === "match" && <MatchBody key={attempt} q={q} {...body} />}
      {q.type === "fill" && <FillBody key={attempt} q={q} {...body} />}
      {q.type === "open" && <OpenBody key={attempt} q={q} {...body} />}

      {status === "wrong" && (
        <div role="status" className="mt-4 animate-shake rounded-2xl border border-warn/50 bg-warn/10 p-4">
          <div className="flex items-center gap-2 font-semibold text-warn">
            <CircleX className="size-5" aria-hidden /> Todavía no… ¡inténtalo otra vez!
          </div>
          {feedback && <p className="mt-2 text-sm leading-relaxed text-ink/90">{feedback}</p>}
          {hint && (
            <p className="mt-2 flex items-start gap-2 rounded-xl bg-bg/40 px-3 py-2 text-sm text-accent">
              <Lightbulb className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                Pista: <Rich text={hint} />
              </span>
            </p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={retry}
              className="flex items-center justify-center gap-2 rounded-2xl bg-warn px-3 py-3 text-sm font-semibold text-bg"
            >
              <RotateCcw className="size-4" aria-hidden /> Volver a intentar
            </button>
            <button
              type="button"
              onClick={reveal}
              className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface-2 px-3 py-3 text-sm font-semibold text-ink"
            >
              <Eye className="size-4" aria-hidden /> Ver la respuesta
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-faint">
            Te quedan {MAX_ATTEMPTS - attempt} {MAX_ATTEMPTS - attempt === 1 ? "intento" : "intentos"}
          </p>
        </div>
      )}

      {status === "correct" && (
        <div role="status" className="mt-4 animate-pop rounded-2xl border border-ok/50 bg-ok/10 p-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-ok">
            {attempt === 1 ? <PartyPopper className="size-5" aria-hidden /> : <CircleCheck className="size-5" aria-hidden />}
            {q.type === "open"
              ? "¡Bien! Cubriste la mayoría de los puntos clave"
              : attempt === 1
                ? "¡Correcto!"
                : `¡Correcto en el ${attempt}.º intento!`}
          </div>
          {attempt > 1 && (
            <p className="mt-1 text-xs text-muted">La guardamos para que la repases en «Repasar errores».</p>
          )}
          {q.type !== "open" && (
            <p className="mt-2 text-sm leading-relaxed text-muted">
              <Rich text={q.explain} />
            </p>
          )}
        </div>
      )}

      {status === "revealed" && (
        <div role="status" className="mt-4 animate-pop rounded-2xl border border-bad/40 bg-bad/10 p-4">
          <div className="flex items-center gap-2 font-semibold text-bad">
            <CircleX className="size-5" aria-hidden />
            {q.type === "open" ? "Te faltaron puntos clave: repásalos" : "Incorrecto"}
          </div>
          {q.type !== "open" && (
            <>
              <div className="mt-3 rounded-xl border border-ok/40 bg-ok/10 px-3 py-2">
                <div className="text-[11px] font-semibold tracking-wider text-ok uppercase">Respuesta correcta</div>
                <div className="mt-0.5 text-sm font-medium text-ink">{answerText(q)}</div>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                <Rich text={q.explain} />
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
