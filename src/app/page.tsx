import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { InfinityMini } from "@/components/diagrams/InfinityMini";
import { PyramidMini } from "@/components/diagrams/PyramidMini";
import { ResetProgress, SubjectProgress } from "@/components/home/HomeWidgets";
import { subjects } from "@/data/subjects";
import { buildIndex } from "@/lib/stats";

export default function Home() {
  return (
    <main>
      <section className="animate-fade-up">
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Repaso para el examen
        </span>
        <h1 className="mt-4 font-display text-[38px] leading-[1.03] font-bold tracking-tight text-ink">
          ¿Qué vas a <span className="text-gradient">estudiar</span> hoy?
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Elige la materia. Cada una tiene temas, diagramas interactivos, quiz con corrección y reintentos, tarjetas y
          trucos de memoria.
        </p>
      </section>

      <ul className="mt-6 space-y-4">
        {subjects.map((s) => (
          <li key={s.id}>
            <Link
              href={`/${s.id}`}
              className="block overflow-hidden rounded-3xl border border-line bg-surface/80 transition hover:border-line-strong"
            >
              <div className="grid h-36 place-items-center bg-linear-to-br from-surface-2 to-bg px-6">
                {s.id === "cicd" ? (
                  <InfinityMini className="h-32 w-full max-w-[280px]" />
                ) : (
                  <PyramidMini className="h-32 w-full max-w-[260px]" />
                )}
              </div>
              <div className="flex items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-faint">
                    {s.slides} diapositivas · {s.questions.length} preguntas
                  </div>
                  <h2 className="mt-0.5 font-display text-xl leading-tight font-bold text-ink">{s.name}</h2>
                  <p className="mt-1 text-[13px] leading-snug text-muted">{s.description}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Estudiar <ChevronRight className="size-4" aria-hidden />
                  </span>
                </div>
                <SubjectProgress index={buildIndex(s)} />
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <footer className="mt-10 space-y-2 text-center text-xs text-faint">
        <p>Basado en las presentaciones del Ing. Jhoel Villarroel.</p>
        <p>Tu progreso se guarda solo en este dispositivo.</p>
        <ResetProgress />
      </footer>
    </main>
  );
}
