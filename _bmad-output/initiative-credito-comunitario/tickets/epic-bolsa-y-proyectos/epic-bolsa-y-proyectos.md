---
type: epic
title: "Bolsa, impagos y proyectos colectivos"
parent: initiative-credito-comunitario
covers: ["R7", "R8", "R9", "R10"]
sources: ["_bmad-output/initiative-credito-comunitario/initiative-credito-comunitario.md"]
companions: []
refined: false
risk: medium
---

# Bolsa, impagos y proyectos colectivos

## Description

El círculo consulta sus recursos, explica cómo se cubre un faltante y puede proponer un proyecto con un monto verificable.

## Outcome

Un desembolso de crédito reduce el presupuesto de créditos y mantiene el saldo de la bolsa.

## Requirements

- R1 (parent R7): Mostrar por separado intereses cobrados, saldo, reserva, compromisos y monto disponible en la bolsa del círculo.
- R2 (parent R8): Desglosar una cuota impaga por pago propio, aporte autorizado de la bolsa, aportes individuales y monto pendiente. En el caso de prueba un aporte fallido deja $7.000 pendientes.
- R3 (parent R9): Simular el giro de un proyecto colectivo con saldo disponible y aprobación del círculo. Repetir la confirmación registra un solo movimiento y un importe superior al saldo libre queda bloqueado.
- R4 (parent R10): Distinguir el presupuesto de plataforma, créditos y personal. El desembolso del crédito reduce el presupuesto de créditos y conserva el saldo de la bolsa.

## Constraints

- Mantener los datos y movimientos dentro de la simulación y respetar los permisos del rol.

## Done when

- Un desembolso de crédito reduce el presupuesto de créditos y mantiene el saldo de la bolsa.
- El escenario de impago muestra quién aporta y qué queda pendiente, incluso con un aporte fallido.
- En el caso de proyecto, el disponible baja de $60.000 a $10.000 con un giro simulado de $50.000 registrado una sola vez.

## Boundaries

Los casos usan movimientos ficticios y presupuestos separados. La custodia, el prestamista y la distribución real del aporte corresponden a un futuro piloto.

## References

- [Spec de iniciativa](../../initiative-credito-comunitario.md#requirements).
- [PRD v0.5](../../prd-inclusion-financiera/prd-inclusion-financiera.md).

## Notes

- Open question: La aprobación unánime de las salidas de la bolsa y el uso de la reserva antes de los aportes individuales son supuestos de la demo.
