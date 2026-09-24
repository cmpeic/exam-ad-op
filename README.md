# Repaso para el examen · CI/CD y Aseguramiento de la Calidad

App web **mobile-first** y en **modo oscuro** para estudiar dos presentaciones:

| Materia | Diapositivas | Preguntas | Tarjetas | Diagramas |
| --- | --- | --- | --- | --- |
| **CI/CD** | 14 | 125 | 45 | 7 |
| **Aseguramiento de la Calidad del Software** | 47 | 229 | 65 | 17 |

Hecha con **Next.js 16** (App Router), **React 19**, **TypeScript** y **Tailwind CSS 4**. Todas las páginas se generan
de forma estática; el progreso se guarda en `localStorage` (solo en el dispositivo). Se puede instalar en el celular
como app (manifest + íconos): en el navegador, «Agregar a la pantalla de inicio».

## Qué incluye cada materia

| Sección | Para qué sirve |
| --- | --- |
| **Temas** | Una ficha por diapositiva: lo que dice, idea clave, truco para recordar, checklist «puedo…» y mini práctica. |
| **Diagramas** | Flujos (recorrer, recordar con nombres ocultos, ordenar), árboles (explorar, recordar, clasificar, preguntas), tablas (consultar, recordar, emparejar), el ciclo ∞ de CI/CD y la pirámide SPICE. |
| **Quiz** | Opción múltiple, marcar todas las correctas, verdadero/falso, ordenar, relacionar, completar, escenarios y preguntas abiertas con autoevaluación. Modos: rápido, examen simulado con tiempo, por tema, secuencias, repasar errores, solo nuevas. |
| **Corrección** | Al acertar se marca en verde y se explica. Al fallar se señala qué está mal **sin revelar la respuesta**, se da una pista y se puede **volver a intentar** (hasta 3 intentos) o ver la respuesta. Para las estadísticas cuenta el primer intento. |
| **Tarjetas** | Repetición espaciada con sistema Leitner (5 cajas). |
| **Trucos** | Acrósticos y analogías para cada secuencia (p. ej. «**I**ré **R**ápido, **G**anaré **E**l **P**remio **O**límpico» para los niveles SPICE). |
| **Glosario** | Todos los términos con búsqueda y un resumen de lo que más se confunde. |

## Desarrollo

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

## CI/CD de este repositorio (¡un ejemplo real de lo que se estudia!)

- **CI** – `.github/workflows/ci.yml` (GitHub Actions, archivo YAML): en cada push o pull request instala
  dependencias, ejecuta `npm run lint` y `npm run build`.
- **CD** – Vercel está conectado al repositorio: cada push a `main` se despliega automáticamente a producción
  (despliegue continuo).

## Estructura

```
src/
  app/                 / (selector de materias) y /[materia]/… (inicio, temas, diagramas, quiz, tarjetas, trucos, glosario)
  components/          UI, quiz con retroalimentación, entrenadores de diagramas
  data/cicd/           contenido de CI/CD
  data/calidad/        contenido de Aseguramiento de la Calidad
  data/subjects.ts     registro de materias
  lib/                 progreso (localStorage), estadísticas, barajado determinista, geometría del ∞
```

Para agregar otra materia: crea `src/data/<materia>/` con los mismos archivos y regístrala en `src/data/subjects.ts`.
