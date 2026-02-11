import Database from "better-sqlite3";
import path from "path";

const DB_PATH = process.env.SQLITE_PATH || path.join(process.cwd(), "app.db");

const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      address TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      bio TEXT,
      updated_at INTEGER NOT NULL
    );
  `);
}

// Profile helpers

export function getProfile(address) {
  // address should be lowercase
  const stmt = db.prepare(`
    SELECT address, display_name AS displayName, bio, updated_at AS updatedAt
    FROM profiles
    WHERE address = ?
  `);

  return stmt.get(address) || null;
}

export function upsertProfile(address, displayName, bio) {
  const updatedAt = Date.now();

  const stmt = db.prepare(`
    INSERT INTO profiles (address, display_name, bio, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(address) DO UPDATE SET
      display_name = excluded.display_name,
      bio = excluded.bio,
      updated_at = excluded.updated_at
  `);

  stmt.run(address, displayName, bio ?? null, updatedAt);

  return getProfile(address);
}
