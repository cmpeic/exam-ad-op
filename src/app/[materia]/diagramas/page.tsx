import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { DiagramBadge } from "@/components/DiagramBadge";
import { Icon } from "@/components/Icon";
import { PageHeader, SequenceChips } from "@/components/ui";
import { getSubject } from "@/data/subjects";
import type { Diagram } from "@/data/types";
import { subjectFromParams } from "@/lib/subject-page";

export async function generateMetadata(props: PageProps<"/[materia]/diagramas">): Promise<Metadata> {
  const { materia } = await props.params;
  return { title: `Diagramas · ${getSubject(materia)?.short ?? ""}` };
}

const KIND_LABEL: Record<Diagram["kind"], string> = {
  flow: "Flujo",
  infinity: "Ciclo",
  tree: "Árbol",
  pairs: "Tabla",
};

export default async function DiagramasPage(props: PageProps<"/[materia]/diagramas">) {
  const s = await subjectFromParams(props.params);
  const sorted = [...s.diagrams].sort((a, b) => Number(!!b.key) - Number(!!a.key));
  return (
    <main>
      <PageHeader
        back={{ href: `/${s.id}`, label: s.name }}
        title="Diagramas"
        subtitle="Cada diagrama se estudia en pasos: verlo y entenderlo, recordarlo con los nombres ocultos y ordenarlo, clasificarlo o emparejarlo de memoria."
      />
      <ul className="space-y-3">
        {sorted.map((d) => (
          <li key={d.slug}>
            <Link
              href={`/${s.id}/diagramas/${d.slug}`}
              className="block rounded-3xl border border-line bg-surface/80 p-4 transition hover:border-line-strong"
            >
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent/12 text-accent">
                  <Icon name={d.icon} className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-semibold text-ink">{d.title}</span>
                    {d.key && <Star className="size-3.5 fill-warn text-warn" aria-label="Diagrama clave" />}
                  </div>
                  <div className="text-xs text-faint">
                    {KIND_LABEL[d.kind]} · {d.slide}
                  </div>
                </div>
                <DiagramBadge slug={d.slug} />
              </div>
              <div className="mt-3">
                <SequenceChips items={d.short} loop={d.kind === "infinity" || (d.kind === "flow" && !!d.loop)} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex items-center gap-1.5 text-xs text-faint">
        <Star className="size-3.5 fill-warn text-warn" aria-hidden /> = {s.keyTitle.toLowerCase()}.
      </p>
    </main>
  );
}
