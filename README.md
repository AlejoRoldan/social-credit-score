# Social Credit Score

Proyecto en fase de diseño para explorar préstamos de bajo monto respaldados por círculos de confianza. La primera prueba será una demo navegable con datos ficticios para personas con ingresos variables y sin cuenta bancaria en Medellín. Se plantea como alternativa al pagadiario o gota a gota.

El alcance previsto de la demo abarca la solicitud y su votación, el uso de la bolsa del círculo ante una cuota impaga y una propuesta de proyecto colectivo. La HU 1.1 permite preparar una solicitud de ejemplo y entregar su ficha a las personas que confirmaron su respaldo. La HU 1.2 permite que el grupo vote o pause la decisión para una reunión. La HU 1.3 comprueba el costo y habilita el desembolso simulado cuando también hay unanimidad. La HU 2.1 muestra la bolsa y registra el principal contra el presupuesto de créditos.

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

## Probar la HU 1.2 con seis perfiles

1. Antes de enviar, elige 4 semanas para que el costo deje disponible la edición tras la primera votación. Acepta como Luz. Como Diana, invita a Mateo y acepta desde su perfil. Invita también a Rosa y deja su invitación pendiente. Envía como Diana. Ana, Camilo, Elena, José, Luz y Mateo reciben la versión 1. Rosa sigue con la bandeja vacía y Diana ve el estado en su propia vista.
2. Abre la ficha en la bandeja de Ana y vota a favor. Como Camilo, elige «Dejar pendiente para reunión». Vuelve a abrir la versión 1 desde la bandeja y comprueba que muestra «Pendiente de reunión» y ofrece «Retomar votación». Diana también ve el estado pendiente.
3. Retoma como Elena. Comprueba que sigue siendo la versión 1 y la ronda 2 comienza con cero votos. Ana puede consultar el voto que registró en la ronda 1.
4. Para probar la unanimidad, vota a favor desde cinco perfiles y comprueba en la vista de Diana que sigue «En revisión». El sexto voto favorable cambia el estado a «Aprobada por el grupo».
5. Como Diana, elige «Preparar una nueva versión», cambia las condiciones y desmarca a Mateo. Envía la versión 2 con cinco electores. Ana ve las dos fichas con sus propias condiciones y conteos. Mateo conserva acceso a la versión 1 como historial. La versión 2 empieza con cero votos.
6. En la versión 2, registra un voto en contra. Diana ve «En revisión» mientras falten respuestas y «Rechazada» cuando los cinco hayan votado.
7. En Chromium, ajusta el ancho a 320 px. Usa Tab y Enter o Espacio para abrir la ficha y votar, y repite con tacto emulado en otra ronda. Comprueba que el foco es visible, que el estado se lee como texto y que los controles principales miden al menos 44 × 44 px.

La demo conserva el borrador, el grupo, las fichas y sus rondas en la sesión de la pestaña, incluso al recargar. Una ficha guardada por la HU 1.1 aparece como versión 1 «En revisión», con el padrón original y cero votos. Abre la dirección en una ventana privada nueva para empezar desde el principio.

## Probar la HU 1.3 con el mismo monto a 4 y 8 semanas

1. En una sesión nueva, elige $300.000 COP a 4 semanas y continúa al grupo. Acepta el respaldo como Luz. Vuelve a Diana, abre «Revisa y envía» y comprueba la tasa semanal ilustrativa de 2,5 %, los $30.000 COP de intereses, la cuota de $82.500 COP y el total de $330.000 COP.
2. Envía y vota a favor desde las fichas de Ana, Camilo, Elena, José y Luz. Como Diana, comprueba que el grupo aprobó la solicitud y que el desembolso simulado quedó bloqueado por costo. La tasa supera por 0,5 puntos porcentuales el límite ficticio de 2 % semanal.
3. Elige «Preparar una nueva versión», conserva el monto y cambia a 8 semanas. Comprueba que la edición muestra una tasa de 1,25 % y una cuota de $41.250 COP, con los mismos intereses y total. Envía y verifica que la versión 2 queda pendiente de aprobación con cero votos. En la bandeja de Ana, la versión 1 conserva sus condiciones y votos.
4. Vota a favor desde los cinco perfiles en la versión 2 y vuelve a Diana. Aparece «Desembolso simulado registrado». Recarga y verifica que se mantiene. Para probar la igualdad con el límite, repite en una sesión nueva con un plazo de 5 semanas. Una tasa de 2 % también permite registrar el desembolso simulado.
5. En Chromium a 320 px, usa el teclado para recorrer las dos fichas. Comprueba que se ven el foco, la tasa, la cuota, los intereses y el total.

La regla ficticia de la demo divide los intereses totales de la ficha entre el principal y el plazo en semanas. `getDisbursementAuthorization(state)` devuelve `{ id, version, principalCop }` cuando la versión vigente cumple el límite y su última ronda es unánime, y `null` en los demás casos.

## Probar la HU 2.1

1. En una sesión nueva, abre «Bolsa del círculo» como Diana. Comprueba los cinco importes de la bolsa en COP ($150.000 de intereses cobrados, $120.000 de saldo, $40.000 de reserva, $20.000 de compromisos y $60.000 disponibles) y las tres partidas de operación ($1.000.000 para créditos, $300.000 para plataforma y $200.000 para personal).
2. Cambia a Ana y abre la bolsa. Cambia a Luz antes de aceptar su invitación y verifica que la opción desaparece. Tras el envío, solo Diana y los integrantes de la versión vigente pueden abrir el tablero. El paso 5 del recorrido de HU 1.2 permite verificar la exclusión de Mateo.
3. Acepta el respaldo como Luz. Envía como Diana una solicitud de $300.000 COP a 5 semanas y vota a favor como Ana, Camilo, Elena, José y Luz. Como Diana, comprueba el mensaje «Desembolso simulado registrado» por $300.000 COP y que ya no aparece la opción para preparar una nueva versión.
4. Abre la bolsa y comprueba que créditos muestra $700.000 COP, plataforma $300.000 COP y personal $200.000 COP. Las cinco cifras de la bolsa mantienen sus valores. Recarga la pestaña, comprueba el estado de Diana y abre de nuevo la bolsa para verificar los mismos importes.
5. Repite a 320 px de ancho en Chromium. Abre la bolsa y vuelve a «Mi solicitud» con Tab y Enter. Comprueba que el foco es visible y que los controles miden al menos 44 × 44 px.
6. Para comprobar el bloqueo por costo, repite en una sesión nueva con un plazo de 4 semanas y cinco votos a favor. Diana ve «Bloqueado por costo» y el presupuesto de créditos sigue en $1.000.000 COP. `node --test` cubre también el bloqueo por falta de autorización, versión obsoleta y saldo insuficiente, así como el registro único al restaurar una ficha ya autorizada.

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
