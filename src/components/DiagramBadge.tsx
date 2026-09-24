"use client";

import { Check } from "lucide-react";
import { useProgress } from "@/lib/progress";

export function DiagramBadge({ slug }: { slug: string }) {
  const stat = useProgress().diagrams[slug];
  if (!stat?.orderDone) {
    return <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[11px] text-faint">Sin practicar</span>;
  }
  if (stat.orderBest === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-ok/15 px-2 py-0.5 text-[11px] font-semibold text-ok">
        <Check className="size-3" strokeWidth={3} aria-hidden /> Dominado
      </span>
    );
  }
  return (
    <span className="rounded-full bg-warn/15 px-2 py-0.5 text-[11px] font-medium text-warn">
      Mejor: {stat.orderBest} {stat.orderBest === 1 ? "error" : "errores"}
    </span>
  );
}
