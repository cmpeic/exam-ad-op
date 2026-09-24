import type { Topic } from "../types";

// Contenido fiel a las diapositivas 2–14 de la presentación "CI/CD".

export const topics: Topic[] = [
  {
    slug: "que-es-cicd",
    slide: 2,
    title: "¿Qué es CI/CD?",
    short: "Objetivo, integración continua y los dos tipos de CD",
    icon: "infinity",
    points: [
      "CI/CD significa **integración** y **distribución o implementación continuas**.",
      "Objetivo: **optimizar y agilizar el ciclo de vida del desarrollo del software**.",
      "**CI – integración continua:** integrar los cambios del código en un **repositorio de código fuente compartido**, de forma **automática y frecuente**.",
      "**CD – implementación o distribución continua:** proceso de **dos partes** que implica la **integración, la prueba y la distribución** de los cambios en el código.",
      "En la **distribución continua** los cambios **no** llegan a producción de forma automática.",
      "En la **implementación continua** los cambios **sí** llegan a producción automáticamente.",
    ],
    keyIdea:
      "CI = integrar + comprobar. CD = dejar la versión lista (entrega) o publicarla sola (despliegue).",
    extra: {
      title: "Mismo concepto, distintos nombres (¡ojo en el examen!)",
      items: [
        "Continuous **Delivery** = **Entrega** continua = **Distribución** continua → llega a producción **con aprobación humana**.",
        "Continuous **Deployment** = **Despliegue** continuo = **Implementación** continua → llega a producción **automáticamente**.",
      ],
    },
    mnemonic: {
      title: "Pizza en el mostrador vs. pizza en tu puerta",
      text: "En la **entrega / distribución continua** la pizza está lista en el mostrador, pero **una persona decide** cuándo llevarla. En el **despliegue / implementación continua** la pizza **llega sola** a tu puerta.",
    },
    diagram: "cuatro-etapas",
    checklist: [
      "Sé decir el objetivo de CI/CD usando «optimizar» y «agilizar».",
      "Sé definir CI: repositorio compartido + automático + frecuente.",
      "Sé explicar por qué la distribución continua NO llega sola a producción y la implementación continua SÍ.",
    ],
  },
  {
    slug: "importancia",
    slide: 3,
    title: "Importancia de la CI/CD",
    short: "Por qué las empresas la usan",
    icon: "target",
    points: [
      "Permite a las empresas **evitar errores y fallas** en el código mientras mantienen un **ciclo constante de desarrollo y actualizaciones**.",
      "Cuando las aplicaciones crecen ayuda a **disminuir la complejidad**, **aumentar la eficiencia** y **optimizar los flujos de trabajo**.",
      "**Automatiza la intervención manual** que necesita el código nuevo para pasar de la **confirmación** a **producción** → se **reduce el tiempo de inactividad** y se **agilizan los lanzamientos**.",
      "Al integrar cambios más rápido, los **comentarios de los usuarios** se incorporan con más frecuencia y eficiencia → **mayor satisfacción** de los clientes.",
    ],
    keyIdea:
      "Detectar los problemas lo antes posible, con cambios pequeños y validados, en vez de integrar todo al final.",
    compare: {
      left: {
        title: "Sin CI/CD",
        tone: "bad",
        steps: [
          "Desarrollar mucho código",
          "Integrarlo todo al final",
          "Aparecen muchos errores juntos",
          "Corregir (lento y caro)",
          "Publicar tarde",
        ],
      },
      right: {
        title: "Con CI/CD",
        tone: "ok",
        steps: [
          "Cambio pequeño",
          "Validar automáticamente",
          "Cambio pequeño",
          "Validar automáticamente",
          "Publicar seguido",
        ],
      },
    },
    mnemonic: {
      title: "DAO: lo que hace cuando la app crece",
      text: "==D==isminuye la complejidad · ==A==umenta la eficiencia · ==O==ptimiza los flujos de trabajo.",
    },
    checklist: [
      "Sé nombrar las 3 ayudas cuando la app crece (DAO).",
      "Sé explicar por qué se reduce el tiempo de inactividad (automatiza la intervención manual).",
      "Sé relacionar CI/CD con los comentarios de los usuarios y su satisfacción.",
    ],
  },
  {
    slug: "integracion-continua",
    slide: 4,
    title: "¿Qué es integración continua?",
    short: "La práctica DevOps de integrar varias veces al día",
    icon: "git-merge",
    points: [
      "La CI es una **práctica recomendada** y es la **etapa del ciclo de vida de DevOps** en que los desarrolladores registran código en su **repositorio compartido**, a menudo **múltiples veces al día**.",
      "Cada vez que eso ocurre se **dispara un proceso automatizado** que:",
      "1) **Compila** el código · 2) **Ejecuta pruebas** automáticas · 3) **Verifica** que no haya errores.",
      "Principal beneficio: los inconvenientes se **detectan en una etapa temprana**, antes de que se conviertan en **problemas mayores**.",
    ],
    keyIdea: "La CI responde: ¿el código nuevo se integra correctamente con el que ya existe?",
    mnemonic: {
      title: "La CI lo «CEVE» todo",
      text: "==C==ompila · ==E==jecuta pruebas · ==V==erifica errores. Suena a «se ve»: la CI **ve** los errores temprano.",
    },
    diagram: "flujo-ci",
    checklist: [
      "Sé que la CI es una etapa del ciclo de vida de DevOps.",
      "Sé las 3 acciones del proceso automático en orden (Compila, Ejecuta, Verifica).",
      "Sé cuál es el principal beneficio: la detección temprana.",
    ],
  },
  {
    slug: "para-que-sirve",
    slide: 5,
    title: "¿Para qué sirve? · Flujo básico de CI",
    short: "Propósito y el primer diagrama de la presentación",
    icon: "workflow",
    points: [
      "Propósito: **detectar errores lo antes posible** para:",
      "• **Evitar conflictos** de código entre equipos.",
      "• **Mejorar la calidad** del software.",
      "• **Reducir el tiempo** que lleva lanzar nuevas funcionalidades.",
      "**Flujo básico de CI:** Desarrollador → Git push → Pipeline CI: **Compilar → Ejecutar pruebas → Validar código → Modificar resultado**.",
    ],
    keyIdea:
      "Un push dispara el pipeline: se compila, se prueba, se valida y el resultado vuelve al desarrollador.",
    extra: {
      title: "Ojo con el último paso",
      items: [
        "La diapositiva dice **«Modificar resultado»**. En algunos apuntes aparece como «mostrar resultado»: el pipeline informa el resultado y, con eso, se corrige o modifica el código.",
      ],
    },
    mnemonic: {
      title: "¡Con Esto Vas Mejorando!",
      text: "Después del push, el pipeline hace: ==C==ompilar · ==E==jecutar pruebas · ==V==alidar código · ==M==odificar resultado. Y los 3 «para qué»: **Evita** conflictos, **Mejora** la calidad, **Reduce** el tiempo.",
    },
    diagram: "flujo-ci",
    checklist: [
      "Sé los 3 «para qué» de la CI (conflictos, calidad, tiempo).",
      "Puedo dibujar el flujo básico: Desarrollador → Git push → Pipeline CI.",
      "Sé los 4 pasos dentro del pipeline CI en orden.",
    ],
  },
  {
    slug: "beneficios-ci",
    slide: 6,
    title: "Beneficios de la integración continua",
    short: "Los 5 beneficios de la CI",
    icon: "badge-check",
    points: [
      "✅ **Detección temprana** de errores.",
      "✅ **Mayor calidad** del software.",
      "✅ **Menor tiempo** para lanzar nuevas versiones.",
      "✅ **Automatización** del flujo de trabajo.",
      "✅ **Mejor colaboración** entre desarrolladores.",
    ],
    keyIdea:
      "Integración frecuente → pruebas frecuentes → detección temprana → correcciones rápidas → más calidad y entregas más rápidas.",
    mnemonic: {
      title: "D.A. + 3M",
      text: "==D==etección temprana + ==A==utomatización, y las **3 M**: ==M==ayor calidad, ==M==enor tiempo, ==M==ejor colaboración. Son **5**.",
    },
    checklist: [
      "Sé que son 5 beneficios de la CI.",
      "Puedo recitarlos con «D.A. + 3M».",
    ],
  },
  {
    slug: "pipeline",
    slide: 7,
    title: "¿Qué es el pipeline de CI/CD?",
    short: "Definición y el diagrama de 8 pasos",
    icon: "git-pull-request-arrow",
    points: [
      "El flujo de trabajo CI/CD es un **flujo de trabajo automatizado** que **agiliza el proceso de entrega** de software.",
      "Un **pipeline de CI/CD** es una **serie de pasos automatizados** que permiten **construir, probar y desplegar** aplicaciones de software de forma **continua y confiable**.",
      "Diagrama: **Commit change → Trigger build → Build → Notify of build outcome → Run tests → Notify of test outcome → Deliver build to staging → Deploy to production**.",
    ],
    keyIdea:
      "El pipeline es una cadena de montaje: entra código por un extremo y sale software validado y desplegado por el otro.",
    extra: {
      title: "Traducción de los 8 pasos",
      items: [
        "**Commit change** = confirmar el cambio",
        "**Trigger build** = disparar la construcción",
        "**Build** = construir / compilar",
        "**Notify of build outcome** = avisar el resultado del build",
        "**Run tests** = ejecutar pruebas",
        "**Notify of test outcome** = avisar el resultado de las pruebas",
        "**Deliver build to staging** = entregar el build al entorno previo (staging)",
        "**Deploy to production** = desplegar a producción",
      ],
    },
    mnemonic: {
      title: "Cometo y disparo · construyo y aviso · pruebo y aviso · ensayo y estreno",
      text: "Agrupa los 8 pasos en **4 parejas**. Después de construir se **avisa** y después de probar se **avisa**. **Staging** es el **ensayo general** del teatro y **production** es el **estreno** con público.",
    },
    diagram: "pipeline-8",
    checklist: [
      "Sé la definición de pipeline (pasos automatizados para construir, probar y desplegar; continua y confiable).",
      "Puedo decir los 8 pasos en orden.",
      "Sé qué es staging y qué es producción.",
    ],
  },
  {
    slug: "beneficios-pipeline",
    slide: 8,
    title: "Beneficios del pipeline de CI/CD",
    short: "Los 6 beneficios del pipeline",
    icon: "trophy",
    points: [
      "✅ **Tiempo de implementación** reducido.",
      "✅ **Disminución de costos**.",
      "✅ **Bucles de retroalimentación** continua.",
      "✅ **Detección temprana** de errores.",
      "✅ **Reducción del tiempo de inactividad** y mayor **confiabilidad**.",
      "✅ Mejora de la **colaboración en equipo** y la **integración del sistema**.",
    ],
    keyIdea:
      "La automatización hace el proceso repetible: nadie tiene que acordarse de compilar, probar, copiar, configurar y desplegar a mano.",
    mnemonic: {
      title: "Las 6 preguntas del jefe",
      text: "¿Cuánto **tarda**? (tiempo de implementación) · ¿Cuánto **cuesta**? (costos) · ¿Qué **opinan**? (retroalimentación) · ¿Hay **fallas**? (detección temprana) · ¿Se **cae**? (inactividad y confiabilidad) · ¿Y el **equipo**? (colaboración e integración).",
    },
    checklist: [
      "Sé que son 6 beneficios del pipeline.",
      "Puedo recitarlos con «las 6 preguntas del jefe».",
      "No los confundo con los 5 beneficios de la CI.",
    ],
  },
  {
    slug: "como-funciona",
    slide: 9,
    title: "¿Cómo funciona el pipeline?",
    short: "3 metodologías conectadas",
    icon: "link-2",
    points: [
      "El pipeline de CI/CD consta de **tres metodologías conectadas**:",
      "**Integración continua:** los desarrolladores envían su código a **repositorios centrales** gestionados por **sistemas de control de versiones (VCS)**.",
      "**Entrega continua:** se integran continuamente los **cambios de código validados** en **entornos o repositorios de código seleccionados**, como **GitHub**.",
      "**Despliegue continuo:** se **liberan automáticamente** los cambios a los **usuarios finales** tras superar una **serie de pruebas predefinidas**, como las **pruebas de integración** que prueban el código en un **entorno de copia** para garantizar su **integridad**.",
    ],
    keyIdea:
      "Integración: ¿funciona con lo existente? · Entrega: ¿tenemos una versión lista? · Despliegue: ¿la publicamos automáticamente?",
    mnemonic: {
      title: "Integro → Entrego → Despliego",
      text: "Tres verbos que riman en **-o**, siempre en ese orden: ==I==ntegro, ==E==ntrego, ==D==espliego.",
    },
    diagram: "tres-metodologias",
    checklist: [
      "Sé nombrar las 3 metodologías en orden.",
      "Sé qué es un VCS y en qué metodología aparece.",
      "Sé qué pasa en el despliegue continuo (liberación automática tras pruebas predefinidas, entorno de copia).",
    ],
  },
  {
    slug: "construir-prueba",
    slide: 10,
    title: "Etapas: Construir y Prueba",
    short: "Build y los 3 tipos de pruebas",
    icon: "hammer",
    points: [
      "**Construir:** implica la **creación y compilación** de código. Los equipos construyen a partir del **código fuente** de forma **colaborativa** e integran el código nuevo, **identificando rápidamente** cualquier problema o conflicto.",
      "**Prueba:** los equipos prueban el código. Las **pruebas automatizadas** se realizan **tanto en la entrega continua como en la implementación**.",
      "Estos entornos de prueba pueden incluir **pruebas de integración**, **pruebas unitarias** y **pruebas de regresión**.",
    ],
    keyIdea: "Si el build falla, no tiene sentido seguir: primero se construye y luego se prueba.",
    extra: {
      title: "Qué comprueba cada prueba",
      items: [
        "**Unitaria:** una parte individual (una función o módulo) de forma aislada.",
        "**Integración:** que varios componentes funcionen **juntos**.",
        "**Regresión:** que un cambio nuevo **no rompa** lo que ya funcionaba.",
      ],
    },
    mnemonic: {
      title: "Para no HUIR de los bugs",
      text: "La H es muda: ==U==nitarias · ==I==ntegración · ==R==egresión. De lo pequeño (una pieza) a lo grande (piezas juntas) y hacia atrás en el tiempo (lo viejo sigue funcionando).",
    },
    diagram: "cuatro-etapas",
    checklist: [
      "Sé qué implica Construir (creación y compilación, colaborativo, detecta conflictos).",
      "Sé los 3 tipos de pruebas mencionados (HUIR).",
      "Sé que las pruebas automatizadas están en la entrega Y en la implementación continua.",
    ],
  },
  {
    slug: "entregar-desplegar",
    slide: 11,
    title: "Etapas: Entregar y Desplegar",
    short: "Dónde entra (o no) la aprobación humana",
    icon: "rocket",
    points: [
      "**Entregar:** se envía una **base de código aprobada** a un **entorno de producción**. Se **automatiza en la implementación continua** y en la entrega continua **solo se automatiza tras la aprobación del desarrollador**.",
      "**Desplegar:** se implementan los cambios y el **producto final pasa a producción**.",
      "En la **entrega continua**, los productos o el código se envían a **repositorios** y se trasladan a producción **con la aprobación humana**.",
      "En la **implementación continua**, este paso está **automatizado**.",
    ],
    keyIdea: "Entregar = tener el software listo. Desplegar = ponerlo efectivamente en producción.",
    mnemonic: {
      title: "Cocino, Pruebo, Empaco, Despacho",
      text: "Las 4 etapas son como un restaurante: **Construir** = cocinar, **Prueba** = probar el sabor, **Entregar** = empacar el pedido, **Desplegar** = despacharlo al cliente. En la **entrega continua** el encargado **aprueba** antes de despachar; en la **implementación continua** sale **solo**.",
    },
    diagram: "cuatro-etapas",
    checklist: [
      "Sé la diferencia entre Entregar y Desplegar.",
      "Sé en qué caso hay aprobación humana (entrega continua) y en cuál es automático (implementación continua).",
      "Puedo decir las 4 etapas en orden: Construir, Prueba, Entregar, Desplegar.",
    ],
  },
  {
    slug: "cinco-etapas",
    slide: 12,
    title: "Las 5 etapas del pipeline",
    short: "Desarrollo → 3 tests → Producción",
    icon: "list-ordered",
    points: [
      "**1. Desarrollo del código** – se crea o modifica la funcionalidad.",
      "**2. Test de la aplicación** – se comprueba el funcionamiento del software.",
      "**3. Test de integración** – se comprueba que los módulos se comuniquen correctamente.",
      "**4. Test de validación** – se comprueba que el producto cumple y está listo para avanzar.",
      "**5. Producción** – el sistema pasa al entorno final que usa el usuario.",
    ],
    keyIdea:
      "Entre el código y producción hay 3 tests que van de lo pequeño a lo grande: aplicación → integración → validación.",
    mnemonic: {
      title: "De Aquí Iremos Volando a Producción",
      text: "==D==esarrollo · test de la ==A==plicación · test de ==I==ntegración · test de ==V==alidación · ==P==roducción. Colores en la diapositiva: naranja, amarillo, verde, azul y morado.",
    },
    diagram: "cinco-etapas",
    checklist: [
      "Puedo decir las 5 etapas en orden con su número.",
      "Sé qué comprueba cada uno de los 3 tests.",
    ],
  },
  {
    slug: "herramientas",
    slide: 13,
    title: "Herramientas comunes de CI/CD",
    short: "GitHub Actions, Jenkins y Travis CI",
    icon: "settings",
    points: [
      "**GitHub Actions:** CI/CD **dentro de GitHub**. Usa archivos **YAML** para automatizar todo.",
      "**Jenkins:** **open-source**, muy **potente y extensible**, aunque **requiere más configuración**.",
      "**Travis CI:** **fácil de usar**, muy usado con **GitHub**. Ideal para proyectos **open-source**.",
    ],
    keyIdea:
      "Las tres automatizan construir → probar → desplegar; cambian en dónde viven y cuánto hay que configurarlas.",
    extra: {
      title: "Ejemplo real: esta misma app",
      items: [
        "Este repositorio usa **GitHub Actions** (un archivo YAML en `.github/workflows/ci.yml`) para instalar, revisar el código y compilar en cada push → eso es **CI**.",
        "Luego **Vercel** detecta el push a `main` y publica la nueva versión sola → eso es **despliegue continuo (CD)**.",
      ],
    },
    mnemonic: {
      title: "El mayordomo, el obrero y el de casa",
      text: "**Jenkins** es un **mayordomo** (su logo): muy potente, pero hay que **darle instrucciones** (más configuración). **Travis** es un **obrero** simpático: **fácil** y amigo del open-source. **GitHub Actions** «vive en casa» (dentro de GitHub) y **habla YAML**.",
    },
    checklist: [
      "Sé describir GitHub Actions (dentro de GitHub, YAML).",
      "Sé describir Jenkins (open-source, potente, extensible, más configuración).",
      "Sé describir Travis CI (fácil, GitHub, open-source).",
    ],
  },
  {
    slug: "ciclo-devops",
    slide: 14,
    title: "El ciclo infinito CI/CD",
    short: "Plan → Code → Build → Test → Release → Deploy → Operate → Monitor",
    icon: "infinity",
    points: [
      "El diagrama final tiene forma de **infinito (∞)** con **CI** a la izquierda y **CD** a la derecha.",
      "Orden: **PLAN → CODE → BUILD → TEST → RELEASE → DEPLOY → OPERATE → MONITOR → (PLAN)…**",
      "Lado **CI**: CODE, BUILD, TEST. Lado **CD**: DEPLOY, OPERATE, MONITOR.",
      "**RELEASE** cruza de CI a CD; **PLAN** cruza de CD de vuelta a CI.",
      "Herramientas: CODE (Confluence, Jira, Git) · BUILD (sbt, Maven) · TEST (Selenium, JUnit) · RELEASE (Jenkins, Codeship) · DEPLOY (DC/OS, Docker, AWS) · OPERATE (Chef, Ansible, Kubernetes) · MONITOR (Nagios, Splunk, Datadog).",
    ],
    keyIdea:
      "El desarrollo no termina al desplegar: se opera, se monitorea, se aprende y se vuelve a planificar. Por eso es un ciclo infinito.",
    mnemonic: {
      title: "Para Construir Buen Trabajo Rápido: Despliega, Opera y Monitorea",
      text: "==P==lan · ==C==ode · ==B==uild · ==T==est · ==R==elease · ==D==eploy · ==O==perate · ==M==onitor. En la diapositiva, **el color de cada herramienta coincide con el de su fase**.",
    },
    diagram: "ciclo-infinito",
    checklist: [
      "Puedo dibujar el ∞ con las 8 fases en su lugar.",
      "Sé qué fases son de CI, cuáles de CD y cuáles cruzan (Release y Plan).",
      "Sé ubicar las herramientas de cada fase.",
      "Sé explicar por qué es un ciclo infinito.",
    ],
  },
];
