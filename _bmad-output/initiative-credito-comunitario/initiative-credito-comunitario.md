---
type: initiative
title: "Crédito con respaldo comunitario en Medellín"
sources: ["_bmad-output/initiative-credito-comunitario/prd-inclusion-financiera/prd-inclusion-financiera.md"]
companions: []
risk: high
---

# Crédito con respaldo comunitario en Medellín

## Description

Probar con perfiles ficticios cómo una persona con ingresos variables y sin cuenta bancaria solicita crédito, cómo decide su círculo de respaldo y cómo se muestran los fondos y los puntajes. Los posibles espacios de prueba incluyen fundaciones barriales, grupos artísticos y juntas de acción comunal de Manrique, San Javier, Aranjuez y Popular.

## Outcome

Las personas participantes pueden explicar quién decide un desembolso, de dónde sale el dinero y qué puede usar el grupo para un proyecto colectivo.

## Requirements

- R1 (FR-1): Iniciar una solicitud móvil de prueba con perfil ficticio y mostrar monto, finalidad, cuotas y costo total antes de enviarla.
- R2 (FR-2): Reunir al menos cinco respaldantes distintos y mostrar el tope de compromiso de cada uno antes de que acepte.
- R3 (FR-3, FR-11): Permitir que solo los respaldantes habilitados voten. Cinco de seis votos, una revisión pendiente o un voto en contra bloquean el desembolso. Una versión nueva requiere votos nuevos.
- R4 (FR-10): Notificar a cada respaldante confirmado dentro de la app y mostrarle la ficha con la razón del crédito y las condiciones de la propuesta.
- R5 (FR-11): Permitir que el grupo deje la solicitud pendiente para reunión y que cada integrante registre su voto al retomarla. Mostrar el rechazo a la persona solicitante sin generar desembolso.
- R6 (FR-8): Bloquear una propuesta que exceda el límite del escenario ficticio incluso si todos la aprueban, y mostrar el motivo.
- R7 (FR-4): Mostrar por separado intereses cobrados, saldo, reserva, compromisos y monto disponible en la bolsa del círculo.
- R8 (FR-5): Desglosar una cuota impaga por pago propio, aporte autorizado de la bolsa, aportes individuales y monto pendiente. En el caso de prueba un aporte fallido deja $7.000 pendientes.
- R9 (FR-7): Simular el giro de un proyecto colectivo con saldo disponible y aprobación del círculo. Repetir la confirmación registra un solo movimiento y un importe superior al saldo libre queda bloqueado.
- R10 (FR-12): Distinguir el presupuesto de plataforma, créditos y personal. El desembolso del crédito reduce el presupuesto de créditos y conserva el saldo de la bolsa.
- R11 (FR-6): Mostrar un puntaje individual y otro del círculo, explicar las señales de ambos y distinguir el historial insuficiente del incumplimiento.
- R12 (FR-9): Mostrar un recordatorio privado y un siguiente paso a la persona solicitante. Cada respaldante consulta la información necesaria sobre su compromiso.

## Constraints

- Usar perfiles, notificaciones, votos, presupuestos y movimientos ficticios. (PRD, Visión y primera prueba)
- Limitar la ficha al grupo que decide, los recordatorios al canal privado de la demo y el detalle del compromiso a cada respaldante. (PRD, Círculo y aprobación del monto y FR-9)
- Mantener separados el voto, el puntaje y la comprobación del costo. Mostrar el historial individual detallado solo a la persona y las señales del círculo de forma agregada. (PRD, Puntaje individual y puntaje del círculo y FR-8)

## Done when

- La demo recorre solicitud individual, cuota impaga y proyecto colectivo desde los roles de solicitante y respaldante.
- En una prueba exploratoria con cinco participantes, al menos cuatro abren la ficha desde el aviso, explican la espera para reunión e identifican qué falta para autorizar el giro.
- Se registra si las personas distinguen los puntajes del saldo disponible y si comprenden cuánto puede destinarse a un proyecto.

## Boundaries

El alcance cubre la demo de Medellín. El piloto con dinero real, la custodia de fondos, el modelo definitivo de tasas y puntajes y la ampliación a mipymes o a otros países quedan fuera de este trabajo.

## References

- PRD · [Decisiones, recorridos y requisitos](prd-inclusion-financiera/prd-inclusion-financiera.md).
- [Índice de épicas propuestas](tickets/tickets.toml).

## Notes

- Assumption: Para la demo, aplicar primero la reserva ante una cuota impaga y exigir unanimidad para las salidas de la bolsa.
- Open question: Resolver la abstención, el retiro y las salidas de la bolsa antes de definir el flujo de un piloto. (OQ-1)
- Open question: Definir la distribución del aporte inicial, la custodia y la financiación posterior. (OQ-2)
- Open question: Definir reserva, topes y tratamiento del faltante, el uso de la finalidad en el puntaje y el primer grupo de prueba. (OQ-3 a OQ-5)
