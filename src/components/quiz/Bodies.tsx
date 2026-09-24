"use client";

import { Fragment, useMemo, useState, type ReactNode } from "react";
import { Check, Lock, RotateCcw, X } from "lucide-react";
import type { FillQ, MatchQ, MultiQ, OpenQ, OrderQ, SingleQ, TFQ } from "@/data/types";
import { shuffled, shuffledIndexes } from "@/lib/random";

/**
 * answering: se puede responder · wrong: intento fallido (se marcan los errores
 * sin revelar la respuesta) · correct / revealed: se muestra la respuesta ·
 * locked: examen sin corrección (solo se ve lo elegido).
 */
export type Status = "answering" | "wrong" | "correct" | "revealed" | "locked";
export type CheckResult = { correct: boolean; feedback?: string; carry?: unknown };

type BodyProps<Q> = {
  q: Q;
  seed: string;
  status: Status;
  /** Lo que se conserva del intento anterior (lo que ya estaba bien). */
  carry?: unknown;
  onCheck: (r: CheckResult) => void;
};

const showAnswer = (s: Status) => s === "correct" || s === "revealed";

type Mark = "idle" | "selected" | "correct" | "wrong" | "missed" | "dim" | "eliminated";

const MARK_CLASS: Record<Mark, string> = {
  idle: "border-line bg-surface-2 text-ink hover:border-line-strong",
  selected: "border-primary bg-primary/12 text-ink ring-1 ring-primary/40",
  correct: "border-ok bg-ok/15 text-ink ring-1 ring-ok/50",
  wrong: "border-bad/80 bg-bad/12 text-ink",
  missed: "border-dashed border-warn/80 bg-warn/8 text-ink",
  dim: "border-line bg-surface-2 text-muted opacity-55",
  eliminated: "border-bad/30 bg-bad/5 text-faint line-through",
};

export function CheckButton({
  disabled,
  onClick,
  children = "Comprobar",
}: {
  disabled?: boolean;
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-5 w-full rounded-2xl bg-primary px-4 py-3.5 text-[15px] font-semibold text-bg shadow-lg shadow-primary/20 transition active:scale-[0.99] disabled:opacity-35 disabled:shadow-none"
    >
      {children}
    </button>
  );
}

function OptionBadge({ mark, children }: { mark: Mark; children: ReactNode }) {
  if (mark === "correct") return <Check className="size-3.5" strokeWidth={3} aria-label="correcta" />;
  if (mark === "wrong" || mark === "eliminated") return <X className="size-3.5" strokeWidth={3} aria-label="incorrecta" />;
  return <>{children}</>;
}

const LETTERS = "ABCDEFGHIJ";

export function SingleBody({ q, seed, status, carry, onCheck }: BodyProps<SingleQ>) {
  const order = useMemo(() => shuffled(q.options.map((_, i) => i), `${q.id}:${seed}`), [q, seed]);
  const eliminated = (carry as { eliminated?: number[] } | undefined)?.eliminated ?? [];
  const [sel, setSel] = useState<number | null>(null);
  const answering = status === "answering";

  const check = () => {
    if (sel === null) return;
    const correct = sel === q.answer;
    onCheck({
      correct,
      feedback: "Esa opción no es. La tachamos para que elijas entre las que quedan.",
      carry: { eliminated: [...eliminated, sel] },
    });
  };

  return (
    <div>
      <div className="space-y-2.5">
        {order.map((oi, k) => {
          const out = eliminated.includes(oi);
          let mark: Mark;
          if (showAnswer(status)) mark = oi === q.answer ? "correct" : sel === oi || out ? "wrong" : "dim";
          else if (out) mark = "eliminated";
          else if (status === "wrong") mark = sel === oi ? "wrong" : "dim";
          else if (status === "locked") mark = sel === oi ? "selected" : "dim";
          else mark = sel === oi ? "selected" : "idle";
          return (
            <button
              key={oi}
              type="button"
              disabled={!answering || out}
              aria-pressed={sel === oi}
              onClick={() => setSel(oi)}
              className={`flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left text-[15px] leading-snug transition active:scale-[0.99] ${MARK_CLASS[mark]} ${
                mark === "correct" ? "animate-pop" : ""
              }`}
            >
              <span className="mt-px grid size-6 shrink-0 place-items-center rounded-lg border border-current/25 font-mono text-xs">
                <OptionBadge mark={mark}>{LETTERS[k]}</OptionBadge>
              </span>
              <span>{q.options[oi]}</span>
            </button>
          );
        })}
      </div>
      {answering && (
        <CheckButton disabled={sel === null} onClick={check}>
          {eliminated.length ? "Comprobar de nuevo" : "Comprobar"}
        </CheckButton>
      )}
    </div>
  );
}

export function TFBody({ q, status, onCheck }: BodyProps<TFQ>) {
  const [sel, setSel] = useState<boolean | null>(null);
  const answering = status === "answering";
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {[true, false].map((v) => {
          let mark: Mark = sel === v ? "selected" : "idle";
          if (showAnswer(status)) mark = v === q.answer ? "correct" : sel === v ? "wrong" : "dim";
          else if (status === "locked") mark = sel === v ? "selected" : "dim";
          return (
            <button
              key={String(v)}
              type="button"
              disabled={!answering}
              aria-pressed={sel === v}
              onClick={() => setSel(v)}
              className={`flex flex-col items-center gap-1 rounded-2xl border px-3 py-5 text-base font-semibold transition active:scale-[0.98] ${MARK_CLASS[mark]} ${
                mark === "correct" ? "animate-pop" : ""
              }`}
            >
              {v ? <Check className="size-6 text-ok" aria-hidden /> : <X className="size-6 text-bad" aria-hidden />}
              {v ? "Verdadero" : "Falso"}
            </button>
          );
        })}
      </div>
      {answering && <CheckButton disabled={sel === null} onClick={() => onCheck({ correct: sel === q.answer })} />}
    </div>
  );
}

export function MultiBody({ q, seed, status, carry, onCheck }: BodyProps<MultiQ>) {
  const order = useMemo(() => shuffled(q.options.map((_, i) => i), `${q.id}:${seed}`), [q, seed]);
  const [sel, setSel] = useState<number[]>(() => (carry as { selected?: number[] } | undefined)?.selected ?? []);
  const correct = new Set(q.answers);
  const answering = status === "answering";
  const toggle = (i: number) => setSel((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const check = () => {
    const hits = sel.filter((i) => correct.has(i)).length;
    const extra = sel.length - hits;
    const ok = extra === 0 && hits === q.answers.length;
    const parts = [`Marcaste ${hits} de ${q.answers.length} correctas`];
    if (extra) parts.push(`y ${extra} que ${extra === 1 ? "sobra" : "sobran"}`);
    onCheck({ correct: ok, feedback: `${parts.join(" ")}. Ajusta tu selección.`, carry: { selected: sel } });
  };

  return (
    <div>
      <p className="mb-3 text-xs text-faint">Puede haber varias respuestas correctas.</p>
      <div className="space-y-2.5">
        {order.map((oi) => {
          const on = sel.includes(oi);
          let mark: Mark = on ? "selected" : "idle";
          if (showAnswer(status)) {
            if (correct.has(oi)) mark = on ? "correct" : "missed";
            else mark = on ? "wrong" : "dim";
          } else if (status === "wrong" || status === "locked") mark = on ? "selected" : "dim";
          return (
            <button
              key={oi}
              type="button"
              role="checkbox"
              aria-checked={on}
              disabled={!answering}
              onClick={() => toggle(oi)}
              className={`flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left text-[15px] leading-snug transition active:scale-[0.99] ${MARK_CLASS[mark]}`}
            >
              <span
                className={`mt-px grid size-5 shrink-0 place-items-center rounded-md border-2 transition ${
                  on ? "border-primary bg-primary text-bg" : "border-line-strong"
                }`}
              >
                {on && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
              </span>
              <span className="flex-1">{q.options[oi]}</span>
              {showAnswer(status) && mark === "correct" && <span className="text-xs font-semibold text-ok">bien</span>}
              {showAnswer(status) && mark === "missed" && <span className="text-xs font-semibold text-warn">faltó</span>}
              {showAnswer(status) && mark === "wrong" && <span className="text-xs font-semibold text-bad">sobra</span>}
            </button>
          );
        })}
      </div>
      {answering && (
        <CheckButton disabled={sel.length === 0} onClick={check}>
          {carry ? "Comprobar de nuevo" : "Comprobar"}
        </CheckButton>
      )}
    </div>
  );
}

export function OrderBody({ q, seed, status, carry, onCheck }: BodyProps<OrderQ>) {
  const n = q.items.length;
  const kept = useMemo(
    () => (carry as { slots?: (number | null)[] } | undefined)?.slots ?? Array.from({ length: n }, () => null),
    [carry, n],
  );
  const pool = useMemo(() => shuffledIndexes(n, `${q.id}:${seed}`), [q, seed, n]);
  const [slots, setSlots] = useState<(number | null)[]>(kept);
  const answering = status === "answering";
  const remaining = pool.filter((i) => !slots.includes(i));
  const nextSlot = slots.findIndex((v) => v === null);
  const allRight = slots.every((v, k) => v === k);

  const place = (i: number) => {
    if (nextSlot < 0) return;
    const next = [...slots];
    next[nextSlot] = i;
    setSlots(next);
  };
  const remove = (k: number) => {
    if (kept[k] !== null) return;
    const next = [...slots];
    next[k] = null;
    setSlots(next);
  };
  const check = () => {
    const right = slots.filter((v, k) => v === k).length;
    onCheck({
      correct: right === n,
      feedback: `${right} de ${n} pasos están en su lugar (en verde). Reordena los demás.`,
      carry: { slots: slots.map((v, k) => (v === k ? v : null)) },
    });
  };

  return (
    <div>
      <ol className="space-y-2">
        {slots.map((v, k) => {
          const filled = v !== null;
          const isKept = kept[k] !== null;
          let cls: string;
          if (showAnswer(status) || status === "wrong") cls = v === k ? "border-ok/70 bg-ok/10" : "border-bad/70 bg-bad/10";
          else if (isKept) cls = "border-ok/60 bg-ok/10";
          else if (filled) cls = "border-primary/50 bg-primary/10";
          else if (k === nextSlot) cls = "border-dashed border-primary/60 bg-surface";
          else cls = "border-dashed border-line bg-surface/40";
          return (
            <li key={k}>
              <button
                type="button"
                disabled={!answering || !filled || isKept}
                onClick={() => remove(k)}
                className={`flex min-h-12 w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left text-[15px] transition ${cls}`}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-3 font-mono text-xs text-muted">
                  {k + 1}
                </span>
                <span className={filled ? "text-ink" : "text-faint"}>
                  {filled ? q.items[v] : k === nextSlot && answering ? "Toca el siguiente paso…" : ""}
                </span>
                {isKept && answering && <Lock className="ml-auto size-3.5 shrink-0 text-ok" aria-label="correcto" />}
                {filled && !isKept && answering && <X className="ml-auto size-4 shrink-0 text-faint" aria-label="quitar" />}
                {(showAnswer(status) || status === "wrong") && filled && (
                  v === k ? (
                    <Check className="ml-auto size-4 shrink-0 text-ok" aria-label="en su lugar" />
                  ) : (
                    <X className="ml-auto size-4 shrink-0 text-bad" aria-label="fuera de lugar" />
                  )
                )}
              </button>
            </li>
          );
        })}
      </ol>
      {answering && remaining.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {remaining.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => place(i)}
              className="rounded-xl border border-line-strong bg-surface-2 px-3 py-2 text-sm text-ink transition hover:border-primary/60 active:scale-95"
            >
              {q.items[i]}
            </button>
          ))}
        </div>
      )}
      {answering && slots.some((v, k) => v !== null && kept[k] === null) && (
        <button
          type="button"
          onClick={() => setSlots(kept)}
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-faint hover:text-muted"
        >
          <RotateCcw className="size-3.5" aria-hidden /> Quitar lo que puse
        </button>
      )}
      {status === "revealed" && !allRight && (
        <div className="mt-3 rounded-2xl border border-ok/40 bg-ok/5 p-3 text-sm">
          <div className="mb-1 text-xs font-semibold tracking-wider text-ok uppercase">Orden correcto</div>
          <ol className="list-decimal space-y-0.5 pl-5 text-ink/90">
            {q.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ol>
        </div>
      )}
      {answering && (
        <CheckButton disabled={nextSlot >= 0} onClick={check}>
          {carry ? "Comprobar de nuevo" : "Comprobar"}
        </CheckButton>
      )}
    </div>
  );
}

export function MatchBody({ q, seed, status, carry, onCheck }: BodyProps<MatchQ>) {
  const lefts = useMemo(() => shuffled(q.pairs.map((_, i) => i), `${q.id}:L:${seed}`), [q, seed]);
  const rights = useMemo(
    () => shuffled(Array.from(new Set(q.pairs.map((p) => p[1]))), `${q.id}:R:${seed}`),
    [q, seed],
  );
  const kept = useMemo(() => (carry as { assign?: Record<number, string> } | undefined)?.assign ?? {}, [carry]);
  const [assign, setAssign] = useState<Record<number, string>>(kept);
  const [open, setOpen] = useState<number | null>(() => lefts.find((i) => kept[i] === undefined) ?? null);
  const answering = status === "answering";
  const complete = lefts.every((i) => assign[i] !== undefined);
  const isRight = (i: number) => assign[i] === q.pairs[i][1];

  const choose = (li: number, r: string) => {
    const next = { ...assign, [li]: r };
    setAssign(next);
    setOpen(lefts.find((i) => next[i] === undefined) ?? null);
  };
  const check = () => {
    const right = lefts.filter(isRight).length;
    onCheck({
      correct: right === lefts.length,
      feedback: `${right} de ${lefts.length} parejas son correctas (en verde). Corrige las demás.`,
      carry: { assign: Object.fromEntries(lefts.filter(isRight).map((i) => [i, assign[i]])) },
    });
  };

  return (
    <div>
      <p className="mb-3 text-xs text-faint">Toca cada elemento y elige su pareja. Una opción puede repetirse.</p>
      <div className="space-y-2">
        {lefts.map((li) => {
          const val = assign[li];
          const isKept = kept[li] !== undefined;
          const isOpen = open === li && answering && !isKept;
          const graded = showAnswer(status) || status === "wrong";
          const tone = graded
            ? isRight(li)
              ? "border-ok/60 bg-ok/10"
              : "border-bad/60 bg-bad/10"
            : isKept
              ? "border-ok/50 bg-ok/8"
              : isOpen
                ? "border-primary/60 bg-surface-2"
                : "border-line bg-surface-2";
          return (
            <div key={li} className={`rounded-2xl border transition ${tone}`}>
              <button
                type="button"
                disabled={!answering || isKept}
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : li)}
                className="flex w-full items-start gap-2 px-3.5 py-3 text-left"
              >
                <span className="flex-1">
                  <span className="block text-[15px] font-semibold text-ink">{q.pairs[li][0]}</span>
                  <span className={`mt-1 block text-sm ${val ? (isKept ? "text-ok" : "text-primary") : "text-faint"}`}>
                    {val ? `→ ${val}` : "Toca para elegir…"}
                  </span>
                </span>
                {isKept && answering && <Lock className="mt-1 size-3.5 shrink-0 text-ok" aria-label="correcto" />}
                {graded && (isRight(li) ? <Check className="mt-1 size-4 text-ok" aria-hidden /> : <X className="mt-1 size-4 text-bad" aria-hidden />)}
              </button>
              {status === "revealed" && !isRight(li) && (
                <div className="px-3.5 pb-3 text-sm text-ok">Correcto: {q.pairs[li][1]}</div>
              )}
              {isOpen && (
                <div className="grid gap-1.5 border-t border-line p-2">
                  {rights.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => choose(li, r)}
                      className={`rounded-xl px-3 py-2.5 text-left text-sm transition ${
                        val === r ? "bg-primary/20 text-ink" : "bg-surface-3/70 text-muted hover:text-ink"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {answering && (
        <CheckButton disabled={!complete} onClick={check}>
          {carry ? "Comprobar de nuevo" : "Comprobar"}
        </CheckButton>
      )}
    </div>
  );
}

export function FillBody({ q, seed, status, carry, onCheck }: BodyProps<FillQ>) {
  const parts = useMemo(() => q.text.split("___"), [q]);
  const blanks = parts.length - 1;
  const bank = useMemo(
    () => shuffled([...q.answers, ...q.bank].map((w, i) => ({ w, i })), `${q.id}:${seed}`),
    [q, seed],
  );
  const kept = useMemo(
    () => (carry as { filled?: (number | null)[] } | undefined)?.filled ?? Array.from({ length: blanks }, () => null),
    [carry, blanks],
  );
  const [filled, setFilled] = useState<(number | null)[]>(kept);
  const [active, setActive] = useState(() => Math.max(0, kept.findIndex((x) => x === null)));
  const answering = status === "answering";
  const wordOf = (bi: number) => bank.find((b) => b.i === bi)?.w ?? "";
  const isRight = (k: number) => filled[k] !== null && wordOf(filled[k] as number) === q.answers[k];

  const place = (bi: number) => {
    const target = filled[active] === null ? active : filled.findIndex((x) => x === null);
    if (target < 0) return;
    const next = [...filled];
    next[target] = bi;
    setFilled(next);
    const nextEmpty = next.findIndex((x) => x === null);
    setActive(nextEmpty < 0 ? target : nextEmpty);
  };
  const clear = (k: number) => {
    if (kept[k] !== null) return;
    const next = [...filled];
    next[k] = null;
    setFilled(next);
    setActive(k);
  };
  const check = () => {
    const right = filled.filter((_, k) => isRight(k)).length;
    onCheck({
      correct: right === blanks,
      feedback: `${right} de ${blanks} espacios están bien (en verde). Cambia los demás.`,
      carry: { filled: filled.map((v, k) => (isRight(k) ? v : null)) },
    });
  };

  return (
    <div>
      <p className="rounded-2xl border border-line bg-surface-2 p-4 text-[16px] leading-[2.3] text-ink">
        {parts.map((p, k) => (
          <Fragment key={k}>
            {p}
            {k < blanks && (
              <button
                type="button"
                disabled={!answering || kept[k] !== null}
                onClick={() => (filled[k] !== null ? clear(k) : setActive(k))}
                className={`mx-0.5 inline-flex min-w-[4.5rem] items-center justify-center rounded-lg border px-2 py-0.5 align-middle text-[15px] leading-7 font-semibold transition ${
                  showAnswer(status) || status === "wrong"
                    ? isRight(k)
                      ? "border-ok/70 bg-ok/15 text-ok"
                      : "border-bad/70 bg-bad/15 text-bad"
                    : kept[k] !== null
                      ? "border-ok/60 bg-ok/10 text-ok"
                      : filled[k] !== null
                        ? "border-primary/60 bg-primary/15 text-primary"
                        : active === k
                          ? "border-dashed border-primary bg-primary/5 text-faint"
                          : "border-dashed border-line-strong text-faint"
                }`}
              >
                {filled[k] !== null ? wordOf(filled[k] as number) : `${k + 1}`}
              </button>
            )}
          </Fragment>
        ))}
      </p>
      {status === "revealed" && !filled.every((_, k) => isRight(k)) && (
        <p className="mt-3 text-sm text-ok">Respuesta: {q.answers.join(" · ")}</p>
      )}
      {answering && (
        <div className="mt-4 flex flex-wrap gap-2">
          {bank.map((b) =>
            filled.includes(b.i) ? null : (
              <button
                key={b.i}
                type="button"
                onClick={() => place(b.i)}
                className="rounded-xl border border-line-strong bg-surface-2 px-3 py-2 text-sm text-ink transition hover:border-primary/60 active:scale-95"
              >
                {b.w}
              </button>
            ),
          )}
        </div>
      )}
      {answering && (
        <CheckButton disabled={filled.some((x) => x === null)} onClick={check}>
          {carry ? "Comprobar de nuevo" : "Comprobar"}
        </CheckButton>
      )}
    </div>
  );
}

export function OpenBody({ q, status, onCheck }: BodyProps<OpenQ>) {
  const [text, setText] = useState("");
  const [shown, setShown] = useState(false);
  const [checks, setChecks] = useState<boolean[]>(() => q.keyPoints.map(() => false));
  const score = checks.filter(Boolean).length;
  const answering = status === "answering";
  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        readOnly={shown}
        rows={5}
        placeholder="Escribe tu respuesta (o dila en voz alta / en papel) y luego compárala…"
        className="w-full rounded-2xl border border-line bg-surface-2 p-3.5 text-[15px] leading-relaxed text-ink placeholder:text-faint focus:border-primary focus:outline-none"
      />
      {!shown ? (
        <CheckButton onClick={() => setShown(true)}>Ver respuesta modelo</CheckButton>
      ) : (
        <div className="mt-4 animate-fade-up space-y-3">
          <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4">
            <div className="text-xs font-semibold tracking-wider text-accent uppercase">Respuesta modelo</div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{q.model}</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface-2 p-4">
            <div className="text-sm font-semibold text-ink">Autoevaluación: ¿tu respuesta incluía…?</div>
            <ul className="mt-3 space-y-2.5">
              {q.keyPoints.map((kp, i) => (
                <li key={kp}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checks[i]}
                    disabled={!answering}
                    onClick={() => setChecks((c) => c.map((v, j) => (j === i ? !v : v)))}
                    className="flex w-full items-start gap-3 text-left text-sm text-muted"
                  >
                    <span
                      className={`mt-px grid size-5 shrink-0 place-items-center rounded-md border-2 transition ${
                        checks[i] ? "border-ok bg-ok text-bg" : "border-line-strong"
                      }`}
                    >
                      {checks[i] && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
                    </span>
                    <span className={checks[i] ? "text-ink" : ""}>{kp}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3 text-xs text-faint">
              {score}/{q.keyPoints.length} puntos clave · se cuenta como correcta con el 70 %
            </div>
          </div>
          {answering && (
            <CheckButton onClick={() => onCheck({ correct: score / q.keyPoints.length >= 0.7 })}>
              Guardar autoevaluación
            </CheckButton>
          )}
        </div>
      )}
    </div>
  );
}
