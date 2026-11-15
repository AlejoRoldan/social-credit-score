# ADR 001 · Cálculo y elección de plazo

**Estado:** adoptado para el primer corte de la demo.

El comparador presenta dos plazos para el mismo monto. Duplicar el cálculo entre formulario, comparador y ficha podría generar discrepancias de costo y aprobación.

Ambas opciones reutilizan `loanDetails` y `checkCost`. La alternativa vive como selección temporal de interfaz. El plazo elegido pasa por la misma actualización que el selector principal. Revisar o abandonar una alternativa conserva el borrador. Una versión ya enviada conserva sus condiciones, y cualquier cambio formal usa el flujo de revisión.

Se consideró persistir ambas alternativas y crear un motor de ofertas. Se eligió una proyección temporal porque las opciones dependen del mismo catálogo y fórmula. Si una etapa futura introduce cargos, calendarios variables o cotizaciones con vigencia, se revisará el contrato de cálculo antes de ampliar la interfaz.
