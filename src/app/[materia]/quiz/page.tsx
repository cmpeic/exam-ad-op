import type { Metadata } from "next";
import { Suspense } from "react";
import { QuizApp } from "@/components/quiz/QuizApp";
import { getSubject } from "@/data/subjects";
import { subjectFromParams } from "@/lib/subject-page";

export async function generateMetadata(props: PageProps<"/[materia]/quiz">): Promise<Metadata> {
  const { materia } = await props.params;
  return { title: `Quiz · ${getSubject(materia)?.short ?? ""}` };
}

export default async function QuizPage(props: PageProps<"/[materia]/quiz">) {
  const s = await subjectFromParams(props.params);
  return (
    <main>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-surface/60" />}>
        <QuizApp
          subject={{ id: s.id, name: s.name, exam: s.exam }}
          questions={s.questions}
          topics={s.topics.map((t) => ({ slug: t.slug, title: t.title, slide: t.slide, hint: t.mnemonic?.title }))}
        />
      </Suspense>
    </main>
  );
}
