import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Lightbulb } from "lucide-react";
import { PageHeader, Rich, SequenceChips } from "@/components/ui";
import { getSubject } from "@/data/subjects";
import { subjectFromParams } from "@/lib/subject-page";

export async function generateMetadata(props: PageProps<"/[materia]/trucos">): Promise<Metadata> {
  const { materia } = await props.params;
  return { title: `Trucos de memoria · ${getSubject(materia)?.short ?? ""}` };
}

const METHODS = [
  { t: "Acrósticos", d: "Una frase cuyas iniciales son los pasos en orden." },
  { t: "Agrupar (chunking)", d: "Muchos pasos se recuerdan mejor en grupos pequeños." },
  { t: "Analogías", d: "Teatro, pizza, mudanza, cinturón de seguridad: conectan lo nuevo con lo que ya sabes." },
  { t: "Recuperación activa", d: "Decirlo de memoria antes de mirar (quiz, tarjetas, modos Recordar y Ordenar)." },
  { t: "Retroalimentación inmediata", d: "Al fallar ves qué está mal y lo vuelves a intentar." },
  { t: "Repetición espaciada", d: "Repasar justo antes de olvidar (cajas Leitner)." },
  { t: "Doble codificación", d: "Palabra + imagen: cada paso tiene color e ícono en los diagramas." },
];

export default async function TrucosPage(props: PageProps<"/[materia]/trucos">) {
  const s = await subjectFromParams(props.params);
  return (
    <main>
      <PageHeader
        back={{ href: `/${s.id}`, label: s.name }}
        title="Trucos de memoria"
        subtitle="Frases y analogías para no olvidar el orden de cada diagrama ni las listas de la presentación. Léelas en voz alta."
      />

      <ul className="space-y-3">
        {s.tricks.map((t) => (
          <li key={t.id} className="rounded-3xl border border-line bg-surface/80 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold tracking-wider text-accent uppercase">{t.title}</span>
              <span className="shrink-0 text-[11px] text-faint">{t.slide}</span>
            </div>
            <p className="mt-2 font-display text-xl leading-snug font-semibold text-ink">
              <Rich text={t.phrase} />
            </p>
            <p className="mt-1 text-xs text-faint">{t.target}</p>
            {t.sequence && (
              <div className="mt-3">
                <SequenceChips items={t.sequence} />
              </div>
            )}
            <p className="mt-3 text-sm leading-relaxed text-muted">
              <Rich text={t.explain} />
            </p>
            {t.href && (
              <Link href={`/${s.id}${t.href}`} className="mt-3 inline-flex items-center gap-1 text-sm text-primary">
                Practicarlo <ChevronRight className="size-4" aria-hidden />
              </Link>
            )}
          </li>
        ))}
      </ul>

      <section className="mt-8 rounded-3xl border border-line bg-surface/60 p-4">
        <div className="flex items-center gap-2 font-semibold text-ink">
          <Lightbulb className="size-4 text-warn" aria-hidden /> Los métodos que usa esta app
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          {METHODS.map((m) => (
            <li key={m.t}>
              <span className="font-medium text-ink">{m.t}:</span> <span className="text-muted">{m.d}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
