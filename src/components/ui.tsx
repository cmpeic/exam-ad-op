import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { ChevronLeft, Lightbulb } from "lucide-react";

const TOKEN = /(\*\*[^*]+?\*\*|==[^=]+?==|`[^`]+?`)/g;

/** Texto enriquecido mínimo: **negrita**, ==resaltado== y `código`. Respeta saltos de línea. */
export function Rich({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {line.split(TOKEN).map((p, i) => {
            if (p.length > 4 && p.startsWith("**") && p.endsWith("**")) {
              return (
                <strong key={i} className="font-semibold text-ink">
                  {p.slice(2, -2)}
                </strong>
              );
            }
            if (p.length > 4 && p.startsWith("==") && p.endsWith("==")) {
              return (
                <mark key={i} className="rounded-[4px] bg-accent/15 px-[2px] font-bold text-accent">
                  {p.slice(2, -2)}
                </mark>
              );
            }
            if (p.length > 2 && p.startsWith("`") && p.endsWith("`")) {
              return (
                <code key={i} className="rounded bg-surface-3 px-1 py-0.5 font-mono text-[0.85em] text-ink">
                  {p.slice(1, -1)}
                </code>
              );
            }
            return <Fragment key={i}>{p}</Fragment>;
          })}
        </Fragment>
      ))}
    </>
  );
}

export function Chip({
  children,
  tone = "default",
  className = "",
}: {
  children: ReactNode;
  tone?: "default" | "primary" | "accent" | "ok" | "bad" | "warn";
  className?: string;
}) {
  const tones = {
    default: "border-line bg-surface-2 text-muted",
    primary: "border-primary/30 bg-primary/10 text-primary",
    accent: "border-accent/30 bg-accent/10 text-accent",
    ok: "border-ok/30 bg-ok/10 text-ok",
    bad: "border-bad/30 bg-bad/10 text-bad",
    warn: "border-warn/30 bg-warn/10 text-warn",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  back,
  eyebrow,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  back?: { href: string; label: string };
  eyebrow?: ReactNode;
}) {
  return (
    <header className="mb-6 animate-fade-up">
      {back && (
        <Link
          href={back.href}
          className="-ml-1 mb-3 inline-flex items-center gap-1 rounded-full py-1 pr-3 text-sm text-muted hover:text-ink"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {back.label}
        </Link>
      )}
      {eyebrow && <div className="mb-2">{eyebrow}</div>}
      <h1 className="font-display text-[28px] leading-tight font-bold tracking-tight text-ink">{title}</h1>
      {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-muted">{subtitle}</p>}
    </header>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mt-8 mb-3 flex items-end justify-between gap-3">
      <h2 className="font-display text-lg font-semibold tracking-tight text-ink">{children}</h2>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-line bg-surface/80 p-4 ${className}`}>{children}</div>;
}

export function MnemonicCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-accent/25 bg-linear-to-br from-accent/10 via-surface to-primary/10 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-accent uppercase">
        <Lightbulb className="size-4" aria-hidden /> Truco para recordar
      </div>
      <p className="mt-2 font-display text-lg leading-snug font-semibold text-ink">
        <Rich text={title} />
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        <Rich text={text} />
      </p>
    </div>
  );
}

export function SequenceChips({ items, loop = false }: { items: string[]; loop?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5 text-[13px]">
      {items.map((it, i) => (
        <Fragment key={`${it}-${i}`}>
          {i > 0 && <span className="text-faint">→</span>}
          <span className="rounded-lg border border-line bg-surface-2 px-2 py-0.5 text-ink">{it}</span>
        </Fragment>
      ))}
      {loop && <span className="text-accent">↺</span>}
    </div>
  );
}
