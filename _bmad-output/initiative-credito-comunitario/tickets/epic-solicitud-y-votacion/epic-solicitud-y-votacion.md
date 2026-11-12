---
type: epic
title: "Solicitud y decisión del círculo"
parent: initiative-credito-comunitario
covers: ["R1", "R2", "R3", "R4", "R5", "R6"]
sources: ["_bmad-output/initiative-credito-comunitario/initiative-credito-comunitario.md"]
companions: []
refined: false
risk: medium
---

# Solicitud y decisión del círculo

## Description

La persona solicita crédito y el grupo toma una decisión verificable sobre una propuesta concreta.

## Outcome

Una persona envía una solicitud con un perfil ficticio y cinco respaldantes distintos reciben un aviso con la ficha.

## Requirements

- R1 (parent R1): Iniciar una solicitud móvil de prueba con perfil ficticio y mostrar monto, finalidad, cuotas y costo total antes de enviarla.
- R2 (parent R2): Reunir al menos cinco respaldantes distintos y mostrar el tope de compromiso de cada uno antes de que acepte.
- R3 (parent R3): Permitir que solo los respaldantes habilitados voten. Cinco de seis votos, una revisión pendiente o un voto en contra bloquean el desembolso. Una versión nueva requiere votos nuevos.
- R4 (parent R4): Notificar a cada respaldante confirmado dentro de la app y mostrarle la ficha con la razón del crédito y las condiciones de la propuesta.
- R5 (parent R5): Permitir que el grupo deje la solicitud pendiente para reunión y que cada integrante registre su voto al retomarla. Mostrar el rechazo a la persona solicitante sin generar desembolso.
- R6 (parent R6): Bloquear una propuesta que exceda el límite del escenario ficticio incluso si todos la aprueban, y mostrar el motivo.

## Constraints

- Mantener los datos y movimientos dentro de la simulación y respetar los permisos del rol.

## Done when

- Una persona envía una solicitud con un perfil ficticio y cinco respaldantes distintos reciben un aviso con la ficha.
- En una red de seis, cinco votos favorables mantienen la propuesta en revisión. La reunión y el rechazo se reflejan en el estado.
- Tras la reunión cada integrante registra su voto. Cambiar el monto reinicia la votación y exceder el límite del escenario impide el desembolso.

## Boundaries

La entrega se prueba como transición simulada. El registro contable se especifica en la épica de bolsa y proyectos.

## References

- [Spec de iniciativa](../../initiative-credito-comunitario.md#requirements).
- [PRD v0.5](../../prd-inclusion-financiera/prd-inclusion-financiera.md).

## Notes

- Open question: El tratamiento de una abstención, el retiro de un integrante y el eventual cierre de una revisión sin unanimidad siguen abiertos.
