CREATE TABLE IF NOT EXISTS remises_configuration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_client text,
  seuil_min_quantite integer,
  seuil_max_quantite integer,
  remise_pct numeric(5,2) NOT NULL DEFAULT 0,
  actif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT remises_type_client_check CHECK (type_client IN (
    'menage', 'restaurant', 'hotel', 'boucherie', 'revendeur'
  )),
  CONSTRAINT remises_seuil_coherent CHECK (
    (seuil_min_quantite IS NULL AND seuil_max_quantite IS NULL) OR
    (seuil_min_quantite IS NOT NULL AND seuil_max_quantite IS NOT NULL AND seuil_min_quantite <= seuil_max_quantite)
  )
);

CREATE INDEX IF NOT EXISTS remises_type_client_idx ON remises_configuration(type_client) WHERE actif = true;
CREATE INDEX IF NOT EXISTS remises_volume_idx ON remises_configuration(seuil_min_quantite, seuil_max_quantite) WHERE actif = true;

INSERT INTO remises_configuration (type_client, remise_pct) VALUES
  ('menage', 0),
  ('restaurant', 5),
  ('hotel', 10),
  ('boucherie', 7),
  ('revendeur', 15)
ON CONFLICT DO NOTHING;

INSERT INTO remises_configuration (seuil_min_quantite, seuil_max_quantite, remise_pct) VALUES
  (1, 50, 0),
  (51, 100, 5),
  (101, 999999, 10)
ON CONFLICT DO NOTHING;

DROP TRIGGER IF EXISTS remises_set_updated_at ON remises_configuration;
CREATE TRIGGER remises_set_updated_at
BEFORE UPDATE ON remises_configuration
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
