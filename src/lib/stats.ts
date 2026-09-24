import type { Subject } from "@/data/types";
import type { Progress } from "./progress";

/** Identificadores de una materia: lo mínimo que necesitan los widgets de cliente. */
export type SubjectIndex = {
  id: string;
  checkKeys: string[];
  gradable: string[];
  cards: string[];
  diagrams: string[];
};

export function buildIndex(s: Subject): SubjectIndex {
  return {
    id: s.id,
    checkKeys: s.topics.flatMap((t) => t.checklist.map((_, i) => `${t.slug}:${i}`)),
    gradable: s.questions.filter((q) => q.type !== "open").map((q) => q.id),
    cards: s.flashcards.map((c) => c.id),
    diagrams: s.diagrams.map((d) => d.slug),
  };
}

export function topicChecksDone(p: Progress, slug: string, total: number): number {
  let n = 0;
  for (let i = 0; i < total; i++) if (p.checks[`${slug}:${i}`]) n++;
  return n;
}

export function mastery(p: Progress, ix: SubjectIndex) {
  const ratio = (n: number, d: number) => (d ? n / d : 0);
  const checks = ratio(ix.checkKeys.filter((k) => p.checks[k]).length, ix.checkKeys.length);
  const quiz = ratio(ix.gradable.filter((id) => p.questions[id]?.last === 1).length, ix.gradable.length);
  const cards = ratio(
    ix.cards.reduce((acc, id) => acc + Math.max(0, (p.cards[id]?.box ?? 1) - 1) / 4, 0),
    ix.cards.length,
  );
  const diag = ratio(ix.diagrams.filter((slug) => (p.diagrams[slug]?.orderDone ?? 0) > 0).length, ix.diagrams.length);
  return {
    total: checks * 0.25 + quiz * 0.35 + cards * 0.2 + diag * 0.2,
    checks,
    quiz,
    cards,
    diag,
  };
}
