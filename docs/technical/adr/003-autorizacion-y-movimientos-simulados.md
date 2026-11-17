# ADR 003 · Autorización y movimientos simulados

**Estado:** adoptado para la demo. La operación de un piloto queda pendiente.

La experiencia necesita explicar la transición entre decisión del círculo, desembolso y pago. Cada evento afecta registros distintos.

Para el crédito individual, el cierre unánime habilita el registro simulado si el costo y el presupuesto lo permiten. El registro revalida la autorización de la versión y aplica un solo movimiento. El pago requiere que la persona revise y confirme la cuota concreta. Un reintento de la misma confirmación conserva el comprobante y el saldo resultante.

Se consideró incorporar una confirmación adicional para el desembolso simulado. En esta fase se conserva el flujo automático verificado. Producto y Arquitectura decidirán la identidad del actor, la confirmación y su trazabilidad antes de cualquier piloto que registre desembolsos reales.
