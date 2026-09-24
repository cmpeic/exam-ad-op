import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, CircleCheck, CircleX, KeyRound, Workflow } from "lucide-react";
import { MiniQuiz } from "@/components/quiz/MiniQuiz";
import { TopicChecklist } from "@/components/TopicProgress";
import { Card, Chip, MnemonicCard, PageHeader, Rich, SectionTitle, SequenceChips } from "@/components/ui";
import { getSubject } from "@/data/subjects";
import { subjectFromParams } from "@/lib/subject-page";

export const dynamicParams = false;

export function generateStaticParams({ params }: { params: { materia: string } }) {
  return (getSubject(params.materia)?.topics ?? []).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata(props: PageProps<"/[materia]/temas/[slug]">): Promise<Metadata> {
  const { materia, slug } = await props.params;
  return { title: getSubject(materia)?.topics.find((t) => t.slug === slug)?.title ?? "Tema" };
}

export default async function TopicPage(props: PageProps<"/[materia]/temas/[slug]">) {
  const s = await subjectFromParams(props.params);
  const { slug } = await props.params;
  const topic = s.topics.find((t) => t.slug === slug);
  if (!topic) notFound();

  const i = s.topics.indexOf(topic);
  const prev = s.topics[i - 1];
  const next = s.topics[i + 1];
  const diagram = topic.diagram ? s.diagrams.find((d) => d.slug === topic.diagram) : undefined;
  const practice = s.questions.filter((q) => q.topic === topic.slug && q.type !== "open");

  return (
    <main>
      <PageHeader
        back={{ href: `/${s.id}/temas`, label: "Temas" }}
        eyebrow={<Chip tone="accent">{topic.slides ? `Diapositivas ${topic.slides}` : `Diapositiva ${topic.slide}`}</Chip>}
        title={topic.title}
      />

      <Card>
        <div className="mb-2 text-xs font-semibold tracking-wider text-faint uppercase">Lo que dice la diapositiva</div>
        <ul className="space-y-2.5 text-[15px] leading-relaxed text-muted">
          {topic.points.map((pt) => (
            <li key={pt}>
              <Rich text={pt} />
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-3 flex items-start gap-3 rounded-3xl border border-primary/30 bg-primary/10 p-4">
        <KeyRound className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <div>
          <div className="text-xs font-semibold tracking-wider text-primary uppercase">Idea clave</div>
          <p className="mt-1 text-[15px] leading-relaxed text-ink">{topic.keyIdea}</p>
        </div>
      </div>

      {topic.compare && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[topic.compare.left, topic.compare.right].map((col) => (
            <div
              key={col.title}
              className={`rounded-3xl border p-3 ${col.tone === "ok" ? "border-ok/40 bg-ok/5" : "border-bad/40 bg-bad/5"}`}
            >
              <div className={`mb-2 flex items-center gap-1.5 text-sm font-semibold ${col.tone === "ok" ? "text-ok" : "text-bad"}`}>
                {col.tone === "ok" ? <CircleCheck className="size-4" aria-hidden /> : <CircleX className="size-4" aria-hidden />}
                {col.title}
              </div>
              <ol className="space-y-1">
                {col.steps.map((step, k) => (
                  <li key={k} className="text-xs text-muted">
                    {k > 0 && <span className="block text-center text-faint">↓</span>}
                    <span className="block rounded-lg bg-surface-2 px-2 py-1 text-center text-ink/90">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}

      {topic.extra && (
        <Card className="mt-3">
          <div className="mb-2 text-sm font-semibold text-ink">{topic.extra.title}</div>
          <ul className="space-y-2 text-sm leading-relaxed text-muted">
            {topic.extra.items.map((it) => (
              <li key={it} className="flex gap-2">
                <span className="text-accent">•</span>
                <span>
                  <Rich text={it} />
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {topic.mnemonic && (
        <div className="mt-3">
          <MnemonicCard title={topic.mnemonic.title} text={topic.mnemonic.text} />
        </div>
      )}

      {diagram && (
        <Link
          href={`/${s.id}/diagramas/${diagram.slug}`}
          className="mt-3 block rounded-3xl border border-line bg-surface/80 p-4 transition hover:border-line-strong"
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <Workflow className="size-4 text-accent" aria-hidden /> Diagrama: {diagram.title}
            <ChevronRight className="ml-auto size-4 text-faint" aria-hidden />
          </div>
          <SequenceChips items={diagram.short} loop={diagram.kind === "infinity" || (diagram.kind === "flow" && !!diagram.loop)} />
          <div className="mt-3 text-xs text-primary">Abrir el diagrama interactivo →</div>
        </Link>
      )}

      <SectionTitle>Autoevaluación</SectionTitle>
      <TopicChecklist slug={topic.slug} items={topic.checklist} />

      {practice.length > 0 && (
        <>
          <SectionTitle>Compruébalo</SectionTitle>
          <MiniQuiz subjectId={s.id} topic={topic.slug} questions={practice} hint={topic.mnemonic?.title} />
        </>
      )}

      <nav className="mt-8 grid grid-cols-2 gap-2" aria-label="Temas vecinos">
        {prev ? (
          <Link href={`/${s.id}/temas/${prev.slug}`} className="rounded-2xl border border-line bg-surface/80 p-3 text-left">
            <span className="flex items-center gap-1 text-xs text-faint">
              <ChevronLeft className="size-3.5" aria-hidden /> Anterior
            </span>
            <span className="mt-1 block text-sm font-medium text-ink">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/${s.id}/temas/${next.slug}`} className="rounded-2xl border border-line bg-surface/80 p-3 text-right">
            <span className="flex items-center justify-end gap-1 text-xs text-faint">
              Siguiente <ChevronRight className="size-3.5" aria-hidden />
            </span>
            <span className="mt-1 block text-sm font-medium text-ink">{next.title}</span>
          </Link>
        )}
      </nav>
    </main>
  );
}
