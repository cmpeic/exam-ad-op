import type { Question } from "@/data/types";

export const QUESTION_TYPE_LABEL: Record<Question["type"], string> = {
  single: "Opción múltiple",
  multi: "Marca todas las correctas",
  tf: "Verdadero o falso",
  order: "Ordena la secuencia",
  match: "Relaciona",
  fill: "Completa",
  open: "Pregunta abierta",
};

export function answerText(q: Question): string {
  switch (q.type) {
    case "single":
      return q.options[q.answer];
    case "multi":
      return q.answers.map((i) => q.options[i]).join(" · ");
    case "tf":
      return q.answer ? "Verdadero" : "Falso";
    case "order":
      return q.items.join(" → ");
    case "match":
      return q.pairs.map(([a, b]) => `${a} → ${b}`).join(" · ");
    case "fill":
      return q.answers.join(" · ");
    case "open":
      return q.model;
  }
}
