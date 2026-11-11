---
title: "HU 2.2 · Repartir el faltante de una cuota"
type: feature
ticket: 2
created: "2026-11-11"
status: built
baseline_revision: "e76e45201c56d83615fcc879de330b53fea220a9"
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

Diana y su círculo entienden cuánto de una cuota vencida se ha pagado, qué se espera de cada respaldo y cuánto sigue pendiente.

## Boundaries & Constraints

- Caso ficticio del PRD con cuota de $100.000 COP, pago propio de $40.000 y cinco respaldantes confirmados con tope de $10.000 cada uno. Se abre como ejemplo precargado de impago, independiente de la solicitud de la HU 2.1.
- Solo los cinco respaldantes del ejemplo pueden votar por aplicar $25.000 de la reserva. Cada perfil emite un voto para esa operación. Hasta la unanimidad no hay salida de la bolsa ni aportes activados. Un rechazo deja el caso pendiente de resolución.
- Con unanimidad, registrar una sola salida que reduce saldo y reserva por igual. Distribuir el resto en partes iguales en COP, respetando los topes. Distinguir el aporte asignado del realizado. Cada perfil de respaldo ve y simula solo su propio aporte; Diana ve el desglose de la cuota y el total pendiente.
- Incluir una variante independiente con bolsa vacía. Si la reserva a usar es cero, se asignan aportes sin votar una salida. Los aportes fallidos quedan pendientes sin reasignación. Todo persiste al recargar la sesión.

- Prioridad de la presentación. «Iniciar demo» prepara una solicitud ficticia con cinco respaldantes y cuatro votos favorables. Abre el quinto perfil para emitir el último voto. Tras el registro, orientar el regreso a Diana y ofrecer «Simular la siguiente cuota». Indicar en esa pantalla que el importe de la cuota pertenece a un ejemplo independiente del préstamo anterior.
- Mostrar un selector visible de perfil y un siguiente paso claro en cada etapa. «Reiniciar demo» restaura solo el recorrido guiado y permite repetirlo. Mantener el recorrido existente accesible y sus datos separados. Completar primero el caso con reserva y aporte fallido. La bolsa vacía sigue como segunda prioridad.
- Al terminar, Diana puede comprobar el aporte fallido, el pendiente y los saldos antes y después. Probar recarga durante el recorrido. Evitar pasos que dependan de esperar tiempo real.

## I/O & Edge-Case Matrix

| Escenario | Resultado verificable |
| --- | --- |
| Falta al menos un voto favorable | $60.000 pendientes. Saldo $120.000 y reserva $40.000. |
| Unanimidad | Salida única de $25.000. Saldo $95.000, reserva $15.000 y disponible $60.000. Se asignan cinco aportes de $7.000. |
| Cuatro aportes pagados y uno fallido | $7.000 pendientes. Se conservan las cinco asignaciones originales. |
| Bolsa vacía | Se asignan cinco aportes de $10.000. Si se pagan los cinco, siguen pendientes $10.000. |
| Reintento, perfil ajeno o recarga | No se duplican votos, salidas ni pagos. Un perfil ajeno carece de acceso al caso. |

</frozen-after-approval>

## Code Map

- `src/finance-state.mjs` contiene la proyección de la bolsa y el patrón de registro único. Usar la misma proyección para reflejar la salida del caso ficticio. La HU 2.3 podrá reutilizar la validación de unanimidad por operación.
- `src/demo-state.mjs` ya exporta el tope ficticio. Mantener los votos de la cuota en el estado del ejemplo, separados de los votos de crédito.
- `src/app.mjs` concentra navegación, formato COP y persistencia en `sessionStorage`. Reutilizar esos puntos y los controles existentes.

## Tasks & Acceptance

- [x] `src/finance-state.mjs` y modelo de impago — Validar padrón, votos y aportes. Calcular el pendiente desde movimientos realizados. Aislar los saldos de cada variante y del presupuesto de la HU 2.1.
- [x] `index.html`, `src/app.mjs` y `styles.css` — Mostrar «Cuota pendiente», el motivo del bloqueo y el detalle por perfil con controles accesibles en móvil.
- [x] `test/` y `README.md` — Cubrir la matriz y documentar cómo recorrer las dos variantes.

- [x] Recorrido E2E — Precargar último voto, confirmar desembolso, enlazar al caso de cuota, cambiar de perfil, cerrar con el saldo pendiente y reiniciar sin afectar la sesión normal.

## Implementation Notes

- 29 pruebas de Node y recorrido completo en Chromium a 320 px aprobados. La guía y el recorrido normal conservan estados separados. Se corrigieron los tres hallazgos de revisión y se comprobó cada corrección.

## Plan Change Log

## Review Triage Log

| Fecha | Hallazgo | Veredicto | Evidencia y decisión |
| --- | --- | --- | --- |
| 2026-11-11 | Salir del recorrido normal borra una revisión sin enviar | medium | openJourney limpiaba el formulario y la versión al cambiar de recorrido. Parche para recuperar la edición normal. |
| 2026-11-11 | El recorrido guiado ofrece saltarse el caso principal | low | Las variantes estaban disponibles desde el inicio. Parche para ofrecer la bolsa vacía tras completar o bloquear el caso principal. |
| 2026-11-11 | Cambiar de perfil dificulta volver al voto decisivo | medium | showProfile abría la bandeja de Luz y no orientaba el regreso desde otro perfil. Parche de navegación guiada. |

## Verification

- `node --test` — Pasan la matriz de impago y las regresiones del crédito.
- Chromium a 320 px — Recorrer los dos ejemplos con teclado y tacto. Verificar permisos, foco visible y saldos tras recargar.
