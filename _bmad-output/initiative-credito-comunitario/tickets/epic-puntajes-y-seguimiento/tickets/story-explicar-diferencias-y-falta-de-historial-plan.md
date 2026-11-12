---
title: "HU 3.2 · Explicar diferencias y falta de historial"
type: feature
ticket: 2
created: "2026-11-11"
status: draft
baseline_revision: ""
route: full
route_source: auto
risk: medium
review: ""
review_source: ""
lenses_ran: []
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

La persona entiende qué datos ayudan a interpretar los puntajes de la demo y distingue la falta de datos de un incumplimiento observado.

## Boundaries & Constraints

- Desde «Mi puntaje», ofrecer «Comparar ejemplos» con dos casos precargados y anónimos. Propuesta de la demo: un caso con 82/100 y mayor cumplimiento y otro con 58/100 y un compromiso incumplido. Son casos didácticos separados de los perfiles del selector.
- En cada caso, mostrar con las mismas etiquetas el historial disponible, el cumplimiento observado, el monto solicitado frente a los pagos registrados, el monto comprometido y el tiempo de vínculo. Explicar en lenguaje sencillo qué diferencia se observa. Mantener explícitos el periodo y las unidades si se muestran importes.
- Diana conserva «Historial insuficiente» sin valor numérico. Explicar que faltan datos para mostrar un resultado. El ejemplo de incumplimiento identifica el compromiso no cumplido con historial disponible.
- En la bolsa, explicar qué representan las señales colectivas sin desglosarlas por persona y conservar los permisos de la HU 3.1. El historial propio sigue vinculado al perfil activo. El comparador solo presenta datos ficticios anónimos.
- Conservar la finalidad en la revisión de la solicitud y en la ficha del círculo. Los resultados son ilustrativos y quedan fuera de las decisiones de crédito, impago o giro. Los pesos, los umbrales y el efecto de la finalidad siguen abiertos.

## I/O & Edge-Case Matrix

| Escenario | Resultado verificable |
| --- | --- |
| Abrir «Comparar ejemplos» | Se ven dos resultados distintos y las mismas cinco señales, con una explicación breve de las diferencias. |
| Consultar a Diana | Aparece «Historial insuficiente» sin número. El incumplimiento aparece como hecho observado en el otro caso. |
| Cambiar de perfil | El detalle privado anterior desaparece. Los ejemplos siguen disponibles sin mostrar nombres ni historiales privados. |
| Consultar la bolsa | Un integrante habilitado ve la explicación de señales agregadas y los importes vigentes. Un perfil excluido queda fuera. |
| Revisar y enviar una solicitud con otra finalidad | La revisión y la ficha reflejan la finalidad elegida. Los resultados ilustrativos conservan su valor. |

</frozen-after-approval>

## Code Map

- `src/score-state.mjs` — Conservar las consultas de puntaje propio y colectivo. Incorporar casos didácticos separados del historial privado.
- `src/app.mjs`, `index.html` y `styles.css` — Reutilizar «Mi puntaje», la bolsa, el selector y el formato COP. Usar controles accesibles y lectura de una columna a 320 px.
- `fillDetails` ya muestra la finalidad en revisión y ficha. Verificar el recorrido existente.

## Tasks & Acceptance

- [ ] Preparar casos, señales y explicaciones con lenguaje claro.
- [ ] Conectar el comparador y las explicaciones sin cambiar los permisos ni las decisiones existentes.
- [ ] Cubrir la matriz en pruebas y documentar el recorrido en README.

## Implementation Notes

## Plan Change Log

## Review Triage Log

## Verification

- `node --test` — Pasan la matriz y las regresiones del prototipo.
- Chromium a 320 px — Abrir y cerrar el comparador con teclado y tacto, cambiar de perfil, consultar la bolsa y comprobar la finalidad en revisión y ficha.
