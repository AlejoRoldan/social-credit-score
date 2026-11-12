---
title: "HU 2.1 · Consultar la bolsa y registrar un desembolso de crédito"
type: feature
ticket: 1
created: "2026-11-10"
status: built
review: quick
review_source: pinned
baseline_revision: "1f02f118b2494d0023bc2a9878ce330300887808"
route: full
route_source: auto
risk: high
lenses_ran: [quick]
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

Mostrar de dónde sale cada peso ficticio. La persona solicitante y los respaldantes habilitados podrán consultar la bolsa del círculo. Al obtener una autorización de la HU 1.3, la demo registra el principal con cargo exclusivo al presupuesto de créditos y muestra el resultado.

## Boundaries & Constraints

- La bolsa muestra intereses cobrados, saldo, reserva, compromisos y disponible. El disponible es el saldo menos la reserva y los compromisos distintos. El ejemplo del PRD usa $150.000 COP de intereses acumulados, $120.000 de saldo, $40.000 de reserva y $20.000 comprometidos. Quedan $60.000 disponibles.
- El presupuesto inicial ficticio separa $1.000.000 COP para créditos, $300.000 para plataforma y $200.000 para personal. Un desembolso reduce solo créditos por el monto principal autorizado. La bolsa y las otras partidas conservan su saldo.
- Propuesta para la demo. Registrar automáticamente después del voto que habilita la autorización, o al cargar una sesión anterior que ya cumple los requisitos. Comprobar la autorización vigente y el saldo al registrar. Guardar la ronda y el movimiento en la misma sesión. Una vez registrado, la solicitud queda cerrada a nuevas versiones.
- El tablero está disponible para Diana y los respaldantes confirmados. Tras el envío, el acceso de los respaldantes se limita al padrón vigente. Todo se simula con datos ficticios. Los impagos y los proyectos corresponden a HU 2.2 y HU 2.3.

## I/O & Edge-Case Matrix

| Escenario | Entrada o estado | Resultado verificable |
| --- | --- | --- |
| Tablero inicial | Bolsa del ejemplo del PRD | Las cinco cifras se muestran por separado. La reserva y los compromisos se descuentan una vez. |
| Registro | Autorización vigente por $300.000 COP con capital suficiente | Se guarda un movimiento identificado por autorización. Créditos pasan de $1.000.000 a $700.000. Plataforma, personal y bolsa conservan sus valores. |
| Reintento | Misma autorización, recarga o doble ejecución | Se conserva un movimiento y el mismo saldo. Una solicitud registrada no admite una nueva versión. |
| Bloqueo | Sin autorización vigente, costo superior al límite, versión obsoleta o saldo de créditos insuficiente | El registro se rechaza sin cambiar el movimiento ni los saldos. Diana puede ver el motivo. |
| Sesión anterior | Ficha guardada sin movimiento financiero | Se conserva la ficha y sus votos. La comprobación registra una sola vez si la versión ya estaba habilitada y tiene fondos. |

</frozen-after-approval>

## Code Map

- `src/demo-state.mjs`: `getDisbursementAuthorization` entrega ID, versión y principal de la ficha vigente. Reusar su validación. `submitRevision` es el punto de control para una solicitud ya desembolsada.
- `src/app.mjs`: `loadState` y `saveState` conservan la sesión. El controlador de voto guarda después de aplicar la decisión. `show` y `renderApplicantStatus` controlan vistas por perfil y resultado.
- `index.html` y `styles.css`: las fichas reutilizan controles nativos, estados escritos y tarjetas de cifras. Mantener el patrón para el tablero.

## Tasks & Acceptance

- [x] `src/finance-state.mjs` y `src/demo-state.mjs` — Preparar los saldos ficticios y el registro único, computar saldos desde los movimientos y proteger la revisión de una solicitud ya registrada.
- [x] `index.html`, `src/app.mjs` y `styles.css` — Añadir acceso al tablero por rol y mostrar en la vista de Diana el monto registrado o el bloqueo. Persistir el movimiento junto con la sesión.
- [x] `test/finance-state.test.mjs` — Verificar la matriz, el acceso por rol y que el presupuesto nunca quede negativo. `README.md` — Documentar los recorridos de registro y bloqueo.

**Criterios de aceptación**

- Dado un perfil habilitado, al abrir la bolsa se distinguen los recursos del círculo y los presupuestos de la operación en COP. Un perfil pendiente o excluido de la versión vigente queda fuera del tablero.
- Dada una ficha registrada, al volver a la vista de Diana se lee «Desembolso simulado registrado» con el monto. En un ancho de 320 px se puede consultar el estado con teclado, foco visible y controles táctiles de al menos 44 × 44 px.

## Implementation Notes

- 24 pruebas de Node y recorrido en Chromium a 320 px aprobados. Se verificó también el regreso de Diana al estado de una solicitud desembolsada cuando había dejado una revisión abierta.

## Plan Change Log

## Review Triage Log

| Fecha | Hallazgo | Veredicto | Evidencia y decisión |
| --- | --- | --- | --- |
| 2026-11-11 | El borrador de revisión seguía abierto al volver a Diana tras el registro | medium | La vista conservaba el editor por `editingVersion`. Parche para mostrar el estado registrado al volver a la solicitud. |
| 2026-11-11 | La interfaz no muestra una autorización obsoleta | false | La UI registra en la misma ejecución que actualiza el voto, usando la autorización vigente calculada del estado. Una ficha histórica tampoco puede votar. El rechazo de una autorización obsoleta suministrada explícitamente se verifica en el modelo. |
| 2026-11-11 | Claves duplicadas de revisión en el diff inicial | low | El diff de revisión capturó las claves vacías iniciales junto a las nuevas. Se quitaron las claves duplicadas del plan antes del cierre. |

## Verification

- `node --test` — Pasan las pruebas existentes y la matriz de autorización, registro, saldos y restauración.
- `python -m http.server 8000 --bind 127.0.0.1` — En Chromium a 320 px, comparar el tablero antes y después de autorizar $300.000 COP. Recargar y comprobar que el movimiento y los saldos se conservan.
