BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'entrevecinos_pilot_app') THEN
    CREATE ROLE entrevecinos_pilot_app LOGIN;
  END IF;
END;
$$;

CREATE SCHEMA IF NOT EXISTS pilot_staging;
REVOKE ALL ON SCHEMA pilot_staging FROM PUBLIC;
GRANT USAGE ON SCHEMA pilot_staging TO entrevecinos_pilot_app;

CREATE TABLE IF NOT EXISTS pilot_staging.cohort (
  id integer PRIMARY KEY CHECK (id = 1),
  invitation_hash text NOT NULL,
  capacity integer NOT NULL CHECK (capacity BETWEEN 1 AND 10),
  closed_at timestamptz,
  expires_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS pilot_staging.participants (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 60),
  notice_version text NOT NULL,
  consent_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pilot_staging.sessions (
  token_hash text PRIMARY KEY,
  participant_id uuid NOT NULL REFERENCES pilot_staging.participants(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS pilot_staging.applications (
  participant_id uuid PRIMARY KEY REFERENCES pilot_staging.participants(id) ON DELETE CASCADE,
  scenario text NOT NULL CHECK (scenario IN ('inventario', 'herramientas', 'transporte')),
  amount_cop integer NOT NULL CHECK (amount_cop IN (200000, 300000, 400000)),
  weeks integer NOT NULL CHECK (weeks IN (4, 8)),
  submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pilot_staging.circles (
  id uuid PRIMARY KEY,
  invitation uuid NOT NULL UNIQUE,
  owner_id uuid NOT NULL UNIQUE REFERENCES pilot_staging.participants(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 60)
);

CREATE TABLE IF NOT EXISTS pilot_staging.circle_responses (
  circle_id uuid NOT NULL REFERENCES pilot_staging.circles(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES pilot_staging.participants(id) ON DELETE CASCADE,
  accepted boolean NOT NULL,
  answered_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (circle_id, participant_id)
);

CREATE TABLE IF NOT EXISTS pilot_staging.feedback (
  participant_id uuid PRIMARY KEY REFERENCES pilot_staging.participants(id) ON DELETE CASCADE,
  ease integer NOT NULL CHECK (ease BETWEEN 1 AND 5),
  comment text NOT NULL CHECK (char_length(comment) <= 500),
  submitted_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON pilot_staging.cohort TO entrevecinos_pilot_app;
-- SELECT FOR UPDATE on the cohort requires an UPDATE grant. The app never modifies it.
GRANT UPDATE (id) ON pilot_staging.cohort TO entrevecinos_pilot_app;
GRANT SELECT, INSERT ON pilot_staging.participants, pilot_staging.applications,
  pilot_staging.circles, pilot_staging.circle_responses TO entrevecinos_pilot_app;
GRANT SELECT, INSERT, DELETE ON pilot_staging.sessions TO entrevecinos_pilot_app;
GRANT SELECT, INSERT, UPDATE ON pilot_staging.feedback TO entrevecinos_pilot_app;

DO $$
DECLARE
  relation text;
BEGIN
  FOREACH relation IN ARRAY ARRAY['cohort', 'participants', 'sessions', 'applications', 'circles', 'circle_responses', 'feedback'] LOOP
    EXECUTE format('ALTER TABLE pilot_staging.%I ENABLE ROW LEVEL SECURITY', relation);
    IF NOT EXISTS (
      SELECT FROM pg_policies WHERE schemaname = 'pilot_staging' AND tablename = relation AND policyname = 'pilot_application'
    ) THEN
      EXECUTE format('CREATE POLICY pilot_application ON pilot_staging.%I TO entrevecinos_pilot_app USING (true) WITH CHECK (true)', relation);
    END IF;
  END LOOP;
END;
$$;

COMMIT;
