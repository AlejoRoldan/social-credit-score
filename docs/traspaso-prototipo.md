# Traspaso del prototipo para Mauricio Roldán

Estado verificado el **11 de noviembre de 2026**. El [README](../README.md) contiene las instrucciones para probar cada historia.

## Producto y decisiones

- **Público inicial.** Personas de Medellín con ingresos variables y sin cuenta bancaria. El foco de largo plazo incluye Mipymes y otros mercados de LATAM. Fundaciones, grupos artísticos y juntas de acción comunal de Manrique, San Javier, Aranjuez y Popular son puntos de partida propuestos para contactar participantes.
- **Crédito con respaldo comunitario.** La persona reúne al menos cinco respaldantes que aceptan un tope individual. El grupo recibe la ficha y decide sobre el monto y las condiciones. Puede votar a favor, en contra o dejar pendiente para reunión. El crédito exige unanimidad del padrón vigente y una comprobación separada del costo ilustrativo.
- **Financiación.** El aporte inicial de inversión de impacto se representa en tres partidas: créditos, plataforma y personal. Los intereses cobrados alimentan la bolsa del círculo. El capital del desembolso sale del presupuesto de créditos.
- **Bolsa y puntajes.** La bolsa separa intereses acumulados, saldo, reserva, compromisos y disponible. Las salidas simuladas requieren unanimidad. El historial individual corresponde a su perfil y el círculo ve señales agregadas. Los puntajes precargados son ficticios y quedan fuera de las decisiones del prototipo.
- **Interfaz.** La revisión de Envato y UX Pilot sirvió para definir una UI móvil de controles claros, etiquetas en español, estados escritos y foco visible. La demo usa HTML, CSS y JavaScript estático, con estado en la sesión de la pestaña. [Referencias y criterios de accesibilidad de la HU 1.1](../_bmad-output/initiative-credito-comunitario/tickets/epic-solicitud-y-votacion/tickets/story-enviar-una-solicitud-y-entregar-la-ficha-al-grupo-plan.md#design-notes)

## Planeación BMAD

1. El [PRD v0.5](../_bmad-output/initiative-credito-comunitario/prd-inclusion-financiera/prd-inclusion-financiera.md) registra las decisiones, hipótesis y recorridos. El [spec de iniciativa](../_bmad-output/initiative-credito-comunitario/initiative-credito-comunitario.md) los traduce a requisitos. [#1](https://github.com/AlejoRoldan/social-credit-score/pull/1)
2. El [árbol de tickets](../_bmad-output/initiative-credito-comunitario/tickets/tickets.toml) organiza nueve historias en tres épicas, con dependencias y comprobaciones. [#2](https://github.com/AlejoRoldan/social-credit-score/pull/2)
3. Cada plan enlazado abajo conserva el alcance, la matriz de aceptación, la verificación y la revisión BMAD cuando aplica. El estado `built` corresponde a una historia implementada y verificada en su rama.

| Historia y plan | Qué cubre | Estado |
| --- | --- | --- |
| [HU 1.1](../_bmad-output/initiative-credito-comunitario/tickets/epic-solicitud-y-votacion/tickets/story-enviar-una-solicitud-y-entregar-la-ficha-al-grupo-plan.md) | Solicitud, mínimo de cinco respaldos y ficha con aviso al grupo | Implementada · [#3](https://github.com/AlejoRoldan/social-credit-score/pull/3) |
| [HU 1.2](../_bmad-output/initiative-credito-comunitario/tickets/epic-solicitud-y-votacion/tickets/story-votar-o-dejar-pendiente-para-reunion-plan.md) | Votos, pausa para reunión, rondas y versiones con padrón propio | Implementada · [#4](https://github.com/AlejoRoldan/social-credit-score/pull/4) |
| [HU 1.3](../_bmad-output/initiative-credito-comunitario/tickets/epic-solicitud-y-votacion/tickets/story-comprobar-costo-y-habilitar-el-desembolso-simulado-plan.md) | Costo ilustrativo y autorización sobre la versión vigente | Implementada · [#5](https://github.com/AlejoRoldan/social-credit-score/pull/5) |
| [HU 2.1](../_bmad-output/initiative-credito-comunitario/tickets/epic-bolsa-y-proyectos/tickets/story-consultar-la-bolsa-y-registrar-un-desembolso-de-credito-plan.md) | Tablero de la bolsa y registro único del desembolso desde créditos | Implementada · [#6](https://github.com/AlejoRoldan/social-credit-score/pull/6) |
| [HU 2.2](../_bmad-output/initiative-credito-comunitario/tickets/epic-bolsa-y-proyectos/tickets/story-repartir-el-faltante-de-una-cuota-plan.md) | Cuota impaga, aportes, reserva y recorrido guiado | Implementada · [#7](https://github.com/AlejoRoldan/social-credit-score/pull/7) |
| [HU 2.3](../_bmad-output/initiative-credito-comunitario/tickets/epic-bolsa-y-proyectos/tickets/story-proponer-y-girar-fondos-para-un-proyecto-colectivo-plan.md) | Propuesta del taller, unanimidad y confirmación del giro | Implementada · [#8](https://github.com/AlejoRoldan/social-credit-score/pull/8) |
| [HU 3.1](../_bmad-output/initiative-credito-comunitario/tickets/epic-puntajes-y-seguimiento/tickets/story-consultar-el-puntaje-individual-y-el-del-circulo-plan.md) | Historial propio y señales agregadas del círculo | Implementada · [#9](https://github.com/AlejoRoldan/social-credit-score/pull/9) |
| [HU 3.2](../_bmad-output/initiative-credito-comunitario/tickets/epic-puntajes-y-seguimiento/tickets/story-explicar-diferencias-y-falta-de-historial-plan.md) | Comparador anónimo y explicación de historial insuficiente | Implementada · comparador y señales explicadas |
| [HU 3.3](../_bmad-output/initiative-credito-comunitario/tickets/epic-puntajes-y-seguimiento/tickets/tickets.toml) | Recordatorio privado de cuota y siguiente paso | En backlog |

## Demo y evidencia

Desde la raíz del repositorio, en una copia que incluya las historias hasta la HU 3.2:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Abre [la demo local](http://127.0.0.1:8000/). Para validar las reglas, ejecuta `node --test` en otra terminal.

1. **Crédito.** Pulsa **Iniciar demo**, emite el quinto voto como Luz y vuelve a Diana. El desembolso simulado de **$300.000 COP** reduce créditos de **$1.000.000 a $700.000**.
2. **Impago.** Pulsa **Simular la siguiente cuota**. Este ejemplo usa su propia cuota de **$100.000 COP**. Diana ya pagó **$40.000**. Con unanimidad se aplican **$25.000** de la reserva. Cuatro aportes de **$7.000** pagados y uno fallido dejan **$7.000** pendientes. Recarga para comprobar que el estado se conserva. La variante con bolsa vacía deja **$10.000** pendientes tras cinco aportes de **$10.000**.
3. **Proyecto.** En **Bolsa del círculo → Abrir proyecto colectivo**, prueba primero una propuesta de **$65.000** para ver el exceso de **$5.000**. Envía **$50.000**, registra cinco votos y confirma. El disponible baja de **$60.000 a $10.000**, la reserva sigue en **$40.000** y la recarga conserva un giro.
4. **Puntajes.** En **Mi puntaje**, Ana ve **82/100** y su historial. Diana ve **Historial insuficiente**. En la bolsa, el puntaje ficticio del círculo es **78/100**. Comprueba que el disponible refleja el giro y que un perfil pendiente carece de acceso al tablero.

**Verificación al cierre de la HU 3.2.** 40 pruebas automatizadas. Chromium a 320 px con teclado y tacto para los recorridos de puntaje, proyecto e impago. La primera historia también se verificó con texto al 200 %. Los planes y PRs enlazados conservan las comprobaciones de cada entrega.

## Revisión y pendientes

- Los PRs [#1](https://github.com/AlejoRoldan/social-credit-score/pull/1) a [#9](https://github.com/AlejoRoldan/social-credit-score/pull/9) estaban abiertos al verificar este documento. Son una cadena de dependencias que empieza en `main`. Para revisar los cambios incrementales, empezar por el PR #1 y avanzar en orden. El PR [#3](https://github.com/AlejoRoldan/social-credit-score/pull/3) tiene a **@iatechdev** como revisor solicitado.
- **HU 3.2.** Verificar en revisión el comparador de casos ficticios anónimos de **82/100 y 58/100** y la distinción entre falta de datos e incumplimiento observado.
- **HU 3.3.** Preparar el plan del recordatorio de cuota, visible para la persona solicitante.
- **Antes de un piloto.** Resolver las preguntas del PRD sobre abstención y retiro, custodia y financiación, reserva y topes, uso de la finalidad en el puntaje y comunidad inicial. Las tasas, aportes y giros actuales pertenecen a la simulación.
