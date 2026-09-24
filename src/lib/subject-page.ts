import { notFound } from "next/navigation";
import { getSubject } from "@/data/subjects";
import type { Subject } from "@/data/types";

/** Obtiene la materia de la URL (/[materia]/…) o muestra 404. Solo en el servidor. */
export async function subjectFromParams(params: Promise<{ materia: string }>): Promise<Subject> {
  const { materia } = await params;
  const subject = getSubject(materia);
  if (!subject) notFound();
  return subject;
}
