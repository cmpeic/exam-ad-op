import { diagrams as calidadDiagrams } from "./calidad/diagrams";
import { flashcards as calidadFlashcards } from "./calidad/flashcards";
import { glossary as calidadGlossary, glossaryCats as calidadGlossaryCats } from "./calidad/glossary";
import { questions as calidadQuestions } from "./calidad/questions";
import { topics as calidadTopics } from "./calidad/topics";
import { tricks as calidadTricks } from "./calidad/tricks";
import { diagrams as cicdDiagrams } from "./cicd/diagrams";
import { flashcards as cicdFlashcards } from "./cicd/flashcards";
import { glossary as cicdGlossary } from "./cicd/glossary";
import { questions as cicdQuestions } from "./cicd/questions";
import { topics as cicdTopics } from "./cicd/topics";
import { tricks as cicdTricks } from "./cicd/tricks";
import type { Subject } from "./types";

// Solo para componentes de servidor: los componentes de cliente reciben por
// props únicamente los datos de la materia que muestran.

export const subjects: Subject[] = [
  {
    id: "cicd",
    name: "CI/CD",
    short: "CI/CD",
    description: "Integración continua, pipeline, entrega y despliegue continuo, etapas, herramientas y el ciclo infinito.",
    deck: "CI/CD",
    author: "Ing. Jhoel Villarroel",
    slides: 14,
    icon: "infinity",
    accent: "#a78bfa",
    topics: cicdTopics,
    diagrams: cicdDiagrams,
    questions: cicdQuestions,
    flashcards: cicdFlashcards,
    tricks: cicdTricks,
    glossary: cicdGlossary,
    glossaryCats: ["Conceptos", "Flujo", "Pruebas", "Entornos", "Herramientas"],
    highlights: {
      title: "La pregunta que responde cada práctica",
      items: [
        { q: "¿El código nuevo funciona junto al existente?", a: "Integración continua" },
        { q: "¿Tenemos una versión lista? (una persona aprueba el paso a producción)", a: "Entrega / distribución continua" },
        { q: "¿La ponemos automáticamente en producción?", a: "Despliegue / implementación continua" },
        { q: "Entregar vs. desplegar", a: "Tener el software listo vs. ponerlo en producción" },
      ],
    },
    keyTitle: "Las 4 secuencias que debes dibujar de memoria",
    keyQuote:
      "Si puedes explicar **qué sucede en cada flecha**, ya no estás memorizando la presentación: estás entendiendo el proceso completo.",
    exam: { size: 25, minutes: 20 },
  },
  {
    id: "calidad",
    name: "Aseguramiento de la Calidad",
    short: "Calidad",
    description: "Calidad, normas ISO, ISO 9000, SPICE, proceso de mejora, McCall, calidad interna y externa y SQA.",
    deck: "Aseguramiento de la Calidad del Software",
    author: "Ing. Jhoel C. Villarroel Claros",
    slides: 47,
    icon: "shield-check",
    accent: "#34d399",
    topics: calidadTopics,
    diagrams: calidadDiagrams,
    questions: calidadQuestions,
    flashcards: calidadFlashcards,
    tricks: calidadTricks,
    glossary: calidadGlossary,
    glossaryCats: calidadGlossaryCats,
    highlights: {
      title: "No confundas",
      items: [
        { q: "N / P / L / F", a: "Logro de los atributos (no es el nivel)" },
        { q: "Niveles 0 a 5", a: "Capacidad del proceso (Incompleto → En optimización)" },
        { q: "Tener ISO 9000", a: "No demuestra por sí solo la calidad de cada producto" },
        { q: "ISO 9000-3 frente a ISO 9001", a: "No añade ni cambia requisitos: los amplía y aclara" },
        { q: "SPICE", a: "Es un marco para métodos de evaluación, no un método" },
        { q: "¿Cuándo se diseña el SQA?", a: "Antes de desarrollar, no después" },
        { q: "Interoperabilidad", a: "McCall: transición · Árbol de calidad: funcionalidad" },
      ],
    },
    keyTitle: "Los 5 diagramas que más te conviene memorizar",
    keyQuote:
      "Qué es calidad → cómo se **normaliza** → cómo se **evalúan** los procesos → cómo se **mejora** → cómo se **mide** la calidad del producto → cómo se **asegura** durante el desarrollo.",
    exam: { size: 30, minutes: 25 },
  },
];

export function getSubject(id: string): Subject | undefined {
  return subjects.find((s) => s.id === id);
}
