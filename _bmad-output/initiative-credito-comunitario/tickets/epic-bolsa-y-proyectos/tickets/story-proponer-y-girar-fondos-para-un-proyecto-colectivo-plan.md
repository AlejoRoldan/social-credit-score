---
title: "HU 2.3 · Proponer y girar fondos para un proyecto colectivo"
type: feature
ticket: 3
created: "2026-11-11"
status: built
baseline_revision: "b97334bf67f974174e80edf91535636f367969d1"
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

El grupo artístico puede proponer un gasto, revisar su finalidad y decidir si usa el saldo libre de la bolsa. La demo muestra qué cambia cuando el grupo confirma el giro.

## Boundaries & Constraints

- Caso independiente de la cuota impaga. El ejemplo propone $50.000 COP para materiales de un taller. Mostrar saldo, reserva, compromisos y disponible del proyecto. La bolsa parte de $120.000 de saldo, $40.000 de reserva y $20.000 comprometidos. Los giros se descuentan del saldo libre y conservan la reserva, los compromisos, los intereses cobrados y el presupuesto de la operación.
- Propuesta para la demo. Los cinco integrantes precargados pueden proponer, votar explícitamente y confirmar un giro. Si un integrante propone, su voto se registra por separado. Diana puede consultar el ejemplo. Los perfiles ajenos al caso quedan fuera.
- Cada ficha conserva finalidad, importe y padrón. Validar importe positivo en COP enteros y mostrar cuánto excede el disponible antes de enviar. Una propuesta activa se vota con las condiciones congeladas. Si se rechaza, el grupo puede enviar otra con votos nuevos.
- El giro requiere unanimidad y una confirmación explícita. Revalidar saldo y vincular cada movimiento a su propuesta para evitar duplicados al repetir la confirmación o recargar. Conservar el estado en la sesión de la pestaña.

## I/O & Edge-Case Matrix

| Escenario | Resultado verificable |
| --- | --- |
| Abrir el caso | $60.000 COP disponibles para proyectos. |
| Proponer $65.000 | Se indica que excede el disponible en $5.000. Se conservan los saldos. |
| Cuatro votos favorables o un rechazo | El giro sigue bloqueado. La bolsa conserva sus saldos. |
| Cinco votos favorables y confirmación de $50.000 | Se registra un giro. Quedan $70.000 de saldo y $10.000 disponibles. La reserva sigue en $40.000 y los compromisos en $20.000. |
| Repetición, recarga o perfil sin permiso | Se conserva un solo movimiento. Un perfil sin permiso carece de acceso a las acciones. |
| Importe igual al disponible | Se permite el giro con unanimidad y confirmación. Quedan $0 disponibles. |

</frozen-after-approval>

## Code Map

- `src/finance-state.mjs` — Reutilizar `getOperationVoteStatus` y extender `projectCircleFund` para descontar el giro del saldo. Conservar los recorridos de reserva y crédito.
- `src/app.mjs` — Conectar la vista desde «Bolsa del círculo». Reutilizar navegación por perfil, formato COP, `renderFacts` y persistencia de la sesión.
- `test/installment-state.test.mjs` y `test/finance-state.test.mjs` — Patrones de permisos, reintentos y restauración.

## Tasks & Acceptance

- [x] Modelo de proyecto — Registrar propuesta, votos y giro único con saldo verificado. Mantener el caso aislado del impago.
- [x] `index.html`, `src/app.mjs` y `styles.css` — Permitir proponer, votar, confirmar y consultar el resultado en móvil. Mostrar el importe excedido y el motivo cuando el giro siga bloqueado.
- [x] `test/` y `README.md` — Cubrir la matriz y documentar el recorrido del taller.

## Implementation Notes

- Pasaron 35 pruebas de Node y los recorridos de proyecto y cuota impaga en Chromium a 320 px. Se corrigieron los tres hallazgos de revisión.

## Plan Change Log

## Review Triage Log

| Fecha | Hallazgo | Veredicto | Evidencia y decisión |
| --- | --- | --- | --- |
| 2026-11-11 | El acceso al voto de Luz queda en Proyecto colectivo | medium | Reproducido en Chromium antes del desembolso. Parche para dirigir el acceso explícito a la ficha. |
| 2026-11-11 | Finalidad vacía oculta el exceso del importe | medium | La validación retornaba antes de calcular el exceso. Parche para validar primero importe y saldo. |
| 2026-11-11 | La vista devuelve referencias al padrón y a los votos | medium | El consumidor podía modificar el estado a través de la ficha devuelta. Parche para devolver copias de los datos anidados. |

## Verification

- `node --test` — Pasan la matriz y las regresiones de crédito, bolsa e impago.
- Chromium a 320 px — Completar la propuesta, los votos y el giro con teclado y tacto. Recargar y verificar el saldo y el movimiento único.
