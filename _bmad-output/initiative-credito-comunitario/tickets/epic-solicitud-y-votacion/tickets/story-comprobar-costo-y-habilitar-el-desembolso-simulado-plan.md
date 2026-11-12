---
title: "HU 1.3 · Comprobar costo y habilitar el desembolso simulado"
type: feature
ticket: 3
created: "2026-11-10"
status: built
baseline_revision: "d1d0db3a9a9c41bdb97e346afdda49a465ca7305"
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

La HU 1.2 ya muestra si el grupo aprobó una ficha por unanimidad. La HU 1.3 agrega una comprobación independiente del costo y muestra si la versión vigente queda habilitada para un desembolso simulado.

## Boundaries & Constraints

- Usar el costo de la ficha votada. La tasa ilustrativa es el interés total dividido entre el monto y las semanas del plazo. El límite ficticio es 2 % por semana y se admite la igualdad. Esta comparación prorrateada es una regla de la demo, sin equivalencia con la tasa efectiva anual ni con el límite legal.
- Mantener visibles tasa ilustrativa, intereses, cuota y total en COP en la revisión, la edición y la ficha. Mostrar a Diana por separado la decisión del grupo y el resultado de la comprobación del costo, con explicación si se bloquea.
- Exponer una autorización consultable con identificador estable por solicitud y versión, número de versión y monto principal en COP. Solo existe para la versión vigente, con unanimidad en su última ronda y costo dentro del límite. La HU 2.1 registrará el movimiento con esa autorización.
- Mantener fichas, destinatarios, votos e historial de sesiones anteriores. Calcular la tasa ilustrativa desde sus importes guardados. La HU no gira dinero ni actualiza presupuestos.

## I/O & Edge-Case Matrix

| Escenario | Estado previo y acción | Resultado |
| --- | --- | --- |
| Costo dentro del límite | Propuesta vigente a 8 semanas con interés total de 10 % y todos los votos a favor | La tasa prorrateada de 1,25 % queda dentro del límite. Se obtiene una autorización estable para esa versión y monto. |
| Costo en el límite | Propuesta vigente a 5 semanas con interés total de 10 % y unanimidad | La tasa prorrateada de 2 % cumple la regla ficticia. |
| Costo superior | Propuesta vigente a 4 semanas con interés total de 10 % y unanimidad | El grupo figura como aprobado y el desembolso como bloqueado por costo. Se muestra 2,5 % frente al límite de 2 %. |
| Falta una condición | La ronda está incompleta, pausada o rechazada | El costo dentro del límite por sí solo no produce una autorización. |
| Nueva versión | Una ficha autorizada pasa al historial después de editar condiciones o electores | La autorización anterior deja de estar disponible. La versión nueva requiere unanimidad propia y su propia comprobación. |

</frozen-after-approval>

## Code Map

- `src/demo-state.mjs`: `loanDetails` calcula importes ficticios, `currentVersion` adapta fichas de HU 1.1 y `describeRound` determina el estado de la última ronda. Reusar estas fuentes para calcular la comprobación y consultar la autorización vigente.
- `src/app.mjs` e `index.html`: `fillDetails` alimenta revisión, edición y ficha. `renderApplicantStatus` muestra la decisión del grupo. Conservar los permisos de `getInbox` y el almacenamiento de sesión.
- `test/demo-state.test.mjs`: ya verifica unanimidad, restauración y cambio de versión. Mantener esas regresiones.

## Tasks & Acceptance

- [x] `src/demo-state.mjs` — Calcular el costo ilustrativo y exponer el resultado de la comprobación y la autorización derivada. Una consulta repetida devuelve la misma identidad.
- [x] `index.html`, `src/app.mjs` — Mostrar la tasa prorrateada y el resultado con texto claro. Reusar el formato de cifras y los controles accesibles de la demo.
- [x] `test/demo-state.test.mjs` — Cubrir la matriz, la estabilidad de la autorización y la compatibilidad de las fichas guardadas.
- [x] `README.md` — Documentar cómo probar ambas propuestas con el mismo monto y plazos diferentes.

**Criterios de aceptación**

- Dada una ficha aprobada por el grupo, al abrir el estado de Diana se distinguen la decisión del grupo y el resultado del desembolso simulado. Si el costo bloquea, se indica cuánto supera el límite de la demo.
- Dada una ficha histórica o restaurada, al consultar sus condiciones se conservan cuota, interés y total originales. Los importes y la tasa se leen a 320 px con el foco visible al usar teclado.

## Implementation Notes

- El costo se deriva de los importes guardados, con el mismo formato en revisión, edición y ficha. La autorización consultable contiene identificador, versión y principal en COP.
- Pasaron 18 pruebas de Node y dos recorridos de Chromium a 320 px con foco visible por teclado, ficha histórica, edición y restauración de la autorización. También pasó la comprobación dirigida sin Web Crypto.

## Plan Change Log

## Review Triage Log

### Revisión rápida · 2026-11-10

Hallazgos: 0 altos, 4 medios, 0 bajos, 0 falsos y 0 sin verificar. Los cuatro se corrigieron.

| Hallazgo | Veredicto | Ruta | Evidencia y ajuste |
| --- | --- | --- | --- |
| Identificador compartido por solicitudes antiguas | medium | patch | Dos fichas sin ID podían producir la misma autorización. Al cargar se asigna un identificador propio y se guarda en la sesión. |
| Error al enviar sin Web Crypto | medium | patch | Sin el objeto global `crypto` fallaba el envío. La demo genera un identificador alternativo en ese entorno. |
| Vista previa ausente al corregir el borrador | medium | patch | «Corregir datos» devolvía a la edición sin los importes. La edición del borrador y de la versión reutilizan la misma vista previa. |
| Exceso positivo redondeado a cero | medium | patch | Con un peso por encima del límite, el bloqueo decía que el exceso era de cero. Se indica que el exceso es menor que 0,01 puntos porcentuales. |

## Verification

- `node --test` — Pasan los casos existentes y la matriz de costo, autorización y versiones.
- `python -m http.server 8000 --bind 127.0.0.1` — En Chromium a 320 px, comparar dos fichas unánimes a 4 y 8 semanas y comprobar que la versión nueva requiere votos propios.
