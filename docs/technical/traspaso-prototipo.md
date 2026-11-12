# Traspaso del prototipo para Mauricio Roldán

La guía de la demo contiene las instrucciones para probar cada historia. [Guía de la demo](../product/guia-demo.md)

## Producto y decisiones

- **Público inicial.** Personas de Medellín con ingresos variables y sin cuenta bancaria. El foco de largo plazo incluye Mipymes y otros mercados de LATAM. Fundaciones, grupos artísticos y juntas de acción comunal de Manrique, San Javier, Aranjuez y Popular son puntos de partida propuestos para contactar participantes.
- **Crédito con respaldo comunitario.** La persona reúne al menos cinco respaldantes que aceptan un tope individual. El grupo recibe la ficha y decide sobre el monto y las condiciones. Puede votar a favor, en contra o dejar pendiente para reunión. El crédito exige unanimidad del padrón vigente y una comprobación separada del costo ilustrativo.
- **Financiación.** El aporte inicial de inversión de impacto se representa en tres partidas: créditos, plataforma y personal. Los intereses cobrados alimentan la bolsa del círculo. El capital del desembolso sale del presupuesto de créditos.
- **Bolsa y puntajes.** La bolsa separa intereses acumulados, saldo, reserva, compromisos y disponible. Las salidas simuladas requieren unanimidad. El historial individual corresponde a su perfil y el círculo ve señales agregadas. Los puntajes precargados son ficticios y quedan fuera de las decisiones del prototipo.
- **Interfaz.** La revisión de Envato y UX Pilot sirvió para definir una UI móvil de controles claros, etiquetas en español, estados escritos y foco visible. La demo usa HTML, CSS y JavaScript estático, con estado en la sesión de la pestaña. [Referencias y criterios de accesibilidad de la HU 1.1](../../_bmad-output/initiative-credito-comunitario/tickets/epic-solicitud-y-votacion/tickets/story-enviar-una-solicitud-y-entregar-la-ficha-al-grupo-plan.md#design-notes)

## Planeación BMAD

1. El [PRD v0.5](../../_bmad-output/initiative-credito-comunitario/prd-inclusion-financiera/prd-inclusion-financiera.md) registra las decisiones, hipótesis y recorridos. El [spec de iniciativa](../../_bmad-output/initiative-credito-comunitario/initiative-credito-comunitario.md) los traduce a requisitos. [#1](https://github.com/AlejoRoldan/social-credit-score/pull/1)
2. El [árbol de tickets](../../_bmad-output/initiative-credito-comunitario/tickets/tickets.toml) organiza nueve historias en tres épicas, con dependencias y comprobaciones. [#2](https://github.com/AlejoRoldan/social-credit-score/pull/2)
3. Cada plan enlazado abajo conserva el alcance, la matriz de aceptación, la verificación y la revisión BMAD cuando aplica. El estado `built` corresponde a una historia implementada y verificada en su rama.

| Historia y plan | Qué cubre | Estado |
| --- | --- | --- |
| [HU 1.1](../../_bmad-output/initiative-credito-comunitario/tickets/epic-solicitud-y-votacion/tickets/story-enviar-una-solicitud-y-entregar-la-ficha-al-grupo-plan.md) | Solicitud, mínimo de cinco respaldos y ficha con aviso al grupo | Implementada · [#3](https://github.com/AlejoRoldan/social-credit-score/pull/3) |
| [HU 1.2](../../_bmad-output/initiative-credito-comunitario/tickets/epic-solicitud-y-votacion/tickets/story-votar-o-dejar-pendiente-para-reunion-plan.md) | Votos, pausa para reunión, rondas y versiones con padrón propio | Implementada · [#4](https://github.com/AlejoRoldan/social-credit-score/pull/4) |
| [HU 1.3](../../_bmad-output/initiative-credito-comunitario/tickets/epic-solicitud-y-votacion/tickets/story-comprobar-costo-y-habilitar-el-desembolso-simulado-plan.md) | Costo ilustrativo y autorización sobre la versión vigente | Implementada · [#5](https://github.com/AlejoRoldan/social-credit-score/pull/5) |
| [HU 2.1](../../_bmad-output/initiative-credito-comunitario/tickets/epic-bolsa-y-proyectos/tickets/story-consultar-la-bolsa-y-registrar-un-desembolso-de-credito-plan.md) | Tablero de la bolsa y registro único del desembolso desde créditos | Implementada · [#6](https://github.com/AlejoRoldan/social-credit-score/pull/6) |
| [HU 2.2](../../_bmad-output/initiative-credito-comunitario/tickets/epic-bolsa-y-proyectos/tickets/story-repartir-el-faltante-de-una-cuota-plan.md) | Cuota impaga, aportes, reserva y recorrido guiado | Implementada · [#7](https://github.com/AlejoRoldan/social-credit-score/pull/7) |
| [HU 2.3](../../_bmad-output/initiative-credito-comunitario/tickets/epic-bolsa-y-proyectos/tickets/story-proponer-y-girar-fondos-para-un-proyecto-colectivo-plan.md) | Propuesta del taller, unanimidad y confirmación del giro | Implementada · [#8](https://github.com/AlejoRoldan/social-credit-score/pull/8) |
| [HU 3.1](../../_bmad-output/initiative-credito-comunitario/tickets/epic-puntajes-y-seguimiento/tickets/story-consultar-el-puntaje-individual-y-el-del-circulo-plan.md) | Historial propio y señales agregadas del círculo | Implementada · [#9](https://github.com/AlejoRoldan/social-credit-score/pull/9) |
| [HU 3.2](../../_bmad-output/initiative-credito-comunitario/tickets/epic-puntajes-y-seguimiento/tickets/story-explicar-diferencias-y-falta-de-historial-plan.md) | Comparador anónimo y explicación de historial insuficiente | Implementada · [#11](https://github.com/AlejoRoldan/social-credit-score/pull/11) |
| [HU 3.3](../../_bmad-output/initiative-credito-comunitario/tickets/epic-puntajes-y-seguimiento/tickets/story-recibir-un-recordatorio-privado-de-cuota-plan.md) | Recordatorio privado de cuota y siguiente paso | Implementada |

## Demo y evidencia

Desde la raíz del repositorio, en una copia que incluya las historias hasta la HU 3.3:

```sh
node serve.mjs
```

Abre [la demo local](http://127.0.0.1:8000/). Ejecuta `node --test` para validar las reglas y `node --test e2e/flows.mjs` para recorrer la demo en Chromium.

1. **Crédito.** Pulsa **Iniciar demo**, emite el quinto voto como Luz y vuelve a Diana. El desembolso simulado de **$300.000 COP** reduce créditos de **$1.000.000 a $700.000**.
2. **Impago.** Pulsa **Simular la siguiente cuota**. Este ejemplo usa su propia cuota de **$100.000 COP**. Diana ya pagó **$40.000**. Con unanimidad se aplican **$25.000** de la reserva. Cuatro aportes de **$7.000** pagados y uno fallido dejan **$7.000** pendientes. Recarga para comprobar que el estado se conserva. La variante con bolsa vacía deja **$10.000** pendientes tras cinco aportes de **$10.000**.
3. **Proyecto.** En **Bolsa del círculo → Abrir proyecto colectivo**, prueba primero una propuesta de **$65.000** para ver el exceso de **$5.000**. Envía **$50.000**, registra cinco votos y confirma. El disponible baja de **$60.000 a $10.000**, la reserva sigue en **$40.000** y la recarga conserva un giro.
4. **Puntajes.** En **Mi puntaje**, Ana ve **82/100** y su historial. Diana ve **Historial insuficiente**. En la bolsa, el puntaje ficticio del círculo es **78/100**. Comprueba que el disponible refleja el giro y que un perfil pendiente carece de acceso al tablero.

5. **Recordatorio.** Tras el desembolso, Diana abre **Próxima cuota**, consulta los **$66.000 COP** semanales del ejemplo guiado y elige un siguiente paso. Cambia a un respaldante para comprobar que su elección es privada.

Los planes y PRs enlazados conservan las comprobaciones de cada entrega. Los comandos y el alcance de las pruebas están en la [guía técnica](README.md#verificación).

## Revisión y pendientes

### Seguimiento a la revisión del 12 de noviembre de 2026

| Hallazgos | Ajuste |
| --- | --- |
| H1 y H2 | La [guía de contribución](contribucion.md#revisar-e-integrar-prs-apilados) documenta el orden de revisión y cómo integrar la pila con *merge commits* o con *squash* y rebase. La estrategia de integración queda por acordar antes del primer merge. |
| H3 | La demo y Figma usan Entrevecinos. La revisión usa Bancuadra. El nombre definitivo queda por confirmar. |
| H4 a H6 | La HU 2.3 reutiliza la regla de unanimidad de la HU 2.2. Las HUs 3.1 y 3.3 dependen directamente de la HU 2.1. BMAD declara el enlace entre épicas y usa las referencias entre historias para determinar cuándo pueden avanzar. |
| H7 | El arranque valida la estructura guardada y recupera la demo si el estado de la solicitud es inválido. La prueba E2E reproduce el caso con `{}` y comprueba que una guía inválida no elimina el avance válido del recorrido normal. |
| H8 | La interfaz obtiene el nombre del perfil y los avisos lo toman de la ficha guardada. |
| H9 | Mauricio comprobó el recorrido a 320 px en Edge en el commit `663d82e`. Su revisión dejó fuera el contraste, el texto ampliado y el tacto emulado. La suite actual comprueba teclado y texto al 200 % en la ficha a 320 px. |

[Revisión técnica de los PR #1, #2 y #3](https://claude.ai/artifact/BfGWYwie1DATcyekAsG4T1)

### Seguimiento a la revisión del PR #4

- **H10.** En la demo, cualquier integrante habilitado del padrón puede pausar la votación y cualquier integrante habilitado puede retomarla. Queda por confirmar si el producto exige un acuerdo y, en ese caso, cuántas personas hacen falta para cada acción.
- **H11.** La bandeja entrega una copia independiente de cada solicitud. La prueba de regresión modifica una ficha vigente y una histórica y comprueba que el estado y las lecturas posteriores conservan los datos originales.
- **H7 y H8.** Los hallazgos heredados del PR #3 ya están corregidos en la copia local. La revisión del PR #4 se hizo sobre el commit `d1d0db3`.

[Revisión técnica del PR #4](https://claude.ai/artifact/3B9eiRhNwqMyqPWmygqWQ6)

### Seguimiento a la revisión del PR #5

- **H12.** La revisión y la edición advierten antes de enviar si la tasa semanal supera el límite de ejemplo. La advertencia explica que el desembolso queda bloqueado aunque el grupo apruebe.
- **H13.** La decisión compara enteros en pesos y semanas. La división se usa para mostrar la tasa. Las pruebas cubren el límite exacto y un peso de interés por encima.
- **H14.** La revisión, la edición y la ficha aclaran que la tasa es un ejemplo y que la simulación no constituye una oferta de crédito. Las condiciones de un piloto siguen pendientes de validación.
- **H7, H8 y H11.** Ya corregidos en la copia local. **H10** sigue pendiente de decisión de producto.

[Revisión técnica del PR #5](https://claude.ai/artifact/ByDLzuaQuQN9HhoCcuv3Xb)

### Seguimiento a la revisión del PR #6

- **H15.** Tras registrar un voto favorable, la interfaz obtiene la autorización de la versión vigente y la pasa al registro. El módulo financiero vuelve a comprobar que coincidan la identidad, la versión y el principal antes de crear el movimiento.
- **H16.** La demo registra automáticamente el desembolso simulado al alcanzar la unanimidad si se cumplen el límite de costo y el presupuesto. Al recuperar una sesión previa, completa un desembolso autorizado si falta el movimiento. Para el piloto queda por acordar quién confirma explícitamente el desembolso y cómo queda registrada esa confirmación.
- **Hallazgos heredados.** H7, H8, H11, H12, H13 y H14 están atendidos en la copia local. H10 sigue pendiente de decisión de producto.

[Revisión técnica del PR #6](https://claude.ai/artifact/9odwLZkkn2GV63qiZo9iLC)

### Seguimiento a la revisión del PR #7

- **H17.** El PRD explica por qué el primer voto en contra cierra la votación de la reserva, mientras la solicitud de crédito espera todas las respuestas antes de registrar el rechazo. Es el comportamiento vigente de la demo.
- **H18.** Queda por definir antes del piloto qué alternativa se ofrece tras un rechazo de la reserva y cómo se gestiona el saldo pendiente cuando falla un aporte. El PRD registra esas decisiones en OQ-1 y OQ-3.

[Revisión técnica del PR #7](https://claude.ai/artifact/TGH3NdaYwcot2WTxpAQQo3)

### Seguimiento a la revisión del PR #8

- **H19.** El importe de una propuesta nueva empieza vacío. La app valida el importe al escribirlo y exige un valor válido al enviar.
- **H20.** Tras la unanimidad, la demo permite que una persona habilitada confirme el giro. Para el piloto queda por decidir quién puede confirmarlo, cuántas confirmaciones se requieren y si se guarda la identidad de quien confirma.
- **H17.** El PRD documenta que el primer voto en contra cierra tanto la votación de la reserva como la del proyecto. En el crédito se recogen todos los votos antes de registrar el rechazo.

[Revisión técnica del PR #8](https://claude.ai/artifact/W8UBg2sNyPx4BZEcwpdZZt)

### Seguimiento a la revisión del PR #9

- **H21.** La vista individual explica que «Historial insuficiente» representa un perfil con datos incompletos. La bolsa identifica sus cifras como un ejemplo independiente de los puntajes individuales.
- **H22.** Los puntajes individuales de ejemplo se consultan en una tabla por identificador de perfil. Ana conserva su caso precargado.

[Revisión técnica del PR #9](https://claude.ai/artifact/3Xgzy6LKYhhW9aeWP1TMdy)

### Seguimiento a la revisión de los PR #10 y #11

- **H2 y H23.** El flujo de PRs apilados está documentado en la guía de contribución. El traspaso remite a la guía técnica para los comandos y el alcance de las pruebas.
- **H24.** El comparador distingue el monto solicitado para todo el préstamo del total de cuotas con vencimiento y los pagos registrados durante las diez semanas observadas.
- **H25.** Antes de probar con participantes, queda por definir cómo explicar la diferencia entre 82 y 58 y qué peso y evidencia corresponden a cada señal. El PRD mantiene esta decisión en OQ-4.
- **H21.** La vista individual ya explica el caso de datos incompletos y la bolsa identifica sus cifras como un ejemplo independiente.

[Revisión técnica de los PR #10 y #11](https://claude.ai/artifact/BKHUMxKCZ4NaYuhrWEbEYp)

### Pendientes de validación

- **HU 3.3.** Verificar el recordatorio privado de Diana, la elección tras recargar y el reinicio independiente de la demo guiada.
- **Antes de un piloto.** Resolver las preguntas del PRD sobre abstención y retiro, custodia y financiación, reserva y topes, uso de la finalidad en el puntaje y comunidad inicial. Las tasas, aportes y giros actuales pertenecen a la simulación.
