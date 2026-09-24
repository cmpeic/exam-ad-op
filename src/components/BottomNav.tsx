"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Brain, House, Layers, Workflow } from "lucide-react";

export function BottomNav({ subject }: { subject: string }) {
  const pathname = usePathname();
  const base = `/${subject}`;
  const items = [
    { href: base, label: "Inicio", icon: House },
    { href: `${base}/temas`, label: "Temas", icon: BookOpen },
    { href: `${base}/diagramas`, label: "Diagramas", icon: Workflow },
    { href: `${base}/quiz`, label: "Quiz", icon: Brain },
    { href: `${base}/tarjetas`, label: "Tarjetas", icon: Layers },
  ];
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-bg/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {items.map(({ href, label, icon: NavIcon }) => {
          const active = href === base ? pathname === base : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center gap-1 pt-2.5 pb-2 text-[11px] font-medium transition-colors ${
                  active ? "text-primary" : "text-faint hover:text-muted"
                }`}
              >
                {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden />}
                <NavIcon className="size-[22px]" strokeWidth={active ? 2.4 : 1.9} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
