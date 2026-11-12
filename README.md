# Entrevecinos

MVP de demostración de crédito comunitario para Medellín. Permite recorrer una solicitud, reunir respaldos, votar, simular un desembolso y explorar cuotas, bolsa del círculo, proyectos colectivos y puntajes de ejemplo.

## Arranque local

Desde esta carpeta, con Node.js 22 o posterior:

```sh
node serve.mjs
```

Abre [Entrevecinos](http://127.0.0.1:8000/). **Mi solicitud** abre el recorrido completo. **Iniciar demo** sitúa el recorrido guiado en el último voto. Para elegir otro puerto, ejecuta `node serve.mjs 8001` y abre la dirección impresa en la terminal.

## Estructura

| Carpeta | Contenido |
| --- | --- |
| [frontend/](frontend/) | Pantallas HTML, estilos de la interfaz y controlador de navegación y sesión. |
| [backend/](backend/) | Servidor HTTP local, reglas del dominio del simulador y pruebas de reglas. |
| [design-system/](design-system/README.md) | Tokens CSS y correspondencia de componentes con Figma. |
| [docs/technical/](docs/technical/README.md) | Arquitectura, persistencia, verificación, traspaso y contribución. |
| [docs/product/](docs/product/README.md) | Alcance, guía de la demo, benchmark e implicaciones para Entrevecinos. |
| [e2e/](e2e/) | Escenarios de navegador y soporte de pruebas con Chromium. |
| [_bmad-output/](_bmad-output/) | PRD, iniciativa, épicas y planes de historias en el árbol de BMAD. |

El servidor entrega los archivos de la demo. Las reglas del simulador se ejecutan en el navegador con datos ficticios y guardan el avance en la sesión de la pestaña. Los cambios de perfil representan roles de prueba. El MVP local no incluye autenticación, una base de datos, una API de crédito ni movimientos de dinero.

## Pruebas

```sh
node --test
node --test e2e/flows.mjs
```

La suite E2E arranca su propio servidor y usa Chrome, Edge o Chromium. Define `BROWSER_PATH` si el navegador está instalado fuera de las rutas habituales. La [guía de la demo](docs/product/guia-demo.md) contiene los recorridos manuales por historia.

El prototipo incluye los ajustes de las revisiones hasta el PR #11 y el recordatorio privado de la HU 3.3. Consulta los escenarios verificados y los pendientes de producto en la documentación técnica. [Verificación](docs/technical/README.md#verificación) · [Traspaso](docs/technical/traspaso-prototipo.md)

## Pull requests

Cuando un PR depende de otro abierto, apunta a la rama de su predecesor. Para la pila #1–#12, empieza la revisión por #1 y sigue el orden de dependencias. [Guía de revisión e integración](docs/technical/contribucion.md)
