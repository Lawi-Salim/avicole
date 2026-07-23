ALTER TABLE remises_configuration
ADD COLUMN IF NOT EXISTS mode_remise text CHECK (mode_remise IN ('type_client', 'volume', 'aucun'));

INSERT INTO remises_configuration (type_client, seuil_min_quantite, seuil_max_quantite, remise_pct, actif, mode_remise)
VALUES (NULL, NULL, NULL, 0, true, 'type_client')
ON CONFLICT DO NOTHING;

UPDATE remises_configuration
SET mode_remise = 'type_client'
WHERE type_client IS NULL AND seuil_min_quantite IS NULL;
