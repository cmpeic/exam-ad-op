import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Icon } from "@/components/Icon";
import { TopicBadge } from "@/components/TopicProgress";
import { PageHeader } from "@/components/ui";
import { getSubject } from "@/data/subjects";
import { subjectFromParams } from "@/lib/subject-page";

export async function generateMetadata(props: PageProps<"/[materia]/temas">): Promise<Metadata> {
  const { materia } = await props.params;
  return { title: `Temas · ${getSubject(materia)?.short ?? ""}` };
}

export default async function TemasPage(props: PageProps<"/[materia]/temas">) {
  const s = await subjectFromParams(props.params);
  return (
    <main>
      <PageHeader
        back={{ href: `/${s.id}`, label: s.name }}
        title="Temas"
        subtitle="Una ficha por diapositiva: lo que dice, la idea clave, un truco para recordarlo, un checklist y una mini práctica con corrección."
      />
      <ol className="space-y-2.5">
        {s.topics.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/${s.id}/temas/${t.slug}`}
              className="flex items-center gap-3 rounded-2xl border border-line bg-surface/80 p-3.5 transition hover:border-line-strong"
            >
              <span className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                <Icon name={t.icon} className="size-5" />
                <span className="absolute -top-1.5 -left-1.5 rounded-md bg-bg px-1 font-mono text-[10px] text-faint ring-1 ring-line">
                  {t.slide}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-ink">{t.title}</span>
                <span className="block truncate text-xs text-muted">{t.short}</span>
              </span>
              <TopicBadge slug={t.slug} total={t.checklist.length} />
              <ChevronRight className="size-4 shrink-0 text-faint" aria-hidden />
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
