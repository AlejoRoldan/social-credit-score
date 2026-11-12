---
title: "Crédito con respaldo comunitario en Medellín"
version: "0.5"
status: draft
created: "2026-11-10"
updated: "2026-11-10"
---

# PRD v0.5 · Crédito con respaldo comunitario en Medellín

## Visión y primera prueba

Explorar una alternativa de crédito a los préstamos informales conocidos como pagadiario o gota a gota. La visión incluye a personas naturales y mipymes de bajos ingresos en Colombia y, a futuro, en Latinoamérica. La primera versión será una **demo navegable en celular con datos ficticios**, dirigida a personas adultas con ingresos variables y sin cuenta bancaria en Medellín.

**Comunidades propuestas para la prueba.** Fundaciones barriales, grupos artísticos y juntas de acción comunal de Manrique, San Javier, Aranjuez y Popular. Las organizaciones servirían como puente para conversar con posibles participantes. Cada círculo se formaría con personas que decidan respaldarse. La pertenencia a una organización o barrio queda fuera del puntaje.

**Inspiración.** El microcrédito grupal de Muhammad Yunus sirve de referencia. La propuesta para Medellín incorpora una bolsa propia por círculo, compromisos de aporte y aprobación unánime del monto. [Grameen Bank](https://www.grameenbank.org.bd/about/introduction) · [Guía de Grameen Foundation](https://grameenfoundation.org/documents/GrameenGuidelines.pdf).

## Modelo del producto

### Círculo y aprobación del monto

Una persona reúne al menos cinco respaldantes distintos. Cada respaldo se acepta individualmente e indica cuánto se compromete a cubrir en caso de impago. Aceptar formar parte del círculo y aprobar una operación concreta son acciones separadas. La app presenta importe, destino y condiciones antes del voto.

**Regla confirmada para el crédito individual.** Votan únicamente los integrantes del grupo de respaldo. La persona solicitante puede consultar el estado de su solicitud. La app habilita el desembolso simulado cuando todos los respaldantes confirmados aprueban el mismo monto y las mismas condiciones. La aprobación del grupo y la validación del costo son condiciones separadas. Para las salidas de la bolsa, la demo conserva como hipótesis la aprobación unánime de los integrantes habilitados.

**Notificación y ficha técnica.** Al enviar la solicitud al círculo, cada respaldante confirmado recibe una notificación dentro de la app con acceso a la ficha. Para la demo, la ficha incluye el perfil ficticio de la persona solicitante, un resumen de su historial o un aviso de que falta información, la razón del crédito, el monto, el plazo, la cuota, el costo total y el tope de compromiso de quien consulta. El resumen queda dentro de la ficha, visible para el grupo que decide.

**Decisión del grupo.** El grupo puede **aprobar**, **dejar pendiente para reunión** o **rechazar**. La opción de dejar pendiente registra que el grupo quiere deliberar y mantiene bloqueado el desembolso. Después de reunirse, cada integrante registra su voto en la app sobre la misma versión de la solicitud. La app comprueba la unanimidad con esos votos individuales. Este flujo está confirmado para la demo.

| Situación | Comportamiento de la demo |
| --- | --- |
| Cuatro de cinco votos favorables, o cinco de seis, sin solicitud de reunión | La propuesta queda «En revisión». El saldo y los desembolsos permanecen en el estado previo. |
| El grupo deja pendiente para reunión | La persona solicitante ve «Pendiente de reunión». Al reanudar, el grupo puede registrar su decisión sobre esa versión. |
| El grupo registra el rechazo | La persona solicitante ve «Rechazada» y la propuesta no genera desembolso. Durante la revisión, cualquier voto en contra impide alcanzar la unanimidad. |
| Cambia el monto, el destino, las condiciones o quién debe votar | La nueva versión solicita aprobación de todas las personas habilitadas. Los votos anteriores quedan en el historial de su versión. |
| Todas las personas habilitadas aprueban | La app comprueba las condiciones y el saldo cuando la operación usa la bolsa. Si se cumplen, la demo registra una sola entrega simulada para ese monto y versión. |

### Cuenta digital de la bolsa y compromisos de respaldo

Cada círculo tiene una bolsa propia, representada en la app como una **cuenta digital simulada**. El registro separa el capital devuelto de los intereses efectivamente cobrados. Los intereses que ingresan a la bolsa pueden respaldar cuotas impagas o financiar un proyecto colectivo. El capital inicial para prestar proviene del presupuesto de créditos del aporte de impacto social y se registra por separado.

El tablero del círculo muestra **intereses cobrados acumulados**, saldo actual de la bolsa, reserva para cuotas, montos ya comprometidos y monto disponible para proyectos. Para la demo, el disponible es el saldo menos la reserva y los compromisos vigentes, sin contar dos veces la misma partida. El puntaje del círculo se muestra junto al saldo. La disponibilidad del dinero se calcula a partir de los movimientos y compromisos de la bolsa.

**Supuesto de simulación.** Ante una cuota impaga, se solicita autorización para aplicar primero la reserva disponible. Los respaldantes cubren el remanente según la regla de reparto y los topes aceptados. El ejemplo usa reparto igual y mantiene visible cualquier diferencia pendiente si falla un aporte. Si falta la aprobación de la bolsa, el importe permanece pendiente y la pantalla distingue ese estado de un giro realizado. La prioridad, el plazo para votar y la alternativa ante un bloqueo quedan abiertos. El seguimiento entre pares se prueba con un recordatorio privado y una conversación sobre el siguiente paso de pago.

**Cierre de la votación en la demo.** El primer voto en contra cierra la votación sobre el uso de la reserva o sobre una propuesta de proyecto colectivo, porque esa ronda ya no puede alcanzar la unanimidad. La bolsa conserva su saldo. Si el rechazo afecta a la reserva, el importe de la cuota sigue pendiente. En la solicitud de crédito, la ronda sigue abierta hasta que todas las personas habilitadas voten para registrar el resultado completo del grupo. Las tres operaciones requieren unanimidad para aprobarse.

### Puntaje individual y puntaje del círculo

| Indicador | Señales que se probarán | Qué puede ver la persona |
| --- | --- | --- |
| Puntaje individual | Historial y cumplimiento de compromisos propios, monto solicitado frente a los pagos del caso ficticio, y finalidad declarada del préstamo. | Su estado financiero en la demo, qué datos contribuyen al puntaje y qué información falta. |
| Puntaje del círculo | Cumplimiento previo de los respaldantes, montos que se comprometieron a cubrir, tiempo que llevan vinculados entre sí y señales agregadas del historial individual. | Salud financiera agregada y desglose de señales, junto con los intereses cobrados y el monto disponible para proyectos. |

El destino del préstamo se presenta con categorías claras, como educación, salud, actividad productiva, celebración u otro. En la demo el grupo ve la categoría y puede considerarla al revisar el monto. La prueba explora si el destino debería afectar el puntaje, la prioridad, el importe o solo la revisión del círculo. La categoría de salud puede mostrarse con datos ficticios y sin diagnósticos. La vista del grupo agrega el historial de sus miembros y cada persona ve su propio detalle. Se usan casos precargados, con una variante que muestra «Historial insuficiente». Los pesos, umbrales y el efecto del puntaje en decisiones reales quedan por definir.

### Aporte inicial, costo del crédito y sostenibilidad

**Financiación inicial definida.** Un grupo de inversión de impacto social aporta un monto global para iniciar la operación. El presupuesto distingue tres destinos: desarrollo y operación de la plataforma, capital para otorgar créditos y personal del proyecto. En la demo los importes son ficticios y el préstamo individual se desembolsa desde el presupuesto de créditos. Las proporciones, el monto inicial y las condiciones del aporte quedan por acordar.

La hipótesis comercial es cobrar una tasa cercana y por debajo del límite legal aplicable para generar recursos suficientes. En Colombia, el límite depende de la modalidad y de la vigencia. Para una operación real se debe confirmar la modalidad, la fecha aplicable, la tasa efectiva anual y qué cargos cuentan como intereses. La demo muestra tasa ilustrativa, cuotas, intereses y costo total en COP antes de aceptar. Incluye un escenario ficticio en el que una propuesta que supera el límite configurado queda bloqueada, aunque toda la red vote a favor. [Certificaciones de interés bancario corriente de la Superfinanciera](https://www.superfinanciera.gov.co/publicaciones/10829/sala-de-prensacomunicados-de-prensa-interes-bancario-corriente-10829/) · [Superfinanciera sobre cargos que se reputan intereses](https://www.superfinanciera.gov.co/publicaciones/19130/normativaconceptos-y-jurisprudencia-conceptoshistorico-doctrina-y-conceptos-anteriores-superintendencias-bancaria-y-de-valores-doctrina-y-conceptos-indice-generalinteres-moratorio-y-remuneratorio-19130/).

La demo conserva el escenario en el que los intereses cobrados entran íntegros a la bolsa. El aporte de impacto social cubre el arranque. Queda por definir cómo se financiarán la plataforma y el personal después de ese aporte, y si el capital recuperado volverá a financiar nuevos créditos. La prueba debe observar si el costo y la frecuencia de las cuotas resultan manejables con ingresos variables y cómo se comparan con la alternativa que usan hoy las personas entrevistadas.

## Recorridos de la demo

1. **UJ-1 · Solicitud individual.** Diana pide un préstamo de ejemplo para educación y reúne cinco respaldantes. El grupo recibe una notificación y abre su ficha. En el recorrido principal dejan la solicitud pendiente para reunirse. Luego, los cinco aprueban el monto original en la app y se registra un desembolso simulado con cargo al presupuesto de créditos. Diana ve el resultado. Dos variantes muestran el rechazo del grupo y un cambio de monto que reinicia la votación.
2. **UJ-2 · Cuota impaga.** De una cuota de $100.000 COP, Diana cubre $40.000. Con aprobación unánime se aplican $25.000 de la reserva. Los $35.000 restantes se asignan en cinco aportes de $7.000, dentro del tope ficticio de $10.000 por persona. Si uno falla, quedan $7.000 pendientes. La demo incluye una bolsa vacía y un voto pendiente.
3. **UJ-3 · Proyecto colectivo.** Un grupo artístico considera destinar $50.000 COP a materiales para un taller. El círculo ha cobrado $150.000 de intereses y tiene un saldo actual de $120.000 después de usos anteriores. De ese saldo hay $40.000 reservados para cuotas y $20.000 comprometidos para otras operaciones. El disponible para proyectos es $60.000. Si se aprueba y registra el giro simulado de $50.000, quedan $10.000 disponibles. Este caso usa un escenario independiente del impago de Diana.

## Requisitos verificables

| ID | Capacidad | Criterio de aceptación |
| --- | --- | --- |
| FR-1 | Iniciar una solicitud de ejemplo desde el celular. | La persona selecciona monto y finalidad con un perfil ficticio sin vincular una cuenta. Puede consultar tasa ilustrativa, cuotas y costo total antes de avanzar. |
| FR-2 | Invitar perfiles y registrar compromisos individuales. | Se requieren al menos cinco respaldantes distintos. Cada uno ve su tope antes de aceptar o rechazar. La persona solicitante queda fuera del conteo. |
| FR-3 | Votar por un monto y unas condiciones. | Solo votan los respaldantes habilitados. Cinco de seis votos no autorizan un giro en una red de seis. Cambiar el monto obliga a votar de nuevo. |
| FR-4 | Consultar la bolsa del círculo. | El tablero separa intereses cobrados, saldo, reserva, compromisos y disponible. UJ-3 muestra $60.000 antes del giro y $10.000 después. Repetir la confirmación conserva un solo movimiento por propuesta aprobada. |
| FR-5 | Entender quién cubre una cuota impaga. | El desglose muestra pago propio, uso autorizado de la bolsa, parte individual y saldo pendiente. Sin unanimidad el saldo de la bolsa permanece intacto. Con el escenario autorizado de UJ-2, un aporte fallido deja $7.000 pendientes. |
| FR-6 | Entender los dos puntajes. | La demo permite comparar dos casos y consultar las señales que explican cada resultado. Un perfil nuevo muestra «Historial insuficiente» cuando corresponda y distingue este estado de un incumplimiento. |
| FR-7 | Proponer un proyecto colectivo. | La app comprueba monto disponible y unanimidad antes del giro. Si el proyecto supera el saldo libre, la demo muestra la diferencia y conserva el saldo. |
| FR-8 | Revisar el costo frente al límite del escenario. | Una propuesta que supera el límite de prueba queda bloqueada incluso con unanimidad. El motivo se explica en pantalla sin ofrecer una tasa real. |
| FR-9 | Consultar un recordatorio privado de pago. | La persona solicitante puede ver el vencimiento y elegir un siguiente paso. Los respaldantes ven la información necesaria sobre su propio compromiso. |
| FR-10 | Recibir una notificación y abrir la ficha de la solicitud. | Cada respaldante confirmado recibe un aviso en la app al enviarse la propuesta y puede abrir la ficha con el resumen de la persona, la razón del crédito y las condiciones sobre las que vota. |
| FR-11 | Dejar pendiente una solicitud para reunirse y registrar el resultado. | La persona solicitante ve «Pendiente de reunión» y el desembolso permanece bloqueado. Al retomar la ficha, cada integrante registra su voto sobre la misma versión. Un rechazo queda visible para la persona solicitante sin crear un desembolso. |
| FR-12 | Distinguir el origen del capital y los recursos del círculo. | El presupuesto ficticio distingue plataforma, créditos y personal. Un desembolso individual aprobado reduce el capital disponible para créditos. El saldo de la bolsa del círculo permanece intacto. |

## Validación y decisiones abiertas

Probar con cinco participantes como punto de partida exploratorio. Presentar los tres recorridos desde los roles de solicitante y respaldante. Buscar que al menos cuatro puedan abrir la ficha desde el aviso, explicar qué significa dejar pendiente para reunión y decir qué falta para autorizar un giro. Comprobar si entienden por qué cambian los puntajes y cuánto dinero queda disponible para un proyecto. Preguntar cómo resolvieron su última necesidad de crédito, qué cuota podrían sostener en una semana de ingresos bajos y qué datos estarían dispuestos a compartir. Registrar si alguien confunde intereses cobrados con saldo disponible o interpreta un puntaje como aprobación de crédito.

| ID | Decisión | Efecto |
| --- | --- | --- |
| OQ-1 | ¿La unanimidad también aplica a cada salida de la bolsa? ¿Qué hace el grupo si alguien se abstiene o se retira? | Define las reglas para las salidas de la bolsa y qué hacer con una propuesta bloqueada. |
| OQ-2 | ¿Cómo se distribuye el aporte entre plataforma, créditos y personal? ¿Quién administra y custodia cada fondo y cómo se financia la operación después del aporte inicial? | Define el presupuesto, los roles y qué acuerdos serían necesarios para un piloto. |
| OQ-3 | ¿Qué parte de la bolsa se reserva para impagos? ¿Qué límite acepta cada respaldante y cómo se gestiona un faltante que continúa pendiente? | Define cuánto puede comprometerse a proyectos y cómo se distribuye una pérdida. |
| OQ-4 | ¿El destino cambia el puntaje, el monto, la prioridad o la información para el voto? ¿Qué pesos y evidencias se usarán para las demás señales? | Define el comportamiento de los dos puntajes y la explicación a la persona solicitante. |
| OQ-5 | ¿Con cuál fundación, grupo artístico o junta de acción comunal se puede iniciar el reclutamiento? | Define el primer lugar y escenario de prueba en Medellín. |

El prototipo simula el registro de saldos y movimientos. Antes de operar con dinero o datos reales será necesario definir el prestamista, la titularidad y custodia de los fondos, el papel de un eventual proveedor habilitado, la formalización de los compromisos y la revisión aplicable en protección de datos y cobranza. [Superfinanciera sobre modelos de ahorro y pagos digitales](https://www.superfinanciera.gov.co/preguntas-frecuentes/34/34-innovacion-sfc/) · [SIC sobre datos personales en el sector fintech](https://sedeelectronica.sic.gov.co/noticias/la-superintendencia-de-industria-y-comercio-emite-instrucciones-sobre-el-tratamiento-de-datos-personales-en-el-sector-fintech) · [Ley 2300 de 2023](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=213990).

Estructura adaptada de la [plantilla PRD de BMAD](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/skills/bmad-agent-pm/assets/template-prd.md).
