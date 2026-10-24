CREATE TABLE contributors (id TEXT PRIMARY KEY NOT NULL, quota_key TEXT UNIQUE NOT NULL, name TEXT NOT NULL DEFAULT '', listed INTEGER NOT NULL DEFAULT 0, recovery_hash TEXT UNIQUE, created_ms INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE contributor_sessions (session_id TEXT PRIMARY KEY NOT NULL, contributor_id TEXT NOT NULL REFERENCES contributors(id));
--> statement-breakpoint
ALTER TABLE events ADD COLUMN contributor_id TEXT REFERENCES contributors(id);
--> statement-breakpoint
ALTER TABLE events ADD COLUMN impact_score INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE events ADD COLUMN evolution_score INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE events ADD COLUMN region INTEGER;
--> statement-breakpoint
CREATE INDEX events_contributor_time ON events(contributor_id,created_ms);
--> statement-breakpoint
CREATE INDEX contributors_listed ON contributors(listed,id);
