import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { DeliveryVsDeployment } from "@/components/diagrams/DeliveryVsDeployment";
import { FlowTrainer } from "@/components/diagrams/FlowTrainer";
import { InfinityTrainer } from "@/components/diagrams/InfinityTrainer";
import { PairsTrainer } from "@/components/diagrams/PairsTrainer";
import { SpicePyramid } from "@/components/diagrams/SpicePyramid";
import { TreeTrainer } from "@/components/diagrams/TreeTrainer";
import { Chip, MnemonicCard, PageHeader, SectionTitle } from "@/components/ui";
import { getSubject } from "@/data/subjects";
import { subjectFromParams } from "@/lib/subject-page";

export const dynamicParams = false;

export function generateStaticParams({ params }: { params: { materia: string } }) {
  return (getSubject(params.materia)?.diagrams ?? []).map((d) => ({ slug: d.slug }));
}

export async function generateMetadata(props: PageProps<"/[materia]/diagramas/[slug]">): Promise<Metadata> {
  const { materia, slug } = await props.params;
  return { title: getSubject(materia)?.diagrams.find((d) => d.slug === slug)?.title ?? "Diagrama" };
}

export default async function DiagramPage(props: PageProps<"/[materia]/diagramas/[slug]">) {
  const s = await subjectFromParams(props.params);
  const { slug } = await props.params;
  const d = s.diagrams.find((x) => x.slug === slug);
  if (!d) notFound();
  const topic = s.topics.find((t) => t.slug === d.topic);

  return (
    <main>
      <PageHeader
        back={{ href: `/${s.id}/diagramas`, label: "Diagramas" }}
        eyebrow={
          <div className="flex flex-wrap gap-2">
            <Chip tone="accent">{d.slide}</Chip>
            {d.key && <Chip tone="warn">★ Diagrama clave</Chip>}
          </div>
        }
        title={d.title}
        subtitle={d.summary}
      />

      {d.kind === "flow" && d.special === "delivery-vs-deployment" && (
        <div className="mb-6">
          <DeliveryVsDeployment />
        </div>
      )}
      {d.kind === "flow" && d.special === "pyramid" && (
        <div className="mb-6">
          <SpicePyramid steps={d.steps} />
        </div>
      )}

      {d.kind === "infinity" && <InfinityTrainer />}
      {d.kind === "flow" && <FlowTrainer d={d} />}
      {d.kind === "tree" && <TreeTrainer d={d} />}
      {d.kind === "pairs" && <PairsTrainer d={d} />}

      {d.mnemonic && (
        <>
          <SectionTitle>Para recordarlo</SectionTitle>
          <MnemonicCard title={d.mnemonic.title} text={d.mnemonic.text} />
        </>
      )}

      {topic && (
        <Link
          href={`/${s.id}/temas/${topic.slug}`}
          className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-surface/80 p-3.5 text-sm transition hover:border-line-strong"
        >
          <BookOpen className="size-4 text-primary" aria-hidden />
          <span className="flex-1 text-muted">
            Tema relacionado: <span className="text-ink">{topic.title}</span>
          </span>
          <span className="text-xs text-faint">Diap. {topic.slides ?? topic.slide}</span>
        </Link>
      )}
    </main>
  );
}
