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

## Probar la HU 2.2

### Recorrido guiado con reserva

1. Selecciona «Iniciar demo». La ficha de Luz se abre con cuatro votos favorables. Emite el último voto para registrar el desembolso y usa «Volver al perfil de Diana».
2. Como Diana, elige «Simular la siguiente cuota». La cuota vencida de $100.000 COP es un ejemplo independiente. Diana ya pagó $40.000 COP y quedan $60.000 COP pendientes mientras el grupo vota sobre la reserva.
3. Cambia a Ana, Camilo, Elena, José y Luz para votar a favor de usar $25.000 COP. La vista de Diana ofrece un acceso al siguiente perfil. Recarga después del cuarto voto y comprueba que se conservan el perfil, el ejemplo y los cuatro votos, con saldo de $120.000 COP y reserva de $40.000 COP. Después del quinto voto, el saldo baja a $95.000 COP y la reserva a $15.000 COP. El disponible sigue en $60.000 COP.
4. En cada perfil de respaldo, comprueba que aparece solo su aporte de $7.000 COP. Simula un pago como Ana, Camilo, Elena y José, y un aporte fallido como Luz. Vuelve a Diana y comprueba los $28.000 COP realizados por el grupo, los $7.000 COP pendientes y las cinco asignaciones originales. Recarga para comprobar que persisten el fallo y los saldos.
5. Para probar otro desenlace, reinicia y vota en contra en la cuota. El caso queda pendiente de resolución con $60.000 COP por cubrir y la bolsa conserva sus saldos iniciales.

### Variante con bolsa vacía

1. Desde «Cuota pendiente», elige «Bolsa vacía». En la guía aparece después de completar los aportes del caso con reserva o de un voto en contra. Los cinco aportes de $10.000 COP se asignan de inmediato.
2. Simula los cinco pagos y vuelve a Diana. Quedan $10.000 COP pendientes después del pago propio de $40.000 COP y los $50.000 COP del grupo. Al alternar las variantes, cada una conserva sus votos, aportes y saldos.

Los dos ejemplos también están disponibles desde «Cuota pendiente» en el recorrido normal. «Ir al recorrido normal» conserva el avance de la demo guiada, y «Reiniciar demo» repone la ficha de Luz con cuatro votos y reinicia los dos ejemplos guiados. Los cambios de cada recorrido se guardan en la sesión de la pestaña. Para verificar permisos, elige a Mateo o Rosa desde cualquiera de los dos ejemplos. En Chromium a 320 px, usa Tab, Enter y tacto emulado para recorrer los controles y comprobar el foco visible.

## Probar la HU 2.3

1. Abre «Bolsa del círculo» como Diana y elige «Abrir proyecto colectivo». El grupo artístico parte de $120.000 COP de saldo, $40.000 COP de reserva y $20.000 COP de compromisos. Tiene $60.000 COP disponibles para proyectos. Diana puede consultar el caso.
2. Cambia a Ana. La finalidad precargada es «Materiales para un taller». Ingresa $65.000 COP y comprueba que el formulario muestra un exceso de $5.000 COP. Corrige el importe a $50.000 COP y elige «Enviar propuesta». La ficha conserva la finalidad, el importe y los cinco integrantes, con cero votos.
3. Vota a favor como Ana, Camilo, Elena y José. Comprueba que el giro sigue bloqueado y los saldos se conservan. Cambia a Luz y emite el quinto voto. El importe permanece disponible hasta que un integrante elija «Confirmar giro de $50.000 COP».
4. Confirma y comprueba que se registra un giro para la propuesta. El saldo queda en $70.000 COP y el disponible en $10.000 COP. La reserva, los compromisos, los intereses cobrados y los presupuestos de la operación conservan sus importes. Recarga la pestaña y comprueba el giro y los saldos. El ejemplo de «Cuota pendiente» mantiene sus propios saldos y decisiones.
5. En una sesión nueva, vota en contra y verifica que el giro queda bloqueado. Envía otra propuesta por $60.000 COP y comprueba que parte con cero votos y que la ficha anterior aparece en «Propuestas anteriores». Tras cinco votos a favor y la confirmación, quedan $0 COP disponibles. Cambia a Mateo o Rosa para verificar que carecen de acceso al caso.
6. En Chromium a 320 px, usa Tab y Enter o Espacio para abrir la ficha, enviar, votar y confirmar. Usa el selector de perfiles para emitir los cinco votos. Repite con tacto emulado y recarga para verificar el movimiento único.

## Probar la HU 3.1

1. Selecciona **Ana** y abre **Mi puntaje** para ver un puntaje ficticio y su resumen privado.
2. Cambia a **Diana** o a otro perfil desde **Cambiar perfil de prueba**. La vista muestra **Historial insuficiente** y retira el resultado anterior. Abre otra vista y vuelve a **Mi puntaje** para comprobar que refleja el perfil activo.
3. Con **Diana** o un respaldante habilitado, abre **Bolsa del círculo**. Allí aparecen el puntaje ficticio del grupo, sus señales agregadas y los importes vigentes. Cambia a **Luz** mientras su invitación siga pendiente, o a un perfil ajeno al padrón vigente, para comprobar que pierde el acceso a la bolsa.
4. Registra el giro colectivo de **$50.000 COP** del recorrido anterior y vuelve a **Bolsa del círculo** con un perfil habilitado. El disponible para proyectos pasa de **$60.000 COP** a **$10.000 COP** y el puntaje colectivo conserva su valor.

Los puntajes son ejemplos precargados. Las decisiones de crédito, impago y giro siguen sus propias reglas.

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
