# ADR 002 · Estado y persistencia de la demo

**Estado:** adoptado para la demo.

El objetivo inmediato es probar comprensión y decisiones con datos ficticios. Los recorridos actuales ejecutan el dominio en el navegador y guardan el avance por pestaña.

Se conserva el servidor estático local y la persistencia de sesión. El recorrido guiado mantiene su propio estado. Los controles de perfil permiten representar a cada rol en el mismo navegador. La interfaz limpia la información privada al salir de su vista y el dominio condiciona la lectura al perfil activo del escenario.

Se consideró un servicio compartido con identidad y persistencia entre dispositivos. Su adopción se decidirá cuando el protocolo requiera interacciones independientes. El selector de perfiles representa roles ficticios y las comprobaciones del navegador operan dentro del modelo de simulación.
