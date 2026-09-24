import type { Phase } from "../types";

// Colores del diagrama ∞ de la diapositiva 14 (un poco más oscuros para que
// el texto blanco se lea bien).
export const PHASE_COLORS = {
  blue: "#2f86d6",
  green: "#23a04b",
  orange: "#df721f",
  red: "#d6443b",
} as const;

/** Las 8 fases del ciclo infinito, en orden y empezando por PLAN. */
export const PHASES: Phase[] = [
  {
    id: "plan",
    label: "PLAN",
    es: "Planificar",
    color: PHASE_COLORS.red,
    side: "puente",
    sideLabel: "Cruce CD → CI (flecha roja)",
    icon: "map",
    detail:
      "Con lo aprendido al monitorear se decide qué construir o mejorar. Es la flecha roja que cruza desde CD de vuelta hacia CI.",
    hook: "PLAN es el «reinicio»: cierra el ∞ y todo vuelve a empezar.",
    tools: [],
  },
  {
    id: "code",
    label: "CODE",
    es: "Codificar",
    color: PHASE_COLORS.blue,
    side: "ci",
    sideLabel: "Lado CI",
    icon: "code",
    detail:
      "Se desarrolla el software. En la diapositiva, la zona de planificación y código se conecta con Confluence, Jira y Git.",
    hook: "Jira planifica, Confluence documenta y Git versiona.",
    tools: [
      { name: "Confluence", desc: "Wiki y documentación del equipo" },
      { name: "Jira", desc: "Gestión de tareas e incidencias" },
      { name: "Git", desc: "Control de versiones del código" },
    ],
  },
  {
    id: "build",
    label: "BUILD",
    es: "Construir",
    color: PHASE_COLORS.green,
    side: "ci",
    sideLabel: "Lado CI",
    icon: "hammer",
    detail: "Código fuente → BUILD → software construido (compilado y empaquetado).",
    hook: "sbt = Scala **Build** Tool: ¡lleva «build» en el nombre! Maven construye proyectos Java.",
    tools: [
      { name: "sbt", desc: "Herramienta de build para Scala" },
      { name: "Maven", desc: "Build y dependencias en Java" },
    ],
  },
  {
    id: "test",
    label: "TEST",
    es: "Probar",
    color: PHASE_COLORS.orange,
    side: "ci",
    sideLabel: "Lado CI",
    icon: "flask",
    detail: "Software construido → pruebas → ¿funciona correctamente?",
    hook: "J**Unit** = pruebas **unit**arias. Selenium prueba la app en el navegador.",
    tools: [
      { name: "Selenium", desc: "Pruebas automáticas en el navegador" },
      { name: "JUnit", desc: "Pruebas unitarias en Java" },
    ],
  },
  {
    id: "release",
    label: "RELEASE",
    es: "Liberar versión",
    color: PHASE_COLORS.green,
    side: "puente",
    sideLabel: "Cruce CI → CD (flecha verde)",
    icon: "milestone",
    detail:
      "La versión validada se libera para pasar a entrega y despliegue. Es la flecha verde que cruza desde CI hacia CD.",
    hook: "Code**ship**: «to ship» = enviar, lanzar. Jenkins, el mayordomo, entrega la versión.",
    tools: [
      { name: "Jenkins", desc: "Servidor de automatización CI/CD open-source" },
      { name: "Codeship", desc: "Servicio de CI/CD en la nube" },
    ],
  },
  {
    id: "deploy",
    label: "DEPLOY",
    es: "Desplegar",
    color: PHASE_COLORS.orange,
    side: "cd",
    sideLabel: "Lado CD",
    icon: "rocket",
    detail: "Versión preparada → DEPLOY → entorno destino.",
    hook: "Docker empaqueta en contenedores y los lleva a la nube (AWS) o al centro de datos (DC/OS = Data Center OS).",
    tools: [
      { name: "DC/OS", desc: "Sistema operativo para centros de datos" },
      { name: "Docker", desc: "Empaqueta apps en contenedores" },
      { name: "AWS", desc: "Nube de Amazon (Amazon Web Services)" },
    ],
  },
  {
    id: "operate",
    label: "OPERATE",
    es: "Operar",
    color: PHASE_COLORS.red,
    side: "cd",
    sideLabel: "Lado CD",
    icon: "settings",
    detail: "Operación del software ya desplegado: configurar servidores, escalar y mantenerlo funcionando.",
    hook: "Un **Chef** opera la cocina; **Kubernetes** significa «timonel» en griego: pilotea los contenedores; **Ansible** automatiza tareas.",
    tools: [
      { name: "Chef", desc: "Configura servidores con «recetas»" },
      { name: "Ansible", desc: "Automatiza configuración y tareas" },
      { name: "Kubernetes", desc: "Orquesta contenedores en producción" },
    ],
  },
  {
    id: "monitor",
    label: "MONITOR",
    es: "Monitorear",
    color: PHASE_COLORS.blue,
    side: "cd",
    sideLabel: "Lado CD",
    icon: "activity",
    detail:
      "Software en producción → monitorización → información sobre su funcionamiento → nuevas decisiones (vuelve a PLAN).",
    hook: "**Datadog** es el perro guardián de los datos; **Nagios** insiste con alertas; **Splunk** bucea en los logs.",
    tools: [
      { name: "Nagios", desc: "Monitoreo de servidores y alertas" },
      { name: "Splunk", desc: "Búsqueda y análisis de logs" },
      { name: "Datadog", desc: "Métricas y monitoreo en la nube" },
    ],
  },
];

export const ALL_TOOLS = PHASES.flatMap((p) =>
  p.tools.map((t) => ({ ...t, phase: p.id })),
);
