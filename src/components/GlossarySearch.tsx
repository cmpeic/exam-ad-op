"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import type { Term } from "@/data/types";

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function GlossarySearch({ glossary, cats }: { glossary: Term[]; cats: string[] }) {
  const [q, setQ] = useState("");
  const needle = norm(q.trim());
  const list = needle
    ? glossary.filter((t) => norm(t.term).includes(needle) || norm(t.def).includes(needle))
    : glossary;

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">Buscar en el glosario</span>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar: staging, trigger, Jenkins…"
          className="w-full rounded-2xl border border-line bg-surface-2 py-3 pr-10 pl-10 text-[15px] text-ink placeholder:text-faint focus:border-primary focus:outline-none"
        />
        {q && (
          <button
            type="button"
            aria-label="Borrar búsqueda"
            onClick={() => setQ("")}
            className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-faint"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </label>

      {list.length === 0 && <p className="mt-6 text-center text-sm text-faint">Sin resultados para «{q}».</p>}

      {cats.map((cat) => {
        const items = list.filter((t) => t.cat === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat} className="mt-6">
            <h2 className="mb-2 text-xs font-semibold tracking-wider text-accent uppercase">{cat}</h2>
            <dl className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface/80">
              {items.map((t) => (
                <div key={t.term} className="px-4 py-3">
                  <dt className="font-semibold text-ink">{t.term}</dt>
                  <dd className="mt-0.5 text-sm leading-relaxed text-muted">{t.def}</dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}
    </div>
  );
}
