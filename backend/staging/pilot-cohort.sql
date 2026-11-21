-- Ejecutar como administrador del proyecto de pruebas una vez, después de pilot.sql.
-- Guardar el código que devuelve la consulta. La base almacena solo su hash.
WITH code AS MATERIALIZED (
  SELECT left(replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''), 48) AS value
), created AS (
  INSERT INTO pilot_staging.cohort (id, invitation_hash, capacity, expires_at)
  SELECT 1, encode(sha256(convert_to(value, 'UTF8')), 'hex'), 10, now() + interval '21 days' FROM code
  ON CONFLICT (id) DO NOTHING
  RETURNING capacity, expires_at
)
SELECT code.value AS codigo_de_inscripcion, created.capacity, created.expires_at
FROM code CROSS JOIN created;
