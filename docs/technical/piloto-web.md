# Piloto web de Entrevecinos

El recorrido en `/piloto` admite hasta diez personas invitadas. Cada persona registra un nombre visible, verifica su correo y acepta el aviso versionado. Las solicitudes son ficticias y usan escenarios, montos y plazos predefinidos. La persona puede crear un círculo e invitar a otras cuentas del piloto y registrar una calificación y un comentario opcional.

## Preparación del entorno

1. En el proyecto Supabase de pruebas, ejecutar [pilot.sql](../../backend/staging/pilot.sql). Configurar una contraseña propia del entorno para `entrevecinos_pilot_app` y guardar su conexión de pooler en modo sesión en el gestor de secretos. Usar `sslmode=verify-full` y la CA de Supabase. El rol de salud de la demo y el rol del piloto son distintos.
2. Configurar SMTP y el flujo de verificación de correo en Supabase Auth. Las plantillas **Magic link or OTP** y **Confirm sign up** deben mostrar `{{ .Token }}`, que es el código que pide la pantalla del piloto. Verificar el primer registro y un ingreso posterior con un correo externo al equipo. Para Gmail, usar una contraseña de aplicación creada en Google con verificación en dos pasos y guardarla en Supabase. [Supabase Auth por correo](https://supabase.com/docs/guides/auth/auth-email-passwordless) · [SMTP](https://supabase.com/docs/guides/auth/auth-smtp) · [Contraseñas de aplicación de Google](https://support.google.com/accounts/answer/185833)
3. Revisar el [aviso del piloto](../../frontend/pilot-privacy.html) antes de publicar, incluida la conservación de hasta 30 días después del cierre. El responsable y el canal de contacto se cargan desde la configuración del servicio. Al cerrar el piloto, el operador elimina los registros de participantes y sus cuentas en Supabase Auth. Las relaciones de PostgreSQL eliminan en cascada el trabajo individual y las sesiones de la cuenta.
4. En Render, además de la configuración del [ADR 004](adr/004-entorno-web-de-pruebas.md), asignar `PILOT_DATABASE_URL`, `SUPABASE_AUTH_URL`, `SUPABASE_PUBLISHABLE_KEY`, `PILOT_PRIVACY_NAME` y `PILOT_PRIVACY_EMAIL`. La clave pública de Auth tiene prefijo `sb_publishable_`. Si se usa un aviso externo, asignar `PILOT_PRIVACY_URL` y su `PILOT_NOTICE_VERSION`. `PILOT_URL` permite fijar el origen HTTPS si se asigna un dominio propio.
5. Ejecutar [pilot-cohort.sql](../../backend/staging/pilot-cohort.sql) en Supabase. Construir la URL de la cohorte con `https://TU-SERVICIO.onrender.com/piloto#inscripcion=CODIGO`. El código dura 21 días. Si se ejecuta otra vez, la consulta conserva la cohorte existente y no vuelve a mostrar el código.

## Prueba antes de compartir

Abrir la URL con dos correos de prueba en teléfonos distintos o sesiones independientes. Verificar ingreso por correo, solicitud ficticia, creación del círculo, aceptación por la otra cuenta, recuperación al recargar y registro de feedback. Abrir `/piloto` en una sesión ajena y confirmar que una persona sin invitación no se registra. Preparar la cohorte con la capacidad disponible para las diez personas y guardar la URL en un canal restringido a ellas.

En el editor SQL del proyecto de pruebas, el equipo de producto puede consultar las respuestas para priorizar ajustes. La consulta devuelve la fecha, la calificación y el comentario sin incluir correos ni nombres.

```sql
SELECT submitted_at, ease, comment
FROM pilot_staging.feedback
ORDER BY submitted_at;
```

Para pausar nuevas altas, el operador puede marcar `closed_at` en la fila `id = 1` de `pilot_staging.cohort`. Las cuentas registradas pueden volver a entrar y conservar su avance.
