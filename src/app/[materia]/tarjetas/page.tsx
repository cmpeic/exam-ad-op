import type { Metadata } from "next";
import { FlashcardsApp } from "@/components/FlashcardsApp";
import { getSubject } from "@/data/subjects";
import { subjectFromParams } from "@/lib/subject-page";

export async function generateMetadata(props: PageProps<"/[materia]/tarjetas">): Promise<Metadata> {
  const { materia } = await props.params;
  return { title: `Tarjetas · ${getSubject(materia)?.short ?? ""}` };
}

export default async function TarjetasPage(props: PageProps<"/[materia]/tarjetas">) {
  const s = await subjectFromParams(props.params);
  return (
    <main>
      <FlashcardsApp
        subjectId={s.id}
        flashcards={s.flashcards}
        topics={s.topics.map((t) => ({ slug: t.slug, title: t.title }))}
      />
    </main>
  );
}
