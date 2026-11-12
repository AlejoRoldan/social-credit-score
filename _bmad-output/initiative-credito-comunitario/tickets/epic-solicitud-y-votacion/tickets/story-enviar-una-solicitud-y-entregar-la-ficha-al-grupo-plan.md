---
title: "HU 1.1 · Enviar una solicitud y entregar la ficha al grupo"
type: feature
ticket: 1
created: "2026-11-10"
status: built
baseline_revision: "0198421933d6e5178dcc795042d53afc0ac56f32"
route: full
route_source: auto
risk: medium
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problema.** La repo tiene el PRD y las historias. Para probar la HU 1.1 falta un recorrido navegable en el que una persona prepare una solicitud y su círculo reciba la ficha.

**Enfoque.** Crear una demo móvil en español colombiano con pasos cortos para personas con poca experiencia digital. La persona solicitante prepara el préstamo de ejemplo, reúne al menos cinco respaldantes distintos y revisa lo que enviará al grupo. El control «Cambiar perfil de prueba» permite ensayar el respaldo y la bandeja.

## Boundaries & Constraints

**Siempre.** Usar datos y montos ficticios en COP. Mostrar el costo total antes del envío y el tope individual antes de aceptar el respaldo. Entregar la ficha solo a las personas confirmadas al enviar, con el resumen del historial o su ausencia y el compromiso del perfil que consulta.

**Fuera de alcance.** Votación, aprobación, cálculo regulatorio de tasas, desembolsos, puntajes, cuentas bancarias, mensajes externos y datos personales reales.

## I/O & Edge-Case Matrix

| Escenario | Estado inicial | Resultado verificable |
| --- | --- | --- |
| Círculo incompleto | Cuatro perfiles confirmados y una invitación pendiente | El envío queda bloqueado. Una invitación pendiente o declinada aporta cero al conteo. |
| Confirmación | Un perfil invitado abre su vista | Ve el importe máximo de su compromiso y puede aceptar o declinar. Se excluyen perfiles duplicados y el de la persona solicitante. |
| Envío | Cinco o más perfiles distintos confirmados | Cada confirmado recibe una notificación con acceso a la ficha de la misma solicitud. Una repetición del envío conserva un aviso por perfil. |
| Acceso | Un perfil pendiente, declinado o ajeno abre su bandeja | Ve su propio estado y carece de acceso a la ficha. |

</frozen-after-approval>

## Code Map

- `tickets.toml` en esta carpeta contiene la HU 1.1 y remite a R1, R2 y R4 de [la épica](../epic-solicitud-y-votacion.md).
- `README.md` describe el proyecto y sus PRs. La rama base solo contiene documentación. No hay código, pruebas ni una plataforma existente que reutilizar.

## Tasks & Acceptance

**Ejecución**

- [x] `src/demo-state.mjs` — Definir perfiles y condiciones ficticias, aplicar las reglas del círculo y conservar la solicitud enviada y sus destinatarios durante la sesión de la demo.
- [x] `index.html`, `styles.css`, `src/app.mjs` — Construir el flujo por pasos y las vistas de respaldo y bandeja con formularios HTML nativos, texto claro, foco visible y estados anunciados.
- [x] `test/demo-state.test.mjs` — Verificar umbral, identidad única, rechazo, destinatarios y reintentos con el runner de Node.
- [x] `README.md` — Documentar cómo servir la demo y recorrer la prueba manual de la HU 1.1.

**Criterios de aceptación**

- Dada una solicitud ficticia, al avanzar a «Revisa y envía», se ven monto, razón, plazo, frecuencia de pago, cuota, intereses ilustrativos y total en COP. Al volver para corregir se conservan las respuestas anteriores.
- Dado un aviso en la bandeja de un respaldante confirmado, al abrirlo se ve el perfil resumido, el historial disponible o su ausencia, la razón, el monto, el plazo, la cuota, el total y el tope propio.
- Dado un respaldo pendiente, al abrir la invitación se explica en pesos cuánto podría aportar y en qué caso, antes de mostrar «Aceptar respaldo» y «No aceptar».
- Dada una pantalla de 320 px de ancho, al recorrer ambos roles con teclado o tacto se ve el foco, los estados se distinguen por texto y el contenido se lee sin desplazamiento horizontal. Los controles principales tienen objetivos táctiles de al menos 44 × 44 px CSS y el texto normal un contraste mínimo de 4,5:1.

## Implementation Notes

- El navegador conserva la solicitud y sus destinatarios en la sesión de la pestaña. El modelo usa perfiles ficticios y pruebas sin dependencias de terceros.
- Se verificó en Chromium el recorrido con teclado a 320 px y con tacto emulado y texto al 200 %. Se ajustó el selector para conservar el foco y evitar recortes. El contraste mínimo observado fue 6,18:1.
- Después de la revisión, se repitieron las siete pruebas de Node y ambos recorridos de Chromium. Pasaron. Los plazos ficticios son 4, 5 y 8 semanas. La prueba de accesibilidad usó emulación y teclado.

## Plan Change Log

## Review Triage Log

### Revisión rápida · 2026-11-10

Hallazgos: 0 altos, 2 medios, 0 bajos, 0 falsos y 0 sin verificar.

| Hallazgo | Veredicto | Ruta | Evidencia y ajuste |
| --- | --- | --- | --- |
| Cuotas redondeadas con el plazo de seis semanas | medium | patch | Para $200.000 COP, seis cuotas visibles de $36.667 sumaban $220.002 frente al total de $220.000. El plazo ficticio pasó de seis a cinco semanas y las nueve combinaciones se comprueban con una prueba. |
| Mensaje de aporte para invitaciones pendientes después de enviar | medium | patch | El aviso del compromiso quedaba visible aunque la invitación ya no se podía aceptar. El aporte se muestra solo para respaldos confirmados e invitaciones que todavía pueden responderse. |

## Design Notes

**Recorrido.** «Cuéntanos qué necesitas» → «Reúne tu grupo» → «Revisa y envía». Una tarea principal por pantalla. La sesión arranca con cuatro respaldos ficticios. Mostrar «4 de 5 personas confirmaron. Te falta 1» junto a la acción para resolverlo. Tras el envío, mostrar «Solicitud enviada al grupo» y explicar que el grupo la revisará. [Estructura de formularios](https://www.gov.uk/service-manual/design/form-structure) · [Revisión antes de enviar](https://design-system.service.gov.uk/patterns/check-answers/).

**Frontend.** App estática con HTML semántico, CSS adaptable y JavaScript para el estado. Usar tipografía del sistema, botones con texto y tarjetas sencillas para agrupar cifras. Mantener el selector de perfiles separado de las acciones del préstamo y etiquetado como parte de la demo. Los kits de Envato y UX Pilot sirven como referencias de composición. [Kit móvil de préstamos de Envato](https://elements.envato.com/loans-mobile-app-ui-kit-6SLNK3S) · [Financo de UX Pilot](https://uxpilot.ai/template/fintech).

**Lenguaje.** Usar «Cuánto pagarías en total» y «Si Diana no puede pagar, tu aporte sería de hasta $10.000 COP» como ejemplos de la demo. Al probar con usuarios, pedirles que expliquen en sus palabras el costo total, qué implica respaldar y qué ocurre después de enviar. [Guía de lenguaje claro del DNP](https://colaboracion.dnp.gov.co/CDT/Gobierno_DDHH_Paz/Gob_Asuntos_Internacionales/Innovacion/Guia_Lenguaje_Claro_2025.pdf) · [Accesibilidad cognitiva del W3C](https://www.w3.org/WAI/WCAG2/supplemental/objectives/o3-clear-content/).

## Verification

- `node --test` — Pasan los escenarios de reglas del círculo, envío y acceso.
- `python -m http.server 8000 --bind 127.0.0.1` — Recorrer ambas vistas a 320 px y con texto ampliado al 200 %. Comprobar el camino de cuatro a cinco respaldos, la revisión editable, el foco y contraste, el aviso y el acceso a la ficha.
