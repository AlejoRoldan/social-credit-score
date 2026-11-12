---
title: "HU 1.2 · Votar o dejar pendiente para reunión"
type: feature
ticket: 2
created: "2026-11-10"
status: built
baseline_revision: "663d82e7ebc815cd0affd15acfbe00e2301f2db4"
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

La HU 1.1 entrega una ficha ficticia a cada respaldo confirmado. La HU 1.2 permite a esas personas decidir sobre la misma propuesta, pausarla para deliberar y registrar su voto al retomar. La persona solicitante ve el estado.

## Boundaries & Constraints

- Solo vota el grupo habilitado para la versión vigente. La persona solicitante, los perfiles pendientes y los ajenos quedan fuera. Los avisos y las fichas conservan sus permisos.
- Cada versión fija monto, finalidad, condiciones y electores. Al cambiar alguno, la nueva ficha parte con cero votos y el grupo conserva acceso al historial que le corresponde.
- La unanimidad indica «Aprobada por el grupo». La verificación de costo y la autorización del desembolso corresponden a HU 1.3. Los datos y las acciones son ficticios.
- Cuando todos los electores registran su voto y hay al menos uno en contra, la versión queda «Rechazada». Mientras falten votos, un voto en contra mantiene la versión «En revisión» e impide la aprobación.
- En la demo, cualquier integrante habilitado puede pausar o retomar. Retomar abre una ronda sin votos sobre la misma ficha. Los votos anteriores quedan en el historial de esa versión.

## I/O & Edge-Case Matrix

| Escenario | Estado previo y acción | Resultado |
| --- | --- | --- |
| Votos incompletos | Cinco de seis aprueban | «En revisión». El sexto voto favorable completa la unanimidad. |
| Reunión | El grupo deja pendiente y luego retoma | «Pendiente de reunión» bloquea el avance. Al retomar la misma versión cada integrante registra su decisión individual. |
| Voto en contra | Un integrante habilitado vota en contra | «En revisión» si faltan respuestas. «Rechazada» cuando todos han votado. |
| Acceso | Vota la persona solicitante, un perfil sin confirmar o un elector sobre una versión antigua | La acción se rechaza y el conteo vigente se conserva. |
| Cambios | Se modifica el monto, la finalidad, las condiciones o el conjunto de electores | Se crea otra versión en revisión, con cero votos e historial anterior consultable por el grupo habilitado para esa versión. |

</frozen-after-approval>

## Code Map

- `src/demo-state.mjs`: `submitApplication` congela ficha y destinatarios en `state.sent`. Reusar ese padrón inicial y `loanDetails`. `getInbox` entrega ficha y tope por perfil. `updateDraft` y las invitaciones de la HU 1.1 se cierran tras enviar.
- `src/app.mjs`: `loadState` y `saveState` conservan la sesión. `show` y `fillDetails` conectan la vista de Diana, la bandeja y la ficha. Mantener el mismo almacenamiento y recuperar las sesiones de HU 1.1 como primera versión sin votos.
- `test/demo-state.test.mjs`: ya prueba seis confirmados, perfiles excluidos y restauración de una solicitud. Reusar estos casos.

## Tasks & Acceptance

- [x] `src/demo-state.mjs` — Modelar decisiones y versiones, validar actor y versión en cada acción y conservar el historial. Mantener compatible el contenido de la ficha.
- [x] `index.html`, `src/app.mjs`, `styles.css` — Añadir estado de la solicitud, decisión individual, pausa, retorno a la misma ficha e historial. Reusar el formulario de condiciones para enviar una nueva versión de prueba con electores confirmados.
- [x] `test/demo-state.test.mjs` — Cubrir la matriz y la recuperación de sesiones guardadas. `README.md` — Documentar cómo ensayar los escenarios con seis perfiles.

**Criterios de aceptación**

- Dada una reunión pendiente, al volver desde la bandeja se identifica la versión, el estado y qué puede hacer cada rol. Al registrar el resultado, la persona solicitante ve el nuevo estado.
- Dada una ficha abierta, al votar con teclado o tacto en una pantalla de 320 px, el estado se expresa con texto, el foco es visible y los controles principales conservan áreas táctiles de 44 × 44 px.
- Dada una solicitud guardada por la HU 1.1, al abrir la demo actualizada aparecen la ficha original, sus destinatarios y el nuevo estado «En revisión».

## Implementation Notes

- La sesión existente conserva la ficha inicial. Cada elector emite un voto por ronda y las nuevas versiones mantienen el mínimo de cinco respaldantes confirmados. El historial muestra conteos y la decisión propia del perfil activo.
- Pasaron 14 pruebas de Node y el recorrido de Chromium a 320 px con teclado y tacto emulado, incluida la recuperación de una sesión de la HU 1.1.
- Se repitieron las pruebas de Node y el recorrido de Chromium tras corregir la revisión. También se comprobó la vista del respaldo histórico, el costo de una versión nueva y el orden de lectura y foco de la ficha.

## Plan Change Log

## Review Triage Log

### Revisión rápida · 2026-11-10

Hallazgos: 0 altos, 4 medios, 0 bajos, 0 falsos y 0 sin verificar. Los cuatro se corrigieron.

| Hallazgo | Veredicto | Ruta | Evidencia y ajuste |
| --- | --- | --- | --- |
| Bandeja incompatible con motores sin `toReversed()` | medium | patch | Consultar cualquier bandeja requería ese método incluso sin historial. Ahora se invierte una copia y la prueba verifica el orden de tres fichas y del historial guardado. |
| Respaldo histórico presentado como vigente | medium | patch | Mateo podía quedar fuera de la versión nueva y seguir viendo un aporte activo. La vista ahora identifica su estado y conserva el acceso a la ficha histórica. |
| Acciones de voto antes de las condiciones | medium | patch | El orden permitía llegar a los botones antes de leer monto y condiciones. Las acciones ahora van después de los importes. |
| Costo ausente antes de enviar una versión editada | medium | patch | El formulario de revisión enviaba los cambios sin mostrar el nuevo total. Ahora muestra la cuota, los intereses ficticios y el total antes del envío. |

## Verification

- `node --test` — Pasan las pruebas de la HU 1.1 y los casos de permisos, reunión, rechazo, unanimidad y versiones de esta HU.
- `python -m http.server 8000 --bind 127.0.0.1` — Recorrer ambos roles en Chromium a 320 px con teclado y tacto emulado. Confirmar que una segunda versión muestra sus propias condiciones y votos, y que la primera sigue consultable.
