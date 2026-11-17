---
title: "Entrevecinos V2 · PRD"
template: prd
status: draft
created: "2026-11-15"
updated: "2026-11-15"
---

# Entrevecinos V2

## Propósito y visión

Preparar una demo móvil para comprobar si una persona con ingresos variables puede entender el costo de un préstamo pequeño, reunir su círculo dentro del tiempo que necesita y gestionar su primera cuota. Quien recibe una invitación debe poder entender el compromiso y decidir libremente. Este PRD es el borrador de alcance para Producto, UX/UI, Ingeniería y QA.

La revisión toma como base el MVP local con el simulador actualizado y «Mi crédito». El flujo ya cubre solicitud, respaldos, votación, desembolso, calendario, pago, comprobante y ayuda simulados. Se verificaron 52 pruebas, incluidas 8 E2E. La lógica de dominio corre en el navegador y el avance se guarda por sesión. La revisión UX confirmó que el título de seguimiento queda desactualizado después del desembolso y que «Necesito conversar» no abre el formulario de ayuda. La documentación revisada contiene un protocolo exploratorio pendiente de ejecución. [Iniciativa vigente](../initiative-credito-comunitario.md) · [Guía de la demo](../../../docs/product/guia-demo.md) · [Protocolo exploratorio](../../../docs/product/research/implicaciones-benchmark.md)

## Usuarios y recorridos

Los tres perfiles son arquetipos de trabajo. Sus nombres identifican escenarios ficticios. La frecuencia de ingresos, los tiempos disponibles y la disposición a compartir información se validarán en las sesiones.

| Arquetipo | Situación y objetivo | Conductas y barreras a investigar | Experiencia satisfactoria |
| --- | --- | --- | --- |
| **Diana · Solicitante principal** | Adulta en Medellín que vende desayunos y necesita reponer inventario antes de su siguiente jornada de ventas. Sus ingresos varían y usa el celular para consultar y decidir. La demo le permite explorar el flujo sin vincular una cuenta bancaria. | Calcula lo que puede separar en una semana floja. Le preocupa revelar al círculo la finalidad y pedir apoyo cuando tiene prisa. Puede interrumpir el recorrido para atender su negocio. | Compara plazos por cuota y total, sabe qué comparte, encuentra quién debe actuar y puede retomar el trámite. |
| **Luz · Respaldante** | Persona adulta que conoce a Diana y recibe una invitación. Quiere ayudar sin comprometer dinero que necesita para sus propios gastos. | Revisa la invitación en el celular. Puede confundir el tope individual con la deuda de Diana o interpretar que aceptar equivale a aprobar el préstamo. Puede necesitar tiempo o preferir declinar. | Explica el aporte máximo y cuándo podría exigirse. Puede rechazar la invitación o aceptar y reconocer que la votación viene después. |
| **Camila · Solicitante de contraste** | Adulta con ingresos variables que necesita cubrir un gasto doméstico imprevisto. Su red de apoyo puede ser distinta de la que usa para trabajar. | Quiere saber la fecha de pago antes de comprometerse. Puede tener menos tiempo disponible o preferir compartir menos información sobre el gasto. | Completa el mismo recorrido y puede explicar si el tiempo de respuesta del círculo habría sido útil para su necesidad. |

- **UJ-21 · Elegir y solicitar.** Diana entra desde el celular, compara dos plazos con el mismo monto, identifica cuánto recibe y qué pagaría, revisa qué conocerá el círculo y envía cuando reúne cinco respaldos. Si falta una respuesta, entiende qué sigue. FR-21, FR-22, FR-23.
- **UJ-22 · Respaldar y decidir.** Luz abre su invitación, lee el tope y su alcance, decide si acepta y recibe una confirmación. Si acepta, abre después la ficha de la versión vigente y emite su voto como acción separada. FR-22, FR-23.
- **UJ-23 · Pagar o pedir ayuda.** Tras el desembolso, Diana identifica su próxima cuota. Puede revisar un pago, cancelarlo o confirmarlo y recuperar el comprobante. Desde el recordatorio puede abrir ayuda privada y decidir si registra su solicitud. FR-23, FR-24, FR-25.
- **UJ-24 · Contrastar el gasto personal.** Camila prueba el recorrido de simulación y respaldo con una finalidad personal. Se registra si el tiempo de espera y la información compartida cambian su decisión. FR-21, FR-22, FR-26.

## Glosario y reglas

- **Respaldo.** Aceptación individual de un compromiso de ejemplo con un tope. El **voto** expresa una decisión sobre una versión concreta de la solicitud.
- **Círculo.** Grupo de respaldantes. El **padrón** identifica quién puede votar en una versión concreta.
- **Cuota.** Importe con un vencimiento. El **saldo pendiente** es la suma de lo aún programado por pagar en el crédito de ejemplo. La **bolsa** y el **presupuesto de créditos** son fondos distintos.
- **RULE-21.** La solicitud conserva el mínimo de cinco respaldantes distintos. El padrón vigente decide por unanimidad. Una versión nueva requiere votos nuevos.
- **RULE-22.** El desembolso simulado exige aprobación, costo dentro del límite de ejemplo y presupuesto disponible. Cada autorización genera como máximo un movimiento.
- **RULE-23.** El calendario usa las condiciones de la versión desembolsada. La suma de las cuotas coincide con el total en COP y una cuota solo admite un pago de ejemplo.
- **RULE-24.** Las sesiones, perfiles, importes, comunicaciones y movimientos de V2 usan datos ficticios. El detalle de crédito, comprobantes y motivo de ayuda corresponde a la persona solicitante.

## Requisitos de producto y alcance

La revisión de referentes añade tres criterios para la demo. El simulador permite comparar plazos de un mismo monto antes de compartir la solicitud. El resumen distingue el importe recibido, el costo y el total. El seguimiento separa reunir respaldos, decidir y registrar el desembolso, e indica quién debe actuar en cada etapa. Los montos, las tasas y los tiempos comerciales del benchmark quedan como contexto de investigación. La V2 conserva las condiciones ficticias y mide cuánto tarda cada círculo antes de plantear un tiempo de respuesta. [Benchmark de Solventa, Finmercado, RapiCredit y Sempli](../../../docs/product/research/benchmark-fintech-v2.md)

| ID | Prioridad | Requisito verificable |
| --- | --- | --- |
| FR-21 | P0 | La persona solicitante cambia monto, plazo y finalidad, compara dos plazos para un mismo monto y ve cuánto recibe, cuánto paga por semana, el costo desglosado, el total y el primer vencimiento antes de enviar. |
| FR-22 | P0 | La persona invitada ve su aporte máximo, cuándo podría corresponderle y qué ocurre al aceptar o rechazar. La persona solicitante conoce cuántos respaldos faltan. |
| FR-23 | P0 | Cada rol distingue respaldo, voto, decisión y desembolso. Cada estado muestra un siguiente paso y quién debe actuar. |
| FR-24 | P0 | Tras el desembolso, la persona solicitante consulta su calendario y saldo, revisa o cancela un pago y recupera el comprobante después de confirmar. |
| FR-25 | P0 | Desde el recordatorio, la persona abre Ayuda privada, elige un motivo y confirma la solicitud simulada. Puede volver a ver su estado. |
| FR-26 | P0 | La persona facilitadora ejecuta escenarios reproducibles y registra tiempos y resultados del ejercicio de respaldo por separado de las tareas de comprensión. |

La entrega se concentra en el crédito individual y la primera cuota. La bolsa, el impago, los puntajes y los proyectos colectivos siguen disponibles como recorridos secundarios y forman parte de la regresión. La ampliación a constitución y representación de empresas, dinero real, verificación de identidad, evaluación crediticia, mensajería externa e integraciones bancarias corresponde a una decisión posterior de piloto. El escenario de negocio representa a su dueña como persona solicitante.

## Nivel 1 · Backend y reglas de dominio

En este nivel se especifica el comportamiento que valida el dominio. Para V2 se propone reutilizar los módulos actuales y la persistencia por sesión. La arquitectura de una prueba multiusuario o de un piloto requiere una decisión propia.

| ID | Requisito | Aceptación |
| --- | --- | --- |
| BE-01 | Calcular y conservar las condiciones de cada versión. FR-21, FR-24. | Las dos opciones se calculan con la misma regla y devuelven neto recibido, interés, cargos aplicables si los hay, cuota, total y vencimiento. Comparar opciones conserva el borrador hasta que la persona elija. Una ficha enviada conserva sus importes y el calendario suma exactamente el total aprobado. |
| BE-02 | Validar transiciones por perfil, padrón y versión. FR-22, FR-23. | Aceptar no registra un voto. Una persona ajena o una versión sustituida no puede votar. Se distinguen pendiente, reunión, rechazo y aprobación. |
| BE-03 | Mantener separado el resultado del voto del registro del desembolso. FR-23. | Una aprobación que excede el límite o el presupuesto queda bloqueada con un motivo. Repetir el registro autorizado o recargar conserva un solo movimiento. |
| BE-04 | Validar el pago contra la cuota revisada y conservar comprobante, saldo y calendario. FR-24. | Cancelar conserva el saldo. Repetir la confirmación de la misma cuota no aplica otro pago ni avanza a la siguiente. |
| BE-05 | Guardar la ayuda privada por solicitud y recuperar el estado del perfil autorizado. FR-25. | Abrir el formulario no crea una solicitud. Confirmar registra una solicitud de ejemplo. Un respaldante no recibe el detalle en su vista. |
| BE-06 | Recuperar el avance válido y separar los escenarios guiados del recorrido normal. FR-26. | Recargar conserva el paso y las acciones confirmadas. Reiniciar la guía conserva la solicitud normal. Si el estado es inválido, se ofrece una salida recuperable. |

## Nivel 2 · Frontend

| ID | Requisito | Aceptación |
| --- | --- | --- |
| FE-01 | Actualizar el simulador con cada cambio de monto o plazo. FR-21. | En móvil se leen las cifras en orden y en escritorio se puede consultar el resumen junto al formulario. El aviso de costo aparece antes del envío cuando aplica. |
| FE-02 | Presentar invitación y ficha de voto como pantallas con acciones distintas. FR-22, FR-23. | Se confirma aceptar o rechazar la invitación. Cuando la ficha está disponible, el respaldante puede abrirla y confirmar que su voto quedó registrado. |
| FE-03 | Usar el estado real de la solicitud para elegir título y acción principal. FR-23. | Distingue respaldos faltantes, decisión del círculo y desembolso. En cada etapa muestra qué falta y quién debe actuar. En reunión o bloqueo explica el motivo. Tras desembolsar, destaca **Ver mi crédito**. El caso de impago se identifica como ejercicio de demo. |
| FE-04 | Conectar recordatorio, ayuda y cuenta del crédito. FR-24, FR-25. | **Necesito conversar** abre y enfoca Ayuda privada. **Simular pago** abre una revisión con importe y fecha. Confirmar actualiza saldo, próxima cuota y comprobante. |
| FE-05 | Resolver errores y preservar el contexto. FR-21 a FR-26. | La interfaz muestra un siguiente paso tras error de validación, sesión recuperada o acceso a una vista que corresponde a otro rol. La navegación funciona con teclado y mantiene el contexto tras recargar. |

## Nivel 3 · UX/UI

| ID | Requisito | Aceptación |
| --- | --- | --- |
| UX-01 | Dar prioridad a **Recibes**, **Pagas por semana**, **Total a pagar** y **Primer vencimiento**. FR-21. | Las cuatro cifras aparecen antes de invitar al círculo. La comparación muestra las mismas etiquetas en ambas opciones y permite ver el detalle de los costos. Los intereses y el límite ficticio se explican en lenguaje directo. |
| UX-02 | Mostrar en un bloque el aporte máximo, el supuesto de impago y el siguiente paso. FR-22. | La confirmación de respaldo indica cuándo se podrá votar. Rechazar se presenta como una opción clara y accesible. |
| UX-03 | Mostrar una acción principal por estado, con estados legibles sin depender del color. FR-23, FR-24, FR-25. | Prototipo con estados de respaldo pendiente, reunión, rechazo, costo bloqueado, desembolso, siguiente cuota, pago confirmado y ayuda registrada. |
| UX-04 | Extender el sistema visual existente para pantallas móviles y escritorio. FR-21 a FR-25. | A 320 px el flujo principal evita desplazamiento horizontal. Al ampliar el texto al 200 % se puede completar cada acción. Teclado, foco visible, etiquetas y anuncios de estado se verifican en los recorridos nuevos. |

## Medición y salida

[Guion de facilitación y fichas de registro de V2](../../../docs/product/research/protocolo-exploratorio-v2.md)

Cinco sesiones exploratorias de comprensión, con tareas sin instrucciones sobre dónde tocar. Para cada tarea, registrar rol, éxito sin ayuda, explicación textual, error y punto de abandono. En un ejercicio aparte, usar círculos de personas que ya se conocen. Registrar la ventana que declaró la persona antes de empezar, la primera invitación, el quinto respaldo, el cierre de votación y los motivos de demora o rechazo. El escenario guiado con votos precargados sirve para evaluar pantallas y el ejercicio de círculos mide los tiempos.

| Métrica | Meta o decisión |
| --- | --- |
| SM-21 · Comprensión del costo | Al menos 4 de 5 participantes explican las cuatro cifras sin ayuda. Registrar confusión entre cuota, costo y saldo. |
| SM-22 · Comprensión del respaldo | Al menos 4 de 5 explican tope, condición y diferencia entre aceptar y votar. Registrar incomodidad o presión percibida, incluso si aceptan. |
| SM-23 · Encontrar ayuda | Al menos 4 de 5 llegan desde el recordatorio y explican qué se guardó y quién lo ve. Registrar si creen que se contactó a una persona real. |
| SM-24 · Viabilidad del círculo | Comparar tiempo y abandono en respaldo y votación con la ventana de cada caso. Hasta recoger una línea base, el umbral para cambiar la regla queda abierto. |

La demo queda lista para sesiones cuando se verifican los requisitos P0 y pasan las pruebas del flujo normal y guiado, incluidas recuperación, privacidad, bloqueo, reintento y recarga. La decisión sobre el modelo se toma después de las sesiones. Si el grupo tarda más de lo que la persona puede esperar, Producto reabre la regla del círculo. Si las demoras se explican por confusión, UX/UI corrige los puntos observados y vuelve a probar.

## Decisiones abiertas

| ID | Decisión | Responsable propuesto y momento |
| --- | --- | --- |
| OQ-21 | Comunidad inicial, reclutamiento y ventana de referencia para el ejercicio de respaldo. | Producto e Investigación, antes de las sesiones. |
| OQ-22 | Plazo de espera y tratamiento de abstención, retiro o falta de respuesta. | Producto, después de medir el círculo y antes de cambiar la regla. |
| OQ-23 | Quién atiende la ayuda, qué compromiso asume y qué información puede consultar. | Producto y Operaciones, antes de un piloto con atención real. |
| OQ-24 | Si el piloto necesita confirmación explícita del desembolso, quién la realiza y cómo se registra. | Producto y Arquitectura, antes de diseñar el piloto. |
| OQ-25 | Si la prueba de círculos requiere sesiones independientes y persistencia compartida, y cómo se operaría. | Investigación y Arquitectura, antes de cerrar el protocolo. La demo actual permite observar el ejercicio con facilitación y registro manual. |

Los arquetipos, el orden de prioridades y las metas de comprensión son propuestas para revisión. Sofia puede convertir los requisitos P0 en historias por recorrido y usar los identificadores de cada nivel para sus criterios de aceptación.
