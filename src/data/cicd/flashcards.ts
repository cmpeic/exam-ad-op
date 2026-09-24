import type { Flashcard } from "../types";

export const flashcards: Flashcard[] = [
  // Diap. 2
  { id: "fc-ci", topic: "que-es-cicd", front: "¿Qué es CI?", back: "Continuous Integration / **Integración continua**: integrar los cambios del código en un **repositorio compartido** de forma **automática y frecuente**." },
  { id: "fc-cd", topic: "que-es-cicd", front: "¿Qué es CD?", back: "Continuous **Delivery** (entrega / distribución continua) o Continuous **Deployment** (despliegue / implementación continua). Implica la **integración, la prueba y la distribución** de los cambios." },
  { id: "fc-goal", topic: "que-es-cicd", front: "Objetivo de la CI/CD", back: "**Optimizar y agilizar** el ciclo de vida del desarrollo del software." },
  { id: "fc-delivery-vs", topic: "que-es-cicd", front: "Entrega (distribución) continua vs. despliegue (implementación) continuo", back: "**Entrega:** NO llega sola a producción (aprobación humana).\n**Despliegue:** SÍ llega automáticamente a producción.", hint: "Pizza en el mostrador vs. pizza en tu puerta." },
  // Diap. 3
  { id: "fc-importance", topic: "importancia", front: "¿Por qué es importante la CI/CD? (Diap. 3)", back: "Evita errores y fallas con un **ciclo constante** de actualizaciones · **disminuye** la complejidad, **aumenta** la eficiencia, **optimiza** los flujos · **automatiza** la intervención manual → menos inactividad, lanzamientos ágiles · incorpora más rápido los **comentarios** de los usuarios.", hint: "DAO: Disminuye, Aumenta, Optimiza." },
  // Diap. 4
  { id: "fc-devops", topic: "integracion-continua", front: "La CI es una etapa del ciclo de vida de…", back: "**DevOps.** Los desarrolladores registran código en el repositorio compartido, a menudo **múltiples veces al día**." },
  { id: "fc-ci-3", topic: "integracion-continua", front: "¿Qué 3 cosas hace el proceso automático de la CI?", back: "1. **Compila** el código\n2. **Ejecuta** pruebas automáticas\n3. **Verifica** que no haya errores", hint: "La CI lo «CEVE» todo." },
  { id: "fc-ci-benefit", topic: "integracion-continua", front: "Principal beneficio de la CI (Diap. 4)", back: "Los inconvenientes se **detectan en una etapa temprana**, antes de que se conviertan en problemas mayores." },
  // Diap. 5
  { id: "fc-purpose", topic: "para-que-sirve", front: "¿Para qué sirve la CI? (3)", back: "Detectar errores lo antes posible para:\n• **Evitar** conflictos de código entre equipos\n• **Mejorar** la calidad del software\n• **Reducir** el tiempo de lanzar nuevas funcionalidades" },
  { id: "fc-flow-ci", topic: "para-que-sirve", front: "Flujo básico de CI (Diap. 5)", back: "Desarrollador → Git push → Pipeline CI:\nCompilar → Ejecutar pruebas → Validar código → **Modificar resultado**", hint: "¡Con Esto Vas Mejorando!" },
  // Diap. 6
  { id: "fc-ben-ci", topic: "beneficios-ci", front: "Los 5 beneficios de la CI", back: "• Detección temprana de errores\n• Mayor calidad del software\n• Menor tiempo para lanzar versiones\n• Automatización del flujo de trabajo\n• Mejor colaboración entre desarrolladores", hint: "D.A. + 3M" },
  // Diap. 7
  { id: "fc-pipeline", topic: "pipeline", front: "¿Qué es un pipeline de CI/CD?", back: "Una **serie de pasos automatizados** que permiten **construir, probar y desplegar** aplicaciones de forma **continua y confiable**." },
  { id: "fc-pipe-8", topic: "pipeline", front: "Los 8 pasos del pipeline (Diap. 7)", back: "Commit change → Trigger build → Build → Notify of build outcome → Run tests → Notify of test outcome → Deliver build to staging → Deploy to production", hint: "Cometo y disparo · construyo y aviso · pruebo y aviso · ensayo y estreno." },
  { id: "fc-trigger", topic: "pipeline", front: "Trigger", back: "**Evento que inicia automáticamente** el pipeline (por ejemplo, un commit o un push). Trigger = disparador." },
  { id: "fc-staging", topic: "pipeline", front: "Staging", back: "**Entorno previo a producción** donde se entrega el build validado para verificarlo como si fuera real. El «ensayo general»." },
  { id: "fc-production", topic: "pipeline", front: "Producción", back: "**Entorno final** que usan los usuarios. El «estreno»." },
  { id: "fc-commit", topic: "pipeline", front: "Commit", back: "**Registro de un cambio** en el repositorio." },
  // Diap. 8
  { id: "fc-ben-pipe", topic: "beneficios-pipeline", front: "Los 6 beneficios del pipeline de CI/CD", back: "• Tiempo de implementación reducido\n• Disminución de costos\n• Bucles de retroalimentación continua\n• Detección temprana de errores\n• Menos inactividad y más confiabilidad\n• Mejor colaboración e integración del sistema", hint: "Las 6 preguntas del jefe: tarda, cuesta, opinan, fallas, se cae, equipo." },
  // Diap. 9
  { id: "fc-3-methods", topic: "como-funciona", front: "Las 3 metodologías conectadas del pipeline", back: "**Integración continua → Entrega continua → Despliegue continuo**", hint: "Integro → Entrego → Despliego." },
  { id: "fc-ic-9", topic: "como-funciona", front: "Integración continua (Diap. 9)", back: "Los desarrolladores envían su código a **repositorios centrales** gestionados por **sistemas de control de versiones (VCS)**." },
  { id: "fc-ec-9", topic: "como-funciona", front: "Entrega continua (Diap. 9)", back: "Se integran continuamente los **cambios validados** en **entornos o repositorios seleccionados**, como **GitHub**." },
  { id: "fc-dc-9", topic: "como-funciona", front: "Despliegue continuo (Diap. 9)", back: "Se **liberan automáticamente** los cambios a los **usuarios finales** tras superar **pruebas predefinidas** (p. ej., de integración en un **entorno de copia**)." },
  { id: "fc-vcs", topic: "como-funciona", front: "VCS", back: "**Sistema de control de versiones** (Version Control System), por ejemplo Git." },
  // Diap. 10
  { id: "fc-build", topic: "construir-prueba", front: "Etapa CONSTRUIR", back: "**Creación y compilación** de código. Se construye desde el código fuente de forma **colaborativa**, integrando el código nuevo e **identificando rápido** problemas o conflictos." },
  { id: "fc-test", topic: "construir-prueba", front: "Etapa PRUEBA", back: "Pruebas **automatizadas** (en la entrega y en la implementación continua): de **integración**, **unitarias** y de **regresión**.", hint: "HUIR: Unitarias, Integración, Regresión." },
  { id: "fc-unit", topic: "construir-prueba", front: "Prueba unitaria", back: "Comprueba una **parte individual** del software (una función o módulo) de forma aislada." },
  { id: "fc-integration", topic: "construir-prueba", front: "Prueba de integración", back: "Comprueba que **varios componentes funcionen juntos**." },
  { id: "fc-regression", topic: "construir-prueba", front: "Prueba de regresión", back: "Comprueba que los **cambios nuevos no rompan** lo que ya funcionaba." },
  // Diap. 11
  { id: "fc-deliver", topic: "entregar-desplegar", front: "Etapa ENTREGAR", back: "Se envía una **base de código aprobada** a un **entorno de producción**. Automática en la implementación continua; en la entrega continua, **tras la aprobación del desarrollador**." },
  { id: "fc-deploy", topic: "entregar-desplegar", front: "Etapa DESPLEGAR", back: "Los cambios y el **producto final pasan a producción**. Entrega continua: **con aprobación humana**. Implementación continua: **automatizado**." },
  { id: "fc-4-stages", topic: "entregar-desplegar", front: "Las 4 etapas del pipeline (Diap. 10–11)", back: "**Construir → Prueba → Entregar → Desplegar**", hint: "Cocino, Pruebo, Empaco, Despacho." },
  // Diap. 12
  { id: "fc-5-stages", topic: "cinco-etapas", front: "Las 5 etapas del pipeline (Diap. 12)", back: "1. Desarrollo del código\n2. Test de la aplicación\n3. Test de integración\n4. Test de validación\n5. Producción", hint: "De Aquí Iremos Volando a Producción." },
  // Diap. 13
  { id: "fc-gha", topic: "herramientas", front: "GitHub Actions", back: "CI/CD **dentro de GitHub**. Usa archivos **YAML** para automatizar todo." },
  { id: "fc-jenkins", topic: "herramientas", front: "Jenkins", back: "**Open-source**, muy **potente y extensible**, aunque **requiere más configuración**.", hint: "El mayordomo: potente, pero hay que darle instrucciones." },
  { id: "fc-travis", topic: "herramientas", front: "Travis CI", back: "**Fácil de usar**, muy usado con **GitHub**. Ideal para proyectos **open-source**." },
  // Diap. 14
  { id: "fc-inf", topic: "ciclo-devops", front: "Las 8 fases del ciclo infinito", back: "PLAN → CODE → BUILD → TEST → RELEASE → DEPLOY → OPERATE → MONITOR → (PLAN)", hint: "Para Construir Buen Trabajo Rápido: Despliega, Opera y Monitorea." },
  { id: "fc-inf-sides", topic: "ciclo-devops", front: "¿Qué fases son del lado CI y cuáles del lado CD?", back: "**CI:** CODE · BUILD · TEST\n**CD:** DEPLOY · OPERATE · MONITOR\n**Cruces:** RELEASE (CI → CD) y PLAN (CD → CI)" },
  { id: "fc-t-code", topic: "ciclo-devops", front: "Herramientas de CODE", back: "**Confluence · Jira · Git**", hint: "Jira planifica, Confluence documenta, Git versiona." },
  { id: "fc-t-build", topic: "ciclo-devops", front: "Herramientas de BUILD", back: "**sbt · Maven**", hint: "sbt = Scala Build Tool." },
  { id: "fc-t-test", topic: "ciclo-devops", front: "Herramientas de TEST", back: "**Selenium · JUnit**", hint: "JUnit → pruebas unitarias." },
  { id: "fc-t-release", topic: "ciclo-devops", front: "Herramientas de RELEASE", back: "**Jenkins · Codeship**", hint: "Codeship: «to ship» = lanzar." },
  { id: "fc-t-deploy", topic: "ciclo-devops", front: "Herramientas de DEPLOY", back: "**DC/OS · Docker · AWS**", hint: "Contenedores a la nube o al centro de datos." },
  { id: "fc-t-operate", topic: "ciclo-devops", front: "Herramientas de OPERATE", back: "**Chef · Ansible · Kubernetes**", hint: "Un chef opera la cocina; Kubernetes = timonel." },
  { id: "fc-t-monitor", topic: "ciclo-devops", front: "Herramientas de MONITOR", back: "**Nagios · Splunk · Datadog**", hint: "Datadog: el perro guardián de los datos." },
  { id: "fc-why-inf", topic: "ciclo-devops", front: "¿Por qué el diagrama tiene forma de infinito?", back: "Porque el desarrollo **no termina** al desplegar: se opera, se **monitorea**, se aprende y se vuelve a **planificar**. Es un ciclo continuo de mejora." },
];
