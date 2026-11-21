BEGIN;

CREATE SCHEMA IF NOT EXISTS demo_staging;
REVOKE ALL ON SCHEMA demo_staging FROM PUBLIC;

CREATE TABLE IF NOT EXISTS demo_staging.fixture (
  id text PRIMARY KEY,
  profiles text[] NOT NULL,
  CHECK (id = 'entrevecinos-hu-5-1')
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'entrevecinos_staging_reader') THEN
    CREATE ROLE entrevecinos_staging_reader LOGIN;
  END IF;
END;
$$;

REVOKE ALL ON demo_staging.fixture FROM PUBLIC, entrevecinos_staging_reader;
GRANT USAGE ON SCHEMA demo_staging TO entrevecinos_staging_reader;
GRANT SELECT ON demo_staging.fixture TO entrevecinos_staging_reader;

ALTER TABLE demo_staging.fixture ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'demo_staging' AND tablename = 'fixture' AND policyname = 'staging_reader_select'
  ) THEN
    CREATE POLICY staging_reader_select ON demo_staging.fixture
      FOR SELECT TO entrevecinos_staging_reader USING (true);
  END IF;
END;
$$;

COMMIT;
