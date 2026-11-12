# Arquitectura y operación

## Ejecución

`node serve.mjs` inicia el servidor en la interfaz local. El punto de entrada es `/`. [El servidor](../../backend/server.mjs) sirve únicamente el HTML, los estilos y los módulos de la aplicación. Las rutas de entrada `/index.html`, `/styles.css` y `/src/app.mjs` apuntan a sus archivos reorganizados.

[El controlador de frontend](../../frontend/src/app.mjs) lee los formularios, llama a las reglas del dominio, renderiza la vista del perfil activo y guarda la sesión. La lógica del dominio vive en [backend/domain](../../backend/domain), se importa como módulos ES y se ejecuta en el navegador. Los controles de perfil forman parte de la simulación.

| Módulo | Responsabilidad |
| --- | --- |
| `demo-state.mjs` | Borrador, invitaciones, fichas, versiones, rondas, costo ilustrativo y recordatorio privado. |
| `finance-state.mjs` | Consulta de bolsa y presupuestos, validación y registro único del desembolso simulado. |
| `installment-state.mjs` | Cuota impaga, votación sobre la reserva y aportes por perfil. |
| `project-state.mjs` | Propuesta, votación y confirmación del giro colectivo. |
| `score-state.mjs` | Puntajes ficticios, señales agregadas y casos de comparación. |

## Persistencia

`sessionStorage` mantiene el avance de cada pestaña. `credito-comunitario-hu-1-1` guarda el estado del recorrido normal. `credito-comunitario-hu-2-2` guarda el modo activo, el estado de la guía, la navegación de ambos recorridos y el borrador de revisión. Mantener el mismo origen conserva la sesión al recargar. Cambiar el puerto crea otro origen. Para empezar en limpio, abre la dirección en una ventana privada nueva.

## Verificación

- `node --test` ejecuta las 43 pruebas del dominio en [backend/test](../../backend/test).
- `node --test e2e/flows.mjs` ejecuta siete escenarios de navegador. Cubren arranque, recuperación de sesión dañada, teclado, recarga, revisión, privacidad por perfil, votaciones y los flujos de crédito, impago y proyecto.
- En la validación de integración pasaron las 43 pruebas de dominio y los 7 escenarios E2E en Chromium. Se verificaron el desembolso único, el uso de la reserva con unanimidad, la conservación de saldos tras un rechazo y el giro colectivo con confirmación explícita.
- Si Chromium no se detecta, establece `BROWSER_PATH`. El entorno restringido de verificación requirió `BROWSER_NO_SANDBOX=1` para el proceso de Chromium de prueba.
- Los planes de BMAD conservan referencias a la estructura histórica. La interfaz pasó de `src/app.mjs` a `frontend/src/app.mjs`. Los módulos `src/*-state.mjs` se encuentran en `backend/domain/` y las pruebas de `test/` están en `backend/test/`.

[Traspaso del prototipo](traspaso-prototipo.md) · [Contribución](contribucion.md) · [Documentación de producto](../product/README.md)
