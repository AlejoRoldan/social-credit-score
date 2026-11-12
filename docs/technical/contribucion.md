# Contribución

Abrir los PRs de este proyecto en [AlejoRoldan/social-credit-score](https://github.com/AlejoRoldan/social-credit-score/pulls) desde una rama de trabajo. Usar `main` como base cuando las dependencias estén integradas. Si una historia depende de un PR abierto, usar la rama de ese PR como base y explicar la dependencia. En cada PR, indicar qué requisitos aborda y cómo se verificaron. Si cambia una decisión de producto, actualizar el PRD y el spec correspondiente.

## Revisar e integrar PRs apilados

Para la pila #1–#12, revisar primero la documentación base (#1), después las historias BMAD (#2) y continuar por orden de dependencia desde la HU 1.1 (#3). Verificar la rama base de cada PR y revisar su diff contra esa base.

Antes de integrar #1, acordar la estrategia con el equipo. Con *merge commits*, integrar en orden y comprobar que el diff del siguiente PR contiene únicamente sus cambios al cambiar su base a `main`. Si se elige *squash*, rebasar cada rama dependiente sobre `main` después de integrar su predecesora, usando la base anterior de la rama para trasladar solo sus propios commits. Verificar el diff y volver a ejecutar las pruebas antes de integrar el siguiente PR.
