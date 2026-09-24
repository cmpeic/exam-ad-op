import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftRight, BookMarked, Brain, Lightbulb, Map as MapIcon, Timer, Workflow } from "lucide-react";
import { InfinityMini } from "@/components/diagrams/InfinityMini";
import { PyramidMini } from "@/components/diagrams/PyramidMini";
import { HomeProgress, KeySequences, StudyPlan } from "@/components/home/HomeWidgets";
import { Rich, SectionTitle } from "@/components/ui";
import { getSubject } from "@/data/subjects";
import { buildIndex } from "@/lib/stats";
import { subjectFromParams } from "@/lib/subject-page";

export async function generateMetadata(props: PageProps<"/[materia]">): Promise<Metadata> {
  const { materia } = await props.params;
  return { title: getSubject(materia)?.name ?? "Materia" };
}

export default async function SubjectHome(props: PageProps<"/[materia]">) {
  const s = await subjectFromParams(props.params);
  const base = `/${s.id}`;
  const index = buildIndex(s);
  const keyItems = s.diagrams
    .filter((d) => d.key)
    .map((d) => ({ slug: d.slug, title: d.title, short: d.short, loop: d.kind === "infinity" || (d.kind === "flow" && !!d.loop) }));
  const mapSlug = s.diagrams.find((d) => d.slug.startsWith("mapa"))?.slug;

  const shortcuts = [
    { href: `${base}/trucos`, title: "Trucos de memoria", desc: "Frases para no olvidar cada secuencia", icon: Lightbulb, tone: "text-accent" },
    { href: `${base}/glosario`, title: "Glosario y resumen", desc: "Todos los términos en un vistazo", icon: BookMarked, tone: "text-primary" },
    ...(mapSlug
      ? [{ href: `${base}/diagramas/${mapSlug}`, title: "Mapa completo", desc: "Todo el tema de principio a fin", icon: MapIcon, tone: "text-ok" }]
      : []),
    { href: `${base}/quiz?modo=examen`, title: "Examen simulado", desc: `${s.exam.size} preguntas · ${s.exam.minutes} minutos`, icon: Timer, tone: "text-warn" },
  ];

  return (
    <main>
      <section className="animate-fade-up">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1 text-xs font-medium text-muted hover:text-ink"
          >
            <ArrowLeftRight className="size-3.5" aria-hidden /> Cambiar materia
          </Link>
          <span className="text-xs text-faint">{s.slides} diapositivas</span>
        </div>
        <h1 className="mt-4 font-display text-[36px] leading-[1.05] font-bold tracking-tight text-ink">
          Domina <span className="text-gradient">{s.name}</span>
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{s.description}</p>
        {s.id === "cicd" ? (
          <InfinityMini className="mx-auto mt-5 w-full max-w-sm" />
        ) : (
          <PyramidMini className="mx-auto mt-5 w-full max-w-xs" />
        )}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link
            href={`${base}/quiz`}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-semibold text-bg shadow-xl shadow-primary/25"
          >
            <Brain className="size-5" aria-hidden /> Empezar quiz
          </Link>
          <Link
            href={`${base}/diagramas`}
            className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface-2 py-3.5 font-semibold text-ink"
          >
            <Workflow className="size-5" aria-hidden /> Diagramas
          </Link>
        </div>
      </section>

      <SectionTitle>Tu progreso</SectionTitle>
      <HomeProgress index={index} />

      <SectionTitle>Plan de estudio</SectionTitle>
      <StudyPlan index={index} exam={s.exam} />

      <SectionTitle>{s.keyTitle}</SectionTitle>
      <KeySequences subject={s.id} items={keyItems} />
      <blockquote className="mt-3 rounded-2xl border-l-4 border-accent bg-accent/5 px-4 py-3 text-sm leading-relaxed text-muted">
        <Rich text={s.keyQuote} />
      </blockquote>

      <SectionTitle>Atajos</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        {shortcuts.map((sc) => {
          const ShortcutIcon = sc.icon;
          return (
            <Link
              key={sc.href}
              href={sc.href}
              className="rounded-2xl border border-line bg-surface/80 p-3.5 transition hover:border-line-strong"
            >
              <ShortcutIcon className={`size-5 ${sc.tone}`} aria-hidden />
              <div className="mt-2 text-sm font-semibold text-ink">{sc.title}</div>
              <div className="text-xs text-muted">{sc.desc}</div>
            </Link>
          );
        })}
      </div>

      <footer className="mt-10 space-y-1 text-center text-xs text-faint">
        <p>
          Basado en la presentación «{s.deck}» · {s.author}.
        </p>
        <p>Tu progreso se guarda solo en este dispositivo.</p>
      </footer>
    </main>
  );
}
