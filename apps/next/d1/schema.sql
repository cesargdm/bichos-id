-- SQLite counterpart of the Postgres schema.
--
-- jsonb becomes TEXT holding JSON; Kysely's ParseJSONResultsPlugin turns it
-- back into objects on read, so consumers keep seeing the same shape.
-- Timestamps were already stored as ISO-8601 strings, so they carry over as-is.

CREATE TABLE IF NOT EXISTS organisms (
	id TEXT PRIMARY KEY,
	common_name TEXT,
	-- Lowercase, accent-stripped copy of common_name. SQLite's LIKE folds case
	-- for ASCII only, so searching accented Spanish names needs both sides
	-- folded in advance; see toSearchText().
	common_name_search TEXT,
	description TEXT,
	habitat TEXT,
	classification TEXT,
	metadata TEXT,
	image_key TEXT,
	image_quality_rating INTEGER,
	taxonomy TEXT,
	scan_count INTEGER NOT NULL DEFAULT 0,
	created_at TEXT,
	updated_at TEXT,
	created_by TEXT
);

CREATE TABLE IF NOT EXISTS organism_scans (
	id TEXT PRIMARY KEY,
	organism_id TEXT NOT NULL,
	image_key TEXT,
	image_quality_rating INTEGER,
	model TEXT,
	created_at TEXT,
	updated_at TEXT,
	created_by TEXT
);

-- getOrganismScans and the scan_count recomputation both filter on this.
CREATE INDEX IF NOT EXISTS organism_scans_organism_id_idx
	ON organism_scans (organism_id);

-- The explore list orders by these; without an index SQLite scans the table,
-- which is what actually consumes D1's rows-read allowance.
CREATE INDEX IF NOT EXISTS organisms_scan_count_idx ON organisms (scan_count DESC);
CREATE INDEX IF NOT EXISTS organisms_created_at_idx ON organisms (created_at DESC);
CREATE INDEX IF NOT EXISTS organisms_common_name_idx ON organisms (common_name);
CREATE INDEX IF NOT EXISTS organisms_common_name_search_idx
	ON organisms (common_name_search);

-- Fold common_name the way toSearchText() does, as far as SQLite can.
-- SQLite has no Unicode NFD and lower() is ASCII-only, so the accented
-- Spanish letters have to be listed in both cases. New inserts from the
-- app still write the JS value; this is what a restore, a Postgres copy,
-- or a forgotten insert can rely on instead of leaving the column NULL.
--
-- The expression is duplicated in the triggers and the UPDATE: D1 has no
-- user-defined functions to share it.
--
-- Keep the replacements in sync with the letters toSearchText() would
-- strip from this catalogue's names.

CREATE TRIGGER IF NOT EXISTS organisms_common_name_search_on_insert
AFTER INSERT ON organisms
FOR EACH ROW
WHEN NEW.common_name_search IS NULL AND NEW.common_name IS NOT NULL
BEGIN
	UPDATE organisms
	SET common_name_search = lower(trim(
		replace(replace(replace(replace(replace(replace(replace(
		replace(replace(replace(replace(replace(replace(replace(
			NEW.common_name,
			'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ü', 'u'), 'ñ', 'n'),
			'Á', 'a'), 'É', 'e'), 'Í', 'i'), 'Ó', 'o'), 'Ú', 'u'), 'Ü', 'u'), 'Ñ', 'n')
	))
	WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS organisms_common_name_search_on_name_update
AFTER UPDATE OF common_name ON organisms
FOR EACH ROW
BEGIN
	UPDATE organisms
	SET common_name_search = CASE
		WHEN NEW.common_name IS NULL THEN NULL
		ELSE lower(trim(
			replace(replace(replace(replace(replace(replace(replace(
			replace(replace(replace(replace(replace(replace(replace(
				NEW.common_name,
				'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ü', 'u'), 'ñ', 'n'),
				'Á', 'a'), 'É', 'e'), 'Í', 'i'), 'Ó', 'o'), 'Ú', 'u'), 'Ü', 'u'), 'Ñ', 'n')
		))
	END
	WHERE id = NEW.id;
END;

-- Idempotent: production was already backfilled with toSearchText(), so
-- this matches nothing there. Re-running schema.sql against a restore that
-- skipped the column still fills the gaps.
UPDATE organisms
SET common_name_search = lower(trim(
	replace(replace(replace(replace(replace(replace(replace(
	replace(replace(replace(replace(replace(replace(replace(
		common_name,
		'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ü', 'u'), 'ñ', 'n'),
		'Á', 'a'), 'É', 'e'), 'Í', 'i'), 'Ó', 'o'), 'Ú', 'u'), 'Ü', 'u'), 'Ñ', 'n')
))
WHERE common_name_search IS NULL AND common_name IS NOT NULL;
