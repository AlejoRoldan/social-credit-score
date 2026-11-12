# Sistema de diseño de Entrevecinos

[Fundamentos en Figma](https://www.figma.com/design/5wzbHpQlHpJNVSchoAQR05/Untitled?node-id=2-2) · [Componentes en Figma](https://www.figma.com/design/5wzbHpQlHpJNVSchoAQR05/Untitled?node-id=2-3)

[Tokens CSS](tokens.css) concentra paleta, fuente, escala de espacios, radios y altura de controles. [Estilos de interfaz](../frontend/styles.css) aplica esos tokens sobre las pantallas y componentes de la demo. Inter se usa si está disponible en el dispositivo y el navegador usa la fuente del sistema como alternativa. La demo funciona sin descargar fuentes.

| Elemento | Implementación |
| --- | --- |
| Acciones | Botones nativos principales y secundarios, selección con `aria-pressed`, foco visible y estado deshabilitado. |
| Campos | Selectores y entradas con etiquetas, borde de control y ayuda o mensaje de error visible. |
| Avisos | `.callout` para información, `.callout-attention` para atención y fondo rosa con texto de error en formularios. |
| Cifras | `.facts` para desgloses y `.total` para destacar importes y resultados. |
| Opciones | Controles nativos de selección en `.choice`, con estado seleccionado visible. |

La UI usa cuerpo de 16 px, etiquetas de 14 px, títulos de 28 px y controles principales de al menos 56 px con el tamaño de texto predeterminado. Los estados se expresan también por texto o semántica del control. La verificación en Chromium incluye teclado, foco visible y texto al 200 % en una ficha a 320 px.

Los componentes de Figma para atención humana y las pantallas propuestas se consultan como referencia para futuras iteraciones. La demo implementada tiene un recordatorio privado con pasos simulados.
