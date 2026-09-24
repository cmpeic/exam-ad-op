"use client";

import { useEffect, useState } from "react";
import { Bot, Check, Play, RotateCcw, UserCheck } from "lucide-react";
import { Icon } from "@/components/Icon";

type Kind = "entrega" | "despliegue";

const STAGES = [
  { id: "construir", label: "Construir", sub: "Crear y compilar", icon: "hammer", color: "#38bdf8" },
  { id: "prueba", label: "Prueba", sub: "Unitarias · integración · regresión", icon: "flask", color: "#fbbf24" },
  { id: "entregar", label: "Entregar", sub: "Base de código aprobada, lista", icon: "package", color: "#a78bfa" },
  { id: "gate", label: "", sub: "", icon: "", color: "" },
  { id: "desplegar", label: "Desplegar", sub: "El producto pasa a producción", icon: "rocket", color: "#34d399" },
  { id: "prod", label: "Producción", sub: "Los usuarios ya lo tienen", icon: "users", color: "#f472b6" },
];
const GATE = 3;

/** Simulador de la diferencia clave (Diap. 2 y 11): ¿hay aprobación humana antes de producción? */
export function DeliveryVsDeployment() {
  const [kind, setKind] = useState<Kind>("entrega");
  const [pos, setPos] = useState(-1);
  const [running, setRunning] = useState(false);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(
      () => {
        const next = pos + 1;
        if (next >= STAGES.length) {
          setRunning(false);
          return;
        }
        setPos(next);
        if (next === GATE && kind === "entrega") {
          setRunning(false);
          setWaiting(true);
        }
      },
      pos < 0 ? 250 : 950,
    );
    return () => window.clearTimeout(id);
  }, [running, pos, kind]);

  const start = () => {
    setPos(-1);
    setWaiting(false);
    setRunning(true);
  };
  const approve = () => {
    setWaiting(false);
    setRunning(true);
  };
  const changeKind = (k: Kind) => {
    setKind(k);
    setPos(-1);
    setRunning(false);
    setWaiting(false);
  };
  const finished = pos >= STAGES.length - 1 && !running;

  return (
    <div className="rounded-3xl border border-line bg-surface/80 p-4">
      <div className="font-display text-lg font-semibold text-ink">Simulador: ¿quién decide el paso a producción?</div>
      <div role="tablist" aria-label="Tipo de CD" className="mt-3 grid grid-cols-2 gap-1 rounded-2xl bg-surface-3 p-1">
        {(["entrega", "despliegue"] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={kind === k}
            onClick={() => changeKind(k)}
            className={`rounded-xl px-2 py-2 text-sm font-semibold transition ${
              kind === k ? "bg-primary text-bg" : "text-muted"
            }`}
          >
            {k === "entrega" ? "Entrega continua" : "Despliegue continuo"}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {kind === "entrega" ? (
          <>
            También llamada <strong className="text-ink">distribución continua</strong> (Continuous Delivery). Todo se
            automatiza hasta dejar la versión lista, pero el paso a producción se hace{" "}
            <strong className="text-ink">con la aprobación humana</strong>.
          </>
        ) : (
          <>
            También llamado <strong className="text-ink">implementación continua</strong> (Continuous Deployment). Si la
            versión supera las pruebas, <strong className="text-ink">pasa a producción automáticamente</strong>.
          </>
        )}
      </p>

      <ol className="mt-4 space-y-2">
        {STAGES.map((s, i) => {
          const isHere = pos === i;
          const passed = pos > i;
          if (i === GATE) {
            const human = kind === "entrega";
            return (
              <li
                key={s.id}
                className={`flex items-center gap-3 rounded-2xl border-2 border-dashed px-3 py-2.5 transition ${
                  waiting ? "animate-pulse border-warn bg-warn/10" : passed ? "border-ok/50 bg-ok/5" : "border-line"
                }`}
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-2xl ${
                    human ? "bg-warn/15 text-warn" : "bg-accent/15 text-accent"
                  }`}
                >
                  {human ? <UserCheck className="size-5" aria-hidden /> : <Bot className="size-5" aria-hidden />}
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-ink">{human ? "Aprobación humana" : "Automático"}</div>
                  <div className="text-xs text-muted">
                    {waiting
                      ? "Esperando que una persona apruebe…"
                      : passed
                        ? human
                          ? "Aprobado por una persona ✅"
                          : "Pasó solo, sin intervención 🤖"
                        : human
                          ? "Una persona debe aprobar el despliegue"
                          : "Sin intervención humana"}
                  </div>
                </div>
              </li>
            );
          }
          return (
            <li
              key={s.id}
              className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition ${
                isHere ? "scale-[1.02]" : ""
              } ${passed || isHere ? "" : "border-line opacity-60"}`}
              style={passed || isHere ? { borderColor: `${s.color}88`, background: `${s.color}14` } : undefined}
            >
              <span
                className="grid size-10 shrink-0 place-items-center rounded-2xl"
                style={{ background: isHere ? s.color : `${s.color}22`, color: isHere ? "#07070d" : s.color }}
              >
                {passed ? <Check className="size-5" aria-hidden /> : <Icon name={s.icon} className="size-5" />}
              </span>
              <div className="flex-1">
                <div className="font-semibold text-ink">{s.label}</div>
                <div className="text-xs text-muted">{s.sub}</div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-4">
        {waiting ? (
          <button
            type="button"
            onClick={approve}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-warn py-3.5 font-semibold text-bg"
          >
            <UserCheck className="size-5" aria-hidden /> Aprobar el paso a producción
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            disabled={running}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-semibold text-bg disabled:opacity-50"
          >
            {finished ? <RotateCcw className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
            {running ? "Simulando…" : finished ? "Simular otra vez" : "Simular un cambio"}
          </button>
        )}
      </div>
      {finished && (
        <p className="mt-3 animate-pop text-center text-sm font-medium text-ok" role="status">
          ¡En producción! {kind === "entrega" ? "Llegó porque una persona lo aprobó." : "Llegó sola, automáticamente."}
        </p>
      )}
    </div>
  );
}
