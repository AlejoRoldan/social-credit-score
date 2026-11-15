# RFC 001 · Entrevecinos V2

**Estado:** propuesto, con un primer corte local del simulador. **Alcance:** demo de crédito comunitario con datos ficticios.

La V2 prepara el recorrido que Diana usaría para reponer inventario. Compara plazos, reúne respaldos, entiende el resultado del círculo y puede gestionar su primera cuota. Luz recibe una invitación con un compromiso comprensible y vota en un paso posterior. Camila permite contrastar el mismo flujo ante un gasto personal urgente. El PRD contiene los arquetipos, el alcance y las métricas de validación. [PRD V2](../../_bmad-output/initiative-credito-comunitario/prd-entrevecinos-v2/prd-entrevecinos-v2.md) · [Benchmark fintech](../product/research/benchmark-fintech-v2.md)

## Diseño propuesto

| Nivel | Responsabilidad |
| --- | --- |
| Backend y dominio | Calcular ofertas con las reglas actuales, congelar la ficha enviada y verificar perfil, versión y transiciones. Mantener la cuota y el comprobante ligados a la versión desembolsada. |
| Frontend | Presentar comparación y elección como pasos diferenciados. Resolver el título y la acción del seguimiento a partir del estado, llevar a Ayuda privada desde el recordatorio y mostrar confirmaciones recuperables. |
| UX/UI | Aplicar las mismas etiquetas a ambas ofertas, explicar el compromiso antes de aceptar el respaldo y mostrar una acción principal por estado. Validar teclado, foco, mensajes y lectura a 320 px y con texto ampliado. |

## Contratos y comportamiento

- **Simulación.** Entradas válidas del catálogo local: monto, plazo y finalidad. Para comparar, solo cambia el plazo. Ambas opciones presentan importe recibido, interés, tasa ilustrativa semanal, total, cuota y primer vencimiento de ejemplo. El catálogo actual usa cuotas semanales sin cargos adicionales. El límite se calcula por opción y se explica antes del envío cuando aplica. Elegir la alternativa pasa por la misma ruta de cambio del borrador, incluida la edición de una revisión.
- **Seguimiento.** La ficha conserva sus condiciones por versión. El estado distingue respaldos faltantes, votación, pausa, rechazo, bloqueo y desembolso. La interfaz presenta quién debe actuar y se apoya en el resultado del dominio. El registro de la demo sigue la autorización y el presupuesto vigentes.
- **Cuenta y ayuda.** La cuenta deriva de la versión desembolsada. El pago confirma la cuota revisada y conserva un comprobante. Abrir ayuda y confirmar una solicitud son acciones separadas. El motivo permanece en la vista de la persona solicitante. Al recargar se recuperan los registros válidos.
- **Persistencia.** El servidor local entrega el frontend y los módulos de dominio. El navegador mantiene el estado de prueba por pestaña. Los datos previos de la demo siguen siendo entradas admitidas. Una prueba con sesiones independientes requiere decidir cómo se identifican y comparten los círculos.

## Entrega y verificación

1. **Comparar plazos.** Primer corte local. Verificar que cambiar la alternativa no modifica la selección, que elegirla sí actualiza el borrador y que ambas opciones muestran su costo y advertencia.
2. **Respaldo y seguimiento.** Implementar el contenido de invitación y la matriz de estados. Verificar rechazos, ausencia de votos, reunión, versión sustituida y aprobación bloqueada por costo.
3. **Cuenta y ayuda.** Conectar la ayuda privada y cubrir pago cancelado, confirmado, repetido y recuperado. Verificar visibilidad con ambos roles y separación entre recorrido normal y guiado.
4. **Validación de producto.** Completar la regresión del MVP y preparar cinco sesiones exploratorias. Registrar por separado la comprensión y los tiempos del círculo. El umbral para modificar el mínimo de respaldos o la unanimidad queda sujeto a esos resultados.

El despliegue de esta fase consiste en una demo local revisable. Antes de un piloto se decide cómo operar el acceso compartido, quién confirma un desembolso real y quién atiende las solicitudes de ayuda. La finalización del software y la validación con participantes son hitos distintos.

[ADR 001 · Cálculo y elección de plazo](adr/001-calculo-y-eleccion-de-plazo.md) · [ADR 002 · Estado y persistencia de la demo](adr/002-estado-y-persistencia-de-la-demo.md) · [ADR 003 · Autorización y movimientos simulados](adr/003-autorizacion-y-movimientos-simulados.md) · [Historias de usuario](../product/hu-entrevecinos-v2.md)
