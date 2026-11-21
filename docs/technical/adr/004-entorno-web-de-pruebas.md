# ADR 004 · Entorno web de pruebas para Entrevecinos

## Decisión

Publicar la copia integrada de QA como un servicio Node.js 24 en Render, región Virginia. La primera versión conserva el servidor HTTP existente y la interfaz HTML, CSS y JavaScript. Fastify y Supabase Auth quedan previstos para la API y el ingreso de la HU 5.2. PostgreSQL se aloja en un proyecto Supabase exclusivo de pruebas, también en Virginia. La elección de región aplica a datos sintéticos. La región y las condiciones de tratamiento para el piloto con participantes se revisan antes de la HU 5.5.

El entorno usa una URL HTTPS de Render y un plan gratuito de cómputo para las pruebas. El servicio puede tardar en despertarse después de un periodo de inactividad. La demo mantiene sus escenarios y avance en el navegador. PostgreSQL contiene una muestra sintética de verificación para comprobar la conexión, el aislamiento y el restablecimiento operativo antes de añadir persistencia de usuarios y círculos.

## Configuración y comprobación

1. En el **proyecto Supabase de pruebas**, ejecutar [setup.sql](../../../backend/staging/setup.sql) y [reset.sql](../../../backend/staging/reset.sql). Asignar una contraseña propia del entorno al rol `entrevecinos_staging_reader` en PostgreSQL. El rol de la aplicación solo tiene permiso explícito de lectura sobre la muestra. El equipo de operación ejecuta el restablecimiento con su cuenta de administración del proyecto de pruebas.
2. En Render, conectar el repositorio y seleccionar la rama de pruebas como origen del [Blueprint](../../../render.yaml). Configurar `STAGING_DATABASE_URL` como secreto en Render con la conexión del rol de lectura. Usar la conexión directa si está disponible o el pooler en modo sesión con el usuario `entrevecinos_staging_reader.<referencia-del-proyecto>` y `sslmode=verify-full`. Si la conexión requiere la CA que proporciona Supabase, cargar el certificado como archivo en Render y añadir `sslrootcert=/etc/secrets/supabase-ca.crt` a la cadena. Conservar la contraseña y la cadena completa en el gestor de secretos. [Conexión a Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres)
3. Esperar que las pruebas de GitHub Actions pasen sobre la revisión que se desplegará. Verificar la página raíz por HTTPS desde dos teléfonos. Consultar `/version` y comprobar que `revision` coincide con el commit y que `environment` indica `staging`. Consultar `/healthz` y esperar un `200`. El servicio responde `503` si no puede verificar la muestra con su rol de lectura.
4. Para repetir el caso de pruebas, ejecutar [reset.sql](../../../backend/staging/reset.sql) en el proyecto sintético y comprobar que `/healthz` vuelve a responder `200`. Usar una sesión nueva del navegador para empezar el recorrido de la demo desde cero.

El entorno de participantes tendrá su propio proyecto, servicio, usuarios de base y secretos. Este Blueprint configura exclusivamente el entorno de pruebas.

[Configuración de Render](https://render.com/docs/blueprint-spec) · [Despliegue tras pasar CI](https://render.com/docs/deploys#integrating-with-ci) · [Plan gratuito](https://render.com/docs/free)
