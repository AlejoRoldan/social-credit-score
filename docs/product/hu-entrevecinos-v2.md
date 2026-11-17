# Historias de usuario · Entrevecinos V2

Todas son P0 para la prueba de V2. Los identificadores V2-HU se usan en este backlog de implementación. El RFC enlaza las decisiones y los requisitos se remontan al PRD. [RFC](../technical/rfc-entrevecinos-v2.md) · [PRD](../../_bmad-output/initiative-credito-comunitario/prd-entrevecinos-v2/prd-entrevecinos-v2.md)

## V2-HU-01 · Comparar dos plazos antes de solicitar

**Como Diana o Camila**, quiero comparar dos plazos para el mismo monto para elegir una cuota que pueda sostener. **Estado:** primer corte implementado localmente. FR-21, BE-01, FE-01, UX-01.

1. Dado un borrador válido, al abrir la comparación veo el plazo elegido y una alternativa distinta con las mismas etiquetas para monto recibido, cuota, total, vencimiento, interés y tasa.
2. Al cambiar el plazo alternativo, el simulador recalcula esa opción y conserva monto, finalidad y plazo del borrador. Al recargar antes de elegir se restaura el plazo original.
3. Para $400.000 COP, ocho semanas muestran $55.000 por cuota y cuatro muestran $110.000. Ambas suman $440.000 y cuatro semanas presentan el aviso de bloqueo por costo.
4. Al pulsar **Usar el plazo alternativo**, se actualiza el plazo, el resumen y el borrador persistido. El mismo comportamiento aplica al editar una solicitud, con las reglas de revisión vigentes.
5. La comparación funciona con teclado y muestra ambas opciones en orden de lectura en pantallas estrechas.

## V2-HU-02 · Entender y responder al respaldo

**Como Luz**, quiero saber qué acepto y qué quedará por decidir. **Estado:** implementada y verificada localmente. **Dependencias:** ninguna de V2. FR-22, FR-23, BE-02, FE-02, UX-02.

1. Con invitación pendiente, veo antes de actuar el aporte máximo, la condición que podría activarlo y el alcance de la aceptación en la demo.
2. Si acepto, recibo confirmación y sé cuándo podré votar. Aceptar no suma un voto. Cuando la ficha está disponible, puedo abrir la versión que me corresponde.
3. Si rechazo, recibo confirmación y mi estado no suma al mínimo. Diana ve cuántos respaldos faltan sin confundirlos con votos.
4. Con una versión sustituida o fuera del padrón, la interfaz explica que no puedo votar y el dominio aplica esa restricción.

## V2-HU-03 · Saber cómo va mi solicitud

**Como Diana**, quiero identificar el estado y saber quién debe actuar para entender si puedo seguir. **Estado:** implementada y verificada localmente. **Dependencia:** V2-HU-02 para la trazabilidad de invitaciones. FR-23, BE-02, BE-03, FE-03, UX-03.

1. Con respaldos pendientes, el estado muestra el conteo y el paso para reunirlos. Con una ficha enviada, distingue votos pendientes, reunión y rechazo.
2. Cuando la aprobación excede el límite o el saldo disponible, veo el motivo junto al estado de desembolso. El saldo conserva su valor.
3. Tras el registro del desembolso, el encabezado refleja el resultado y **Ver mi crédito** es la acción principal. El ejercicio de impago queda identificado como escenario de demo.
4. Recargar o repetir un intento de registro conserva un solo movimiento y recupera el estado.

## V2-HU-04 · Consultar y pagar la próxima cuota

**Como Diana**, quiero revisar la cuota antes de confirmarla y recuperar el comprobante. **Estado:** implementada y verificada localmente. **Dependencia:** V2-HU-03 para el acceso desde seguimiento. FR-24, BE-04, FE-04, UX-03.

1. Con un crédito desembolsado veo importe, vencimiento, saldo pendiente y calendario de la versión registrada.
2. Abrir y cancelar la revisión conserva el saldo. Confirmar descuenta una vez el importe de la cuota revisada, registra el comprobante y muestra el siguiente vencimiento o el crédito pagado.
3. Recargar recupera comprobante, saldo y calendario. Repetir una confirmación ya aplicada conserva la siguiente cuota. Un respaldante queda fuera de esa vista.

## V2-HU-05 · Llegar a ayuda privada desde el recordatorio

**Como Diana**, quiero pedir ayuda desde el recordatorio y poder revisar lo que registré. **Estado:** implementada y verificada localmente. **Dependencia:** V2-HU-03. FR-25, BE-05, FE-04, UX-03.

1. Al elegir **Necesito conversar**, se abre la sección Ayuda privada y el foco llega a su encabezado o primer campo.
2. Abrir o abandonar ayuda conserva el estado sin registrar un envío. Al confirmar un motivo válido, veo que quedó registrada una solicitud simulada.
3. Recargar y volver al recordatorio permite consultar el estado. Cambiar al rol de Luz retira el motivo y el detalle de ayuda.

## V2-HU-06 · Ejecutar y registrar la prueba exploratoria

**Como facilitadora**, quiero ejecutar escenarios repetibles y documentar dónde se atasca cada rol. **Estado:** regresión verificada localmente y guion listo para aplicar. **Dependencias:** V2-HU-01 a V2-HU-05. FR-26, BE-06, FE-05, UX-04. [Guion y fichas de registro](research/protocolo-exploratorio-v2.md)

1. Puedo iniciar el recorrido guiado con datos ficticios y reiniciarlo conservando el avance normal. La recuperación de una sesión dañada muestra un paso disponible.
2. La regresión cubre los dos roles, costo bloqueado, privacidad, pagos, recarga y la separación de sesiones. En 320 px y con texto al 200 % se puede completar el flujo con teclado.
3. El guion recoge en cinco sesiones la comprensión sin ayuda de cifras, respaldo y solicitud privada, según las metas del PRD.
4. El ejercicio de círculos registra por separado la ventana declarada, tiempos de invitación, quinto respaldo y decisión, así como demoras y rechazos. La prueba en navegador sirve para verificar el software y las sesiones aportan la evidencia de uso.
