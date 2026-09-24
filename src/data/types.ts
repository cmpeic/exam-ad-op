export interface Mnemonic {
  title: string;
  text: string;
}

export interface CompareCol {
  title: string;
  tone: "ok" | "bad";
  steps: string[];
}

export interface Topic {
  slug: string;
  slide: number;
  /** Rango mostrado cuando el tema abarca varias diapositivas (p. ej. "33–35"). */
  slides?: string;
  title: string;
  short: string;
  icon: string;
  /** Lo que dice la diapositiva (admite **negrita** y ==resaltado==). */
  points: string[];
  keyIdea: string;
  extra?: { title: string; items: string[] };
  compare?: { left: CompareCol; right: CompareCol };
  mnemonic?: Mnemonic;
  diagram?: string;
  /** Autoevaluación: "puedo…" */
  checklist: string[];
}

interface QBase {
  id: string;
  topic: string;
  slide: number;
  prompt: string;
  explain: string;
}

export interface SingleQ extends QBase {
  type: "single";
  options: string[];
  answer: number;
}
export interface MultiQ extends QBase {
  type: "multi";
  options: string[];
  answers: number[];
}
export interface TFQ extends QBase {
  type: "tf";
  answer: boolean;
}
export interface OrderQ extends QBase {
  type: "order";
  items: string[];
}
export interface MatchQ extends QBase {
  type: "match";
  pairs: [string, string][];
}
export interface FillQ extends QBase {
  type: "fill";
  /** Cada ___ es un espacio; `answers` en el mismo orden. */
  text: string;
  answers: string[];
  bank: string[];
}
export interface OpenQ extends QBase {
  type: "open";
  model: string;
  keyPoints: string[];
}

export type Question = SingleQ | MultiQ | TFQ | OrderQ | MatchQ | FillQ | OpenQ;
export type QuestionType = Question["type"];

// ——— Diagramas ———

interface DiagramBase {
  slug: string;
  title: string;
  slide: string;
  icon: string;
  summary: string;
  topic: string;
  /** Vista previa compacta (chips). */
  short: string[];
  mnemonic?: Mnemonic;
  /** Uno de los diagramas que conviene poder dibujar de memoria. */
  key?: boolean;
}

export interface FlowStep {
  id: string;
  label: string;
  sub?: string;
  icon: string;
  color: string;
  /** ¿Qué pasa aquí? */
  detail: string;
  /** ¿Qué pasa en la flecha hacia el siguiente paso? */
  arrow?: string;
  group?: string;
}

export interface FlowDiagram extends DiagramBase {
  kind: "flow" | "infinity";
  steps: FlowStep[];
  chunks?: { label: string; start: number; end: number }[];
  groups?: { id: string; label: string; color: string }[];
  special?: "delivery-vs-deployment" | "pyramid";
  /** Número del primer paso (la pirámide SPICE empieza en 0). */
  numberFrom?: number;
  /** El último paso vuelve al primero (ciclo). */
  loop?: boolean;
}

export interface TreeLeaf {
  id: string;
  label: string;
  detail?: string;
  /** Pregunta cuya respuesta es este elemento (modo «Preguntas»). */
  ask?: string;
}

export interface TreeCategory {
  id: string;
  label: string;
  sub?: string;
  color: string;
  leaves: TreeLeaf[];
}

export interface TreeDiagram extends DiagramBase {
  kind: "tree";
  root: string;
  categories: TreeCategory[];
  /** Texto de la consigna del modo «Preguntas». */
  askLabel?: string;
}

export interface PairItem {
  key: string;
  value: string;
  note?: string;
  group?: string;
}

export interface PairsDiagram extends DiagramBase {
  kind: "pairs";
  keyLabel: string;
  valueLabel: string;
  pairs: PairItem[];
}

export type Diagram = FlowDiagram | TreeDiagram | PairsDiagram;

export interface Tool {
  name: string;
  desc: string;
}

export interface Phase {
  id: string;
  label: string;
  es: string;
  color: string;
  side: "ci" | "cd" | "puente";
  sideLabel: string;
  icon: string;
  detail: string;
  hook: string;
  tools: Tool[];
}

export interface Flashcard {
  id: string;
  topic: string;
  front: string;
  back: string;
  hint?: string;
}

export interface Trick {
  id: string;
  title: string;
  target: string;
  sequence?: string[];
  phrase: string;
  explain: string;
  /** Ruta dentro de la materia, p. ej. "/diagramas/ciclo-infinito". */
  href?: string;
  slide: string;
}

export interface Term {
  term: string;
  def: string;
  cat: string;
}

export interface Highlights {
  title: string;
  items: { q: string; a: string }[];
}

export interface Subject {
  id: string;
  name: string;
  short: string;
  description: string;
  deck: string;
  author: string;
  slides: number;
  icon: string;
  accent: string;
  topics: Topic[];
  diagrams: Diagram[];
  questions: Question[];
  flashcards: Flashcard[];
  tricks: Trick[];
  glossary: Term[];
  glossaryCats: string[];
  highlights: Highlights;
  keyTitle: string;
  keyQuote: string;
  exam: { size: number; minutes: number };
}
