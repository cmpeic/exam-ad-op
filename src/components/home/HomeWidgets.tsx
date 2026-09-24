"use client";

import Link from "next/link";
import { BookOpen, Brain, ChevronRight, CircleCheck, Flame, Layers, Timer, Trophy, Workflow, type LucideIcon } from "lucide-react";
import { bestExam, resetProgress, streakFrom, useProgress, useToday } from "@/lib/progress";
import { mastery, type SubjectIndex } from "@/lib/stats";
import { ProgressRing } from "@/components/ProgressRing";
import { SequenceChips } from "@/components/ui";

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] text-muted">
        <span>{label}</span>
        <span className="font-mono">{Math.round(value * 100)}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full bg-linear-to-r from-primary to-accent transition-all duration-700"
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
    </div>
  );
}

export function HomeProgress({ index }: { index: SubjectIndex }) {
  const p = useProgress();
  const today = useToday();
  const m = mastery(p, index);
  const streak = today ? streakFrom(p.days, today) : 0;
  const answered = index.gradable.filter((id) => p.questions[id]).length;
  const best = bestExam(p, index.id);
  return (
    <div className="rounded-3xl border border-line bg-surface/80 p-4">
      <div className="flex items-center gap-4">
        <ProgressRing value={m.total} size={108} sublabel="dominio" />
        <div className="flex-1 space-y-2">
          <Bar label="Temas (checklist)" value={m.checks} />
          <Bar label="Quiz" value={m.quiz} />
          <Bar label="Tarjetas" value={m.cards} />
          <Bar label="Diagramas" value={m.diag} />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-surface-2 p-2.5">
          <div className="inline-flex items-center gap-1 font-display text-xl font-bold text-warn">
            <Flame className="size-4" aria-hidden /> {streak}
          </div>
          <div className="text-[11px] text-faint">{streak === 1 ? "día seguido" : "días seguidos"}</div>
        </div>
        <div className="rounded-2xl bg-surface-2 p-2.5">
          <div className="font-display text-xl font-bold text-ink">
            {answered}
            <span className="text-sm text-faint">/{index.gradable.length}</span>
          </div>
          <div className="text-[11px] text-faint">preguntas vistas</div>
        </div>
        <div className="rounded-2xl bg-surface-2 p-2.5">
          <div className="inline-flex items-center gap-1 font-display text-xl font-bold text-ok">
            <Trophy className="size-4" aria-hidden /> {best === null ? "–" : Math.round(best * 100)}
          </div>
          <div className="text-[11px] text-faint">mejor examen</div>
        </div>
      </div>
    </div>
  );
}

export function StudyPlan({ index, exam }: { index: SubjectIndex; exam: { size: number; minutes: number } }) {
  const p = useProgress();
  const base = `/${index.id}`;
  const checks = index.checkKeys.filter((k) => p.checks[k]).length;
  const diagDone = index.diagrams.filter((slug) => (p.diagrams[slug]?.orderDone ?? 0) > 0).length;
  const cardsMastered = index.cards.filter((id) => (p.cards[id]?.box ?? 0) >= 4).length;
  const right = index.gradable.filter((id) => p.questions[id]?.last === 1).length;
  const best = bestExam(p, index.id);

  const steps: { href: string; icon: LucideIcon; title: string; desc: string; done: number; total: number }[] = [
    { href: `${base}/temas`, icon: BookOpen, title: "Lee los temas y marca tu checklist", desc: "Lo que dice cada diapositiva + idea clave + truco.", done: checks, total: index.checkKeys.length },
    { href: `${base}/diagramas`, icon: Workflow, title: "Domina los diagramas", desc: "Recorre, recuerda, ordena y clasifica.", done: diagDone, total: index.diagrams.length },
    { href: `${base}/tarjetas`, icon: Layers, title: "Repasa con tarjetas", desc: "Repetición espaciada: cajas 4–5 = dominadas.", done: cardsMastered, total: index.cards.length },
    { href: `${base}/quiz`, icon: Brain, title: "Practica con el quiz", desc: "Con corrección y reintentos cuando fallas.", done: right, total: index.gradable.length },
    { href: `${base}/quiz?modo=examen`, icon: Timer, title: "Haz un examen simulado", desc: `${exam.size} preguntas en ${exam.minutes} minutos. Meta: 90 o más.`, done: best === null ? 0 : Math.round(best * 100), total: 100 },
  ];

  return (
    <ol className="space-y-2">
      {steps.map((s, i) => {
        const complete = s.done >= s.total * (i === 4 ? 0.9 : 1);
        const StepIcon = s.icon;
        return (
          <li key={s.href}>
            <Link
              href={s.href}
              className="flex items-center gap-3 rounded-2xl border border-line bg-surface/80 p-3 transition hover:border-line-strong"
            >
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                  complete ? "bg-ok/15 text-ok" : "bg-surface-3 text-primary"
                }`}
              >
                {complete ? <CircleCheck className="size-5" aria-hidden /> : <StepIcon className="size-5" aria-hidden />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-ink">
                  <span className="mr-1 font-mono text-xs text-faint">{i + 1}.</span>
                  {s.title}
                </span>
                <span className="block text-xs text-muted">{s.desc}</span>
              </span>
              <span className="font-mono text-xs text-faint">
                {i === 4 ? (best === null ? "–" : `${s.done}`) : `${s.done}/${s.total}`}
              </span>
              <ChevronRight className="size-4 text-faint" aria-hidden />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export type KeyDiagramRef = { slug: string; title: string; short: string[]; loop: boolean };

export function KeySequences({ subject, items }: { subject: string; items: KeyDiagramRef[] }) {
  const p = useProgress();
  return (
    <ul className="space-y-2.5">
      {items.map((d) => {
        const stat = p.diagrams[d.slug];
        const status =
          stat?.orderDone && stat.orderBest === 0
            ? { text: "Dominado", cls: "text-ok" }
            : stat?.orderDone
              ? { text: `Mejor: ${stat.orderBest} ${stat.orderBest === 1 ? "error" : "errores"}`, cls: "text-warn" }
              : { text: "Sin practicar", cls: "text-faint" };
        return (
          <li key={d.slug}>
            <Link
              href={`/${subject}/diagramas/${d.slug}`}
              className="block rounded-2xl border border-line bg-surface/80 p-3.5 transition hover:border-line-strong"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-semibold text-ink">{d.title}</span>
                <span className={`shrink-0 text-xs font-medium ${status.cls}`}>{status.text}</span>
              </div>
              <SequenceChips items={d.short} loop={d.loop} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Progreso resumido de una materia (tarjetas del selector de materias). */
export function SubjectProgress({ index }: { index: SubjectIndex }) {
  const p = useProgress();
  const m = mastery(p, index);
  return <ProgressRing value={m.total} size={72} stroke={7} sublabel="dominio" />;
}

export function ResetProgress() {
  return (
    <button
      type="button"
      onClick={() => {
        if (window.confirm("¿Borrar todo tu progreso guardado en este dispositivo (todas las materias)? No se puede deshacer.")) {
          resetProgress();
        }
      }}
      className="text-xs text-faint underline-offset-4 hover:text-bad hover:underline"
    >
      Reiniciar mi progreso
    </button>
  );
}
