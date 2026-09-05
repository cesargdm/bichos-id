-- SQLite counterpart of the Postgres schema.
--
-- jsonb becomes TEXT holding JSON; Kysely's ParseJSONResultsPlugin turns it
-- back into objects on read, so consumers keep seeing the same shape.
-- Timestamps were already stored as ISO-8601 strings, so they carry over as-is.

CREATE TABLE IF NOT EXISTS organisms (
	id TEXT PRIMARY KEY,
	common_name TEXT,
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
