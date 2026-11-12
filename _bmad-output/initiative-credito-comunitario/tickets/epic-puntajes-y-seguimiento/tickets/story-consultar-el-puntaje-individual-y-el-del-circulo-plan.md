---
title: "HU 3.1 · Consultar el puntaje individual y el del círculo"
type: feature
ticket: 1
created: "2026-11-11"
status: built
baseline_revision: "b29d3defe3a2f6ec796c511689aa51ce5ca40ea6"
route: full
route_source: auto
risk: medium
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

Una persona puede distinguir su puntaje de ejemplo y su historial privado del puntaje compartido del círculo. El grupo puede consultar sus señales agregadas junto a los importes de la bolsa.

## Boundaries & Constraints

- «Mi puntaje» muestra el resultado ilustrativo y un resumen del historial del perfil seleccionado. Usar Ana como caso con resultado de ejemplo y Diana como caso con «Historial insuficiente», sin mostrar cero ni tratarlo como atraso. Otros perfiles sin datos precargados usan el mismo estado sin puntaje.
- «Puntaje del círculo» aparece en «Bolsa del círculo» y hereda sus permisos. Mostrar un resultado ilustrativo, señales agregadas de cumplimiento, compromisos y tiempo de vínculo, intereses cobrados y disponible para proyectos. Los importes se leen del tablero vigente. Las señales compartidas carecen de nombres, fichas personales y desgloses por integrante.
- Usar resultados precargados, identificados como ficticios. El puntaje no interviene en las decisiones de crédito, impago o giro. Los pesos, la comparación de casos y la explicación de diferencias se trabajan en la HU 3.2. El recordatorio privado corresponde a la HU 3.3.
- Al cambiar de perfil, la app reemplaza o retira el detalle anterior. La vista privada toma el perfil activo y no ofrece un selector de la ficha de otra persona dentro de la vista.

## I/O & Edge-Case Matrix

| Escenario | Resultado verificable |
| --- | --- |
| Ana abre «Mi puntaje» | Ve un puntaje ficticio y su propio resumen. |
| Diana abre «Mi puntaje» | Ve «Historial insuficiente», sin puntaje numérico. |
| Cambio de Ana a otro perfil | El detalle de Ana deja de aparecer, también al volver a navegar. |
| Diana o un respaldante habilitado abre la bolsa | Ve el puntaje colectivo, señales agregadas y los importes vigentes. |
| Perfil pendiente o fuera del padrón vigente intenta abrir la bolsa | No accede al puntaje ni a las cifras del círculo. |
| Giro colectivo de $50.000 COP registrado | El disponible mostrado baja de $60.000 a $10.000. El puntaje de ejemplo conserva su valor. |

</frozen-after-approval>

## Code Map

- `src/finance-state.mjs` — Usar `getFinanceDashboard` y `canViewFinance` para permisos e importes. La proyección ya incluye los giros de proyectos.
- `src/demo-state.mjs` — Reutilizar los identificadores del selector. Diana ya tiene historial nulo.
- `src/app.mjs`, `index.html` y `styles.css` — Reutilizar navegación, selector, enfoque de títulos, formato COP y tarjetas del tablero. Mantener separados el detalle propio y el resumen compartido.

## Tasks & Acceptance

- [x] Modelo de puntajes — Entregar el detalle propio y las señales agregadas mediante consultas separadas. Usar datos ficticios.
- [x] Interfaz — Agregar «Mi puntaje» y el resumen del círculo. Mantener texto claro, foco visible y controles accesibles a 320 px.
- [x] `test/` y `README.md` — Cubrir la matriz y documentar la consulta y el cambio de perfiles.

## Implementation Notes

- Valores ficticios elegidos para la demo: Ana 82 y círculo 78 sobre 100. Pasaron 38 pruebas de Node y los recorridos de puntaje, giro e impago en Chromium a 320 px.

## Plan Change Log

## Review Triage Log

| Fecha | Hallazgo | Veredicto | Evidencia y decisión |
| --- | --- | --- | --- |
| 2026-11-11 | La prueba de modelo no cubre el cambio de perfil en pantalla | false | La verificación de Chromium cambia de Ana a Diana, comprueba que se retira el historial y navega fuera y de vuelta. |
| 2026-11-11 | La prueba de modelo no cubre permisos y saldos renderizados | false | La verificación de Chromium comprueba que un perfil pendiente no puede abrir la bolsa y que el disponible visible baja tras el giro. La prueba de modelo cubre también al perfil confirmado fuera del padrón. |

## Verification

- `node --test` — Pasan la matriz y las regresiones de crédito, impago y proyectos.
- Chromium a 320 px — Consultar los dos resultados con teclado y tacto. Cambiar de perfil, comprobar permisos y verificar que el disponible coincide con la bolsa después de un giro.
