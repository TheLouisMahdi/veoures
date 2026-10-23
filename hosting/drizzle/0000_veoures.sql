CREATE TABLE settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE sessions (id TEXT PRIMARY KEY NOT NULL, network TEXT NOT NULL, created_ms INTEGER NOT NULL, expires_ms INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX sessions_network ON sessions (network);
--> statement-breakpoint
CREATE TABLE events (
  version INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  id TEXT UNIQUE NOT NULL,
  visitor TEXT NOT NULL,
  network TEXT NOT NULL,
  request_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  created_ms INTEGER NOT NULL,
  type TEXT NOT NULL,
  payload TEXT NOT NULL,
  UNIQUE(visitor, request_id)
);
--> statement-breakpoint
CREATE INDEX events_visitor_day ON events (visitor, created_at);
--> statement-breakpoint
CREATE INDEX events_network_day ON events (network, created_at);
--> statement-breakpoint
CREATE INDEX events_network_rate ON events (network, created_ms);
