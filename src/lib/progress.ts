import { useSyncExternalStore } from "react";

// Progreso del estudiante guardado en localStorage (solo en este dispositivo).

export type QStat = { a: number; c: number; last: 0 | 1 };
export type CardStat = { box: number; last: number };
export type DiagramStat = {
  orderDone?: number;
  orderBest?: number;
  recallBest?: number;
  locateBest?: number;
  toolsBest?: number;
};
export type ExamRecord = { t: number; score: number; total: number; subject?: string };

export type Progress = {
  v: 1;
  checks: Record<string, boolean>;
  questions: Record<string, QStat>;
  cards: Record<string, CardStat>;
  /** Contador de sesiones Leitner por materia. */
  cardSessions: Record<string, number>;
  diagrams: Record<string, DiagramStat>;
  days: string[];
  exams: ExamRecord[];
};

export const EMPTY_PROGRESS: Progress = {
  v: 1,
  checks: {},
  questions: {},
  cards: {},
  cardSessions: {},
  diagrams: {},
  days: [],
  exams: [],
};

const KEY = "repaso-examen:v1";
const OLD_KEY = "cicd-examen:v1";
let state: Progress = EMPTY_PROGRESS;
let loaded = false;
const listeners = new Set<() => void>();

function read(): Progress {
  try {
    // Migra el progreso guardado por la primera versión (solo CI/CD).
    const raw = window.localStorage.getItem(KEY) ?? window.localStorage.getItem(OLD_KEY);
    if (!raw) return EMPTY_PROGRESS;
    const data = JSON.parse(raw) as Partial<Progress> & { cardSession?: number };
    const cardSessions = data.cardSessions ?? (data.cardSession ? { cicd: data.cardSession } : {});
    return { ...EMPTY_PROGRESS, ...data, cardSessions };
  } catch {
    return EMPTY_PROGRESS;
  }
}

function ensureLoaded() {
  if (!loaded && typeof window !== "undefined") {
    state = read();
    loaded = true;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      state = read();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  ensureLoaded();
  return state;
}

function getServerSnapshot() {
  return EMPTY_PROGRESS;
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function update(fn: (p: Progress) => Progress) {
  ensureLoaded();
  state = fn(state);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // almacenamiento lleno o bloqueado: el progreso vive solo en memoria
  }
  emit();
}

export function localDay(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function withStudyDay(p: Progress): Progress {
  const t = localDay();
  if (p.days.includes(t)) return p;
  return { ...p, days: [...p.days, t].slice(-120) };
}

export function recordAnswer(id: string, correct: boolean) {
  update((p) => {
    const prev = p.questions[id] ?? { a: 0, c: 0, last: 0 };
    const next: QStat = { a: prev.a + 1, c: prev.c + (correct ? 1 : 0), last: correct ? 1 : 0 };
    return withStudyDay({ ...p, questions: { ...p.questions, [id]: next } });
  });
}

export function setCheck(key: string, value: boolean) {
  update((p) => withStudyDay({ ...p, checks: { ...p.checks, [key]: value } }));
}

export function startCardSession(subject: string): number {
  let session = 0;
  update((p) => {
    session = (p.cardSessions[subject] ?? 0) + 1;
    return { ...p, cardSessions: { ...p.cardSessions, [subject]: session } };
  });
  return session;
}

export function gradeCard(id: string, box: number, session: number) {
  update((p) => withStudyDay({ ...p, cards: { ...p.cards, [id]: { box, last: session } } }));
}

export function recordDiagram(slug: string, patch: (d: DiagramStat) => DiagramStat) {
  update((p) =>
    withStudyDay({ ...p, diagrams: { ...p.diagrams, [slug]: patch(p.diagrams[slug] ?? {}) } }),
  );
}

export function recordExam(subject: string, score: number, total: number) {
  update((p) =>
    withStudyDay({ ...p, exams: [...p.exams, { t: Date.now(), score, total, subject }].slice(-40) }),
  );
}

export function bestExam(p: Progress, subject: string): number | null {
  const mine = p.exams.filter((e) => (e.subject ?? "cicd") === subject);
  return mine.length ? mine.reduce((b, e) => Math.max(b, e.score / e.total), 0) : null;
}

export function resetProgress() {
  update(() => EMPTY_PROGRESS);
}

// "Hoy" como snapshot externo: en el servidor es null y en el navegador la fecha local.
let cachedToday: string | null = null;
const noopSubscribe = () => () => {};
export function useToday(): string | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => (cachedToday ??= localDay()),
    () => null,
  );
}

export function streakFrom(days: string[], today: string): number {
  const set = new Set(days);
  const d = new Date(`${today}T12:00:00`);
  if (!set.has(today)) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(localDay(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
