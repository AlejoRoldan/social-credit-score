INSERT INTO demo_staging.fixture (id, profiles)
VALUES ('entrevecinos-hu-5-1', ARRAY['Diana', 'Luz'])
ON CONFLICT (id) DO UPDATE SET profiles = EXCLUDED.profiles;
