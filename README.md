# Social Credit Score

Proyecto en fase de diseño para explorar préstamos de bajo monto respaldados por círculos de confianza. La primera prueba será una demo navegable con datos ficticios para personas con ingresos variables y sin cuenta bancaria en Medellín. Se plantea como alternativa al pagadiario o gota a gota.

La demo recorre la solicitud y su votación, el uso de la bolsa del círculo ante una cuota impaga y una propuesta de proyecto colectivo. El grupo recibe la ficha por la app y puede aprobar, dejar pendiente para reunirse o rechazar. Tras una reunión, cada respaldante registra su voto sobre la misma versión. El aporte inicial propuesto de inversión de impacto separa el capital de crédito del presupuesto de plataforma y personal.

## Documentación

- [PRD v0.5](_bmad-output/initiative-credito-comunitario/prd-inclusion-financiera/prd-inclusion-financiera.md) con el alcance, las decisiones confirmadas y las preguntas abiertas.
- [Spec de iniciativa](_bmad-output/initiative-credito-comunitario/initiative-credito-comunitario.md) con requisitos trazables al PRD.
- [Registro de épicas](_bmad-output/initiative-credito-comunitario/tickets/tickets.toml) con la primera división propuesta.
- [Spec de épica · Solicitud y decisión del círculo](_bmad-output/initiative-credito-comunitario/tickets/epic-solicitud-y-votacion/epic-solicitud-y-votacion.md)
- [Spec de épica · Bolsa, impagos y proyectos colectivos](_bmad-output/initiative-credito-comunitario/tickets/epic-bolsa-y-proyectos/epic-bolsa-y-proyectos.md)
- [Spec de épica · Puntajes y seguimiento privado](_bmad-output/initiative-credito-comunitario/tickets/epic-puntajes-y-seguimiento/epic-puntajes-y-seguimiento.md)

## Trabajo con BMAD

El directorio `_bmad-output` sigue la estructura del árbol de iniciativas de BMAD v7. El PRD conserva las decisiones de producto y el spec de iniciativa las traduce a requisitos `R<n>`. Cada épica cita los requisitos que cubre. El siguiente paso es revisar esta división, refinar cada épica y convertirla en historias con criterios de verificación. [Guía del árbol de tickets de BMAD](https://docs.bmad-method.org/plan/set-up-the-ticket-tree/).

## Pull requests

Abrir los PRs de este proyecto en [AlejoRoldan/social-credit-score](https://github.com/AlejoRoldan/social-credit-score/pulls), desde una rama de trabajo y con destino a `main`. En cada PR, indicar qué requisitos aborda y cómo se verificaron. Si cambia una decisión de producto, actualizar el PRD y el spec correspondiente.
