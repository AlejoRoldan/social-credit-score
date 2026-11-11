---
title: "HU 3.3 · Recibir un recordatorio privado de cuota"
type: feature
ticket: 3
created: "2026-11-11"
status: built
baseline_revision: "d76948d0726f32c51b6cdd0c193efac0252656f1"
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

Diana puede consultar el vencimiento de su primera cuota y elegir un siguiente paso en privado. Un respaldante puede consultar el compromiso que aceptó.

## Boundaries & Constraints

- Propuesta para la demo. Tras el desembolso simulado, «Mi solicitud» muestra «Próxima cuota», la fecha ficticia de vencimiento y el importe semanal de la ficha registrada. Usar una fecha del escenario identificada como ficticia y estable al recargar.
- Ofrecer a Diana «Planeo pagar» y «Necesito conversar». La app guarda la elección vinculada a la solicitud y muestra un siguiente paso breve. Puede cambiar su elección. La acción representa una intención privada dentro de la app.
- El recordatorio, la elección y el siguiente paso solo se muestran a Diana. Al cambiar de perfil se retiran del contenido visible y del contenido de esa vista. Los respaldantes consultan su propio compromiso desde el flujo vigente de respaldo.
- Mantener aisladas la sesión normal y la guiada. No se inicia un pago, un mensaje externo ni un proceso de cobro. La cuota simulada de la HU 2.2 sigue siendo un caso independiente.

## I/O & Edge-Case Matrix

| Escenario | Resultado verificable |
| --- | --- |
| Diana consulta una solicitud desembolsada | Ve el vencimiento ficticio y el importe de la ficha vigente. |
| Diana consulta antes del desembolso | No hay recordatorio de cuota. |
| Diana elige un siguiente paso y recarga | Se conserva la elección. Repetirla mantiene un solo registro. |
| Diana cambia a un respaldante y vuelve | El respaldante no ve el recordatorio ni la elección. Al volver a Diana se recupera su estado. |
| Diana reinicia la demo guiada | La elección del recorrido guiado se limpia y la sesión normal se conserva. |

</frozen-after-approval>

## Code Map

- `src/demo-state.mjs` — Usar `getRecordedDisbursement`, `getApplicationStatus` y el importe de cuota congelado de la versión registrada.
- `src/app.mjs` e `index.html` — Conectar el recordatorio en el estado de la solicitud. Reutilizar formato COP, persistencia por recorrido y selector de perfiles.
- `test/` y `README.md` — Cubrir privacidad, persistencia e importe, y documentar el recorrido.

## Tasks & Acceptance

- [x] Preparar la consulta y el registro privado de la elección.
- [x] Mostrar la fecha, el importe, las dos acciones y el resultado en móvil.
- [x] Cubrir la matriz y actualizar las instrucciones de prueba.

## Implementation Notes

- Pasaron 42 pruebas de Node y el recorrido en Chromium a 320 px con teclado y tacto. El vencimiento ficticio elegido para la demo es el 23 de noviembre de 2026.

## Plan Change Log

## Review Triage Log

| Fecha | Hallazgo | Veredicto | Evidencia y decisión |
| --- | --- | --- | --- |
| 2026-11-11 | La recarga normal abre el recordatorio al respaldante | medium | Se conserva el perfil del respaldante tras un desembolso. Chromium verifica que al recargar la ficha de Ana sigue vacía la vista privada. |
| 2026-11-11 | La prueba de modelo no cubre el reinicio de la guía | false | La verificación de Chromium recarga y reinicia la guía, comprueba que se borra su elección y vuelve al recorrido normal para comprobar que conserva la suya. |

## Verification

- `node --test` — Pasan la matriz y las regresiones de la demo.
- Chromium a 320 px — Recorrer el recordatorio con teclado y tacto, cambiar de perfil, recargar y reiniciar la guía.
