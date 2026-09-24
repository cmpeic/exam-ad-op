// Constructores compactos para escribir el banco de preguntas.
import type {
  FillQ,
  MatchQ,
  MultiQ,
  OpenQ,
  OrderQ,
  SingleQ,
  TFQ,
} from "./types";

// En opción múltiple la respuesta correcta se escribe primero; la app baraja
// las opciones al mostrarlas.
export const s = (
  id: string,
  topic: string,
  slide: number,
  prompt: string,
  correct: string,
  wrong: string[],
  explain: string,
): SingleQ => ({ id, type: "single", topic, slide, prompt, options: [correct, ...wrong], answer: 0, explain });

export const m = (
  id: string,
  topic: string,
  slide: number,
  prompt: string,
  corrects: string[],
  wrongs: string[],
  explain: string,
): MultiQ => ({
  id,
  type: "multi",
  topic,
  slide,
  prompt,
  options: [...corrects, ...wrongs],
  answers: corrects.map((_, i) => i),
  explain,
});

export const tf = (id: string, topic: string, slide: number, prompt: string, answer: boolean, explain: string): TFQ => ({
  id,
  type: "tf",
  topic,
  slide,
  prompt,
  answer,
  explain,
});

export const ord = (id: string, topic: string, slide: number, prompt: string, items: string[], explain: string): OrderQ => ({
  id,
  type: "order",
  topic,
  slide,
  prompt,
  items,
  explain,
});

export const mt = (
  id: string,
  topic: string,
  slide: number,
  prompt: string,
  pairs: [string, string][],
  explain: string,
): MatchQ => ({ id, type: "match", topic, slide, prompt, pairs, explain });

export const fl = (
  id: string,
  topic: string,
  slide: number,
  text: string,
  answers: string[],
  bank: string[],
  explain: string,
): FillQ => ({ id, type: "fill", topic, slide, prompt: "Completa los espacios:", text, answers, bank, explain });

export const op = (
  id: string,
  topic: string,
  slide: number,
  prompt: string,
  model: string,
  keyPoints: string[],
): OpenQ => ({ id, type: "open", topic, slide, prompt, model, keyPoints, explain: model });

