# Social Credit Score

Proyecto en fase de diseño para explorar préstamos de bajo monto respaldados por círculos de confianza. La primera prueba será una demo navegable con datos ficticios para personas con ingresos variables y sin cuenta bancaria en Medellín. Se plantea como alternativa al pagadiario o gota a gota.

El alcance previsto de la demo abarca la solicitud y su votación, el uso de la bolsa del círculo ante una cuota impaga y una propuesta de proyecto colectivo. El primer recorrido disponible, HU 1.1, permite preparar una solicitud de ejemplo y entregar su ficha a las personas que confirmaron su respaldo.

## Probar la HU 1.1

Desde la raíz del repositorio, inicia el servidor local con Python y abre la demo en el navegador. Ejecuta las pruebas de reglas con Node.js en otra terminal.

```sh
python -m http.server 8000 --bind 127.0.0.1
```

[Abrir la demo](http://127.0.0.1:8000/)

```sh
node --test
```

1. Como Diana, elige monto, razón y plazo y continúa. Comprueba que cuatro personas confirmaron, Luz tiene una invitación pendiente y «Revisar solicitud» está desactivado.
2. En «Cambiar perfil de prueba», elige Luz. Lee el tope de $10.000 COP y el caso en que tendría que aportar. Para probar el rechazo, elige «No aceptar», vuelve a Diana y comprueba que el contador sigue en cuatro. Invita a Mateo desde el grupo y cambia a su perfil para aceptar. En el recorrido directo, acepta como Luz.
3. Vuelve a Diana y abre «Revisa y envía». Comprueba monto, razón, plazo, frecuencia, cuota, intereses de ejemplo y total. Entra a «Corregir datos», comprueba que se mantienen las opciones anteriores, ajusta una y revisa nuevamente antes de enviar.
4. Envía la solicitud. Cambia a Ana y abre el único aviso de su bandeja. Comprueba el resumen de Diana, la ausencia de historial, las condiciones enviadas y el tope propio. Cambia a un perfil sin confirmar y comprueba su estado y la bandeja vacía. Para probar el caso pendiente, deja una invitación adicional sin responder antes de enviar.
5. Repite el recorrido a 320 px de ancho, con teclado o tacto, y al 200 % de tamaño de texto. Comprueba el foco visible, los estados escritos y que el contenido cabe en el ancho disponible.

La demo conserva el borrador, el grupo y la ficha enviada en la sesión de la pestaña, incluso al recargar. Abre la dirección en una ventana privada nueva para empezar desde el principio.

## Documentación

- [PRD v0.5](_bmad-output/initiative-credito-comunitario/prd-inclusion-financiera/prd-inclusion-financiera.md) con el alcance, las decisiones confirmadas y las preguntas abiertas.
- [Spec de iniciativa](_bmad-output/initiative-credito-comunitario/initiative-credito-comunitario.md) con requisitos trazables al PRD.
- [Registro de épicas](_bmad-output/initiative-credito-comunitario/tickets/tickets.toml) con la primera división propuesta.
- [Spec de épica · Solicitud y decisión del círculo](_bmad-output/initiative-credito-comunitario/tickets/epic-solicitud-y-votacion/epic-solicitud-y-votacion.md)
- [Spec de épica · Bolsa, impagos y proyectos colectivos](_bmad-output/initiative-credito-comunitario/tickets/epic-bolsa-y-proyectos/epic-bolsa-y-proyectos.md)
- [Spec de épica · Puntajes y seguimiento privado](_bmad-output/initiative-credito-comunitario/tickets/epic-puntajes-y-seguimiento/epic-puntajes-y-seguimiento.md)

## Trabajo con BMAD

El directorio `_bmad-output` sigue la estructura del árbol de iniciativas de BMAD v7. El PRD conserva las decisiones de producto y el spec de iniciativa las traduce a requisitos `R<n>`. Cada épica cita los requisitos que cubre. El primer desglose propone nueve historias con una comprobación por historia. Cada registro indica qué requisito cubre y qué trabajo necesita antes. El orden y las historias quedan para revisión. [Guía del árbol de tickets de BMAD](https://docs.bmad-method.org/plan/set-up-the-ticket-tree/).

## Historias de usuario

- [Solicitud y votación](_bmad-output/initiative-credito-comunitario/tickets/epic-solicitud-y-votacion/tickets/tickets.toml).
- [Bolsa, impagos y proyectos](_bmad-output/initiative-credito-comunitario/tickets/epic-bolsa-y-proyectos/tickets/tickets.toml).
- [Puntajes y seguimiento](_bmad-output/initiative-credito-comunitario/tickets/epic-puntajes-y-seguimiento/tickets/tickets.toml).

La primera historia lleva una solicitud de ejemplo hasta la ficha que recibe el círculo. La votación y la comprobación del costo preceden al desembolso. Una vez disponible el tablero de la bolsa, los puntajes pueden avanzar en paralelo con los escenarios de impago y proyecto.

## Pull requests

Abrir los PRs de este proyecto en [AlejoRoldan/social-credit-score](https://github.com/AlejoRoldan/social-credit-score/pulls), desde una rama de trabajo y con destino a `main`. En cada PR, indicar qué requisitos aborda y cómo se verificaron. Si cambia una decisión de producto, actualizar el PRD y el spec correspondiente.
