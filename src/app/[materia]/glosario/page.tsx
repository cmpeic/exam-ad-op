import type { Metadata } from "next";
import { GlossarySearch } from "@/components/GlossarySearch";
import { PageHeader } from "@/components/ui";
import { getSubject } from "@/data/subjects";
import { subjectFromParams } from "@/lib/subject-page";

export async function generateMetadata(props: PageProps<"/[materia]/glosario">): Promise<Metadata> {
  const { materia } = await props.params;
  return { title: `Glosario · ${getSubject(materia)?.short ?? ""}` };
}

export default async function GlosarioPage(props: PageProps<"/[materia]/glosario">) {
  const s = await subjectFromParams(props.params);
  return (
    <main>
      <PageHeader
        back={{ href: `/${s.id}`, label: s.name }}
        title="Glosario y resumen"
        subtitle="Todos los términos de la presentación, con búsqueda. Arriba, lo que más se confunde en el examen."
      />

      <section className="rounded-3xl border border-primary/30 bg-primary/8 p-4">
        <h2 className="font-display text-lg font-semibold text-ink">{s.highlights.title}</h2>
        <ul className="mt-3 space-y-2">
          {s.highlights.items.map((d) => (
            <li key={d.q} className="rounded-2xl bg-bg/40 p-3">
              <div className="text-sm text-muted">{d.q}</div>
              <div className="mt-1 font-semibold text-ink">→ {d.a}</div>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6">
        <GlossarySearch glossary={s.glossary} cats={s.glossaryCats} />
      </div>
    </main>
  );
}
