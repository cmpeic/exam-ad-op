import { BottomNav } from "@/components/BottomNav";
import { subjects } from "@/data/subjects";
import { subjectFromParams } from "@/lib/subject-page";

export const dynamicParams = false;

export function generateStaticParams() {
  return subjects.map((s) => ({ materia: s.id }));
}

export default async function SubjectLayout({ children, params }: LayoutProps<"/[materia]">) {
  const subject = await subjectFromParams(params);
  return (
    <>
      {children}
      <BottomNav subject={subject.id} />
    </>
  );
}
